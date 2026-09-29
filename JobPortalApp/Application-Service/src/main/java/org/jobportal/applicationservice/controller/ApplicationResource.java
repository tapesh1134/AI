package org.jobportal.applicationservice.controller;

import org.jobportal.applicationservice.dto.ApiResponse;
import org.jobportal.applicationservice.dto.ApplicationDto;
import org.jobportal.applicationservice.entity.Application;
import org.jobportal.applicationservice.entity.ApplicationStatus;
import org.jobportal.applicationservice.service.ApplicationService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/application")
public class ApplicationResource {
    private final ApplicationService applicationService;
    private final RabbitTemplate rabbitTemplate;

    @Autowired
    public ApplicationResource(ApplicationService applicationService,  RabbitTemplate rabbitTemplate) {
        this.applicationService = applicationService;
        this.rabbitTemplate = rabbitTemplate;
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<Application>> submit(Authentication authentication, @RequestBody ApplicationDto applicationDto) {
        Application application = applicationService.submitApplication(authentication.getName(), applicationDto);

        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put("userEmail", authentication.getName());
        notificationData.put("type", "APPLICATION_SUBMITTED");
        notificationData.put("message",
                "Your application for Job ID " + application.getJobId() +
                        " has been successfully submitted on " + application.getAppliedAt() +
                        ". Current status: " + application.getStatus() +
                        ". You’ll be notified about further updates.");
        notificationData.put("isRead", false);

        // Send to RabbitMQ
        rabbitTemplate.convertAndSend(
                "notification_exchange",
                "notification_routing_key",
                notificationData
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "application submitted", application));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<Application>>> getByCandidate(Authentication authentication) {
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "Applications fetched", applicationService.getByCandidateEmail(authentication.getName())));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<ApiResponse<List<Application>>> getByJobId(@PathVariable Long jobId) {
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "Applications fetched", applicationService.getByJobId(jobId)));
    }

    private String getMessageByStatus(ApplicationStatus status) {
        String message;

        switch (status) {
            case APPLIED:
                message = "Your application has been submitted successfully.";
                break;

            case SHORTLISTED:
                message = "Good news! You have been shortlisted for the job. Stay tuned for next steps.";
                break;

            case INTERVIEW_SCHEDULED:
                message = "Your interview has been scheduled. Please check your email or dashboard for details.";
                break;

            case OFFERED:
                message = "Congratulations! You have received a job offer. Please review and respond soon.";
                break;

            case REJECTED:
                message = "We regret to inform you that your application was not selected this time.";
                break;

            case WITHDRAWN:
                message = "Your application has been withdrawn successfully.";
                break;

            default:
                message = "Your application status has been updated.";
        }
        return message;
    }

    @PutMapping("/{applicationId}/status")
    public ResponseEntity<ApiResponse<?>> updateStatus(@PathVariable Long applicationId, @RequestParam ApplicationStatus status) {
        applicationService.updateStatus(applicationId, status);

        Application application = applicationService.getApplicationById(applicationId);
        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put("userEmail", application.getCandidateEmail());
        notificationData.put("type", "APPLICATION_STATUS_UPDATED");
        notificationData.put("message", getMessageByStatus(status));
        notificationData.put("isRead", false);

        // Send to RabbitMQ
        rabbitTemplate.convertAndSend(
                "notification_exchange",
                "notification_routing_key",
                notificationData
        );

        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "Status Updated"));
    }

    @PutMapping("/{applicationId}/withdraw")
    public ResponseEntity<ApiResponse<?>> withdraw(@PathVariable Long applicationId, Authentication authentication) {
        applicationService.withdrawApplication(applicationId, authentication.getName());
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "Applications withdrawn"));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<Application>>> getByStatus(@PathVariable ApplicationStatus status) {
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "Applications Fetched By Status", applicationService.getApplicationByStatus(status)));
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<ApiResponse<Application>> getApplicationById(@PathVariable Long applicationId) {
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "Application fetched", applicationService.getApplicationById(applicationId)));
    }
}
