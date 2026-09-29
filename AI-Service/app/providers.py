import json
import math
import time
import httpx
from fastapi import HTTPException
from .config import get_settings


def endpoint(base, path):
    if not base:
        raise HTTPException(503, 'The model provider URL is not configured.')
    return base.rstrip('/') + ('/' + path.lstrip('/') if path else '')


def post_json(url, key, header, prefix, payload):
    headers = {header: prefix + key} if key else {}
    for attempt in range(2):
        try:
            with httpx.Client(timeout=get_settings().provider_timeout, follow_redirects=False) as client:
                response = client.post(url, json=payload, headers=headers)
            if response.status_code in {429, 502, 503, 504} and attempt == 0:
                time.sleep(0.4)
                continue
            if response.status_code in {401, 403}:
                raise HTTPException(502, 'Model provider denied access. Check its API key, model permissions and endpoint.')
            if response.is_error:
                raise HTTPException(502, f'Model provider returned HTTP {response.status_code}. Check API format and model settings.')
            return response.json()
        except (httpx.HTTPError, ValueError):
            if attempt == 1:
                raise HTTPException(502, 'Model provider timed out, could not be reached, or returned invalid JSON.') from None
    raise HTTPException(502, 'Model provider is unavailable.')


class Provider:
    def chat(self, messages, tools=None, tool_choice=None):
        s = get_settings()
        if not s.llm_model:
            raise HTTPException(503, 'Configure LLM_MODEL first.')
        payload = {**s.llm_extra_body, 'model': s.llm_model, 'messages': messages}
        if tools:
            payload.update(tools=tools, tool_choice=tool_choice or 'auto')
        data = post_json(endpoint(s.llm_base_url, s.llm_chat_path), s.llm_api_key,
                         s.llm_auth_header, s.llm_auth_prefix, payload)
        try:
            message = data['choices'][0]['message']
            if not isinstance(message, dict):
                raise ValueError()
            return message
        except (KeyError, IndexError, TypeError, ValueError):
            raise HTTPException(502, 'Expected an OpenAI-compatible chat completions response.') from None

    def embed(self, value):
        s = get_settings()
        if not s.embedding_model:
            raise HTTPException(503, 'Configure EMBEDDING_MODEL and EMBEDDING_BASE_URL for semantic search.')
        if s.embedding_format == 'titan':
            payload = {'model': s.embedding_model, 'inputText': value}
        else:
            payload = {'model': s.embedding_model, 'input': value}
        if s.embedding_send_dimensions:
            payload['dimensions'] = s.embedding_dimensions
        payload.update(s.embedding_extra_body)
        data = post_json(endpoint(s.embedding_base_url, s.embedding_path), s.embedding_api_key,
                         s.embedding_auth_header, s.embedding_auth_prefix, payload)
        try:
            raw = data['embedding'] if s.embedding_format == 'titan' else data['data'][0]['embedding']
            vector = [float(v) for v in raw]
            if len(vector) != s.embedding_dimensions or not all(math.isfinite(v) for v in vector) or not any(vector):
                raise ValueError()
            return vector
        except (KeyError, IndexError, TypeError, ValueError):
            raise HTTPException(502, 'Embedding response is invalid or dimensions do not match EMBEDDING_DIMENSIONS.') from None


def parse_json(content):
    value = (content or '').strip()
    if value.startswith('```'):
        value = value.split('\n', 1)[-1].rsplit('```', 1)[0]
    return json.loads(value)
