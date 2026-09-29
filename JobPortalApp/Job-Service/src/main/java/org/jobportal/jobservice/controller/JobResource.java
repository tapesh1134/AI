package org.jobportal.jobservice.controller;

import org.jobportal.jobservice.dto.ApiResponse;
import org.jobportal.jobservice.dto.JobDto;
import org.jobportal.jobservice.entity.Job;
import org.jobportal.jobservice.service.JobService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/jobs")
public class JobResource {
    private final JobService jobService;
    private final RabbitTemplate rabbitTemplate;

    @Autowired
    public JobResource(JobService jobService, RabbitTemplate rabbitTemplate) {
        this.jobService = jobService;
        this.rabbitTemplate = rabbitTemplate;
    }

    @GetMapping()
    public ResponseEntity<ApiResponse<List<Job>>> getJobs() {
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "All Jobs Fetched", jobService.getAllJobs()));
    }

    @PreAuthorize("hasRole('RECRUITER')")
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<?>> addJob(Authentication authentication, @RequestBody JobDto dto) {
        String message = "Your job posting for '" + dto.getTitle() + "' has been successfully published in " + dto.getCategory() + " category at " + dto.getLocation() + ".";
        Map<String, Object> recruiterNotification = new HashMap<>();
        recruiterNotification.put("userEmail", authentication.getName());
        recruiterNotification.put("type", "JOB_POST");
        recruiterNotification.put("message", message);
        recruiterNotification.put("isRead", false);

        rabbitTemplate.convertAndSend(
                "notification_exchange",
                "notification_routing_key",
                recruiterNotification
        );
        jobService.addJob(authentication.getName(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Job Posted"));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<ApiResponse<Job>> getJob(@PathVariable Long jobId) {
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "Job Fetched", jobService.getJobById(jobId)));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<Job>>> getJobsByCategory(@PathVariable String category) {
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "Job Fetched", jobService.getJobsByCategory(category)));
    }

    @GetMapping("/location/{location}")
    public ResponseEntity<ApiResponse<List<Job>>> getJobsByLocation(@PathVariable String location) {
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "Job Fetched", jobService.getJobsByLocation(location)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Job>>> searchJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double minSalary,
            @RequestParam(required = false) Double maxSalary,
            @RequestParam(required = false) Long experienceRequired
    ) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Job Fetched", jobService.searchJobs(title, category, location, minSalary, maxSalary, experienceRequired)));
    }

    @PreAuthorize("hasRole('RECRUITER')")
    @PutMapping("/{jobId}")
    public ResponseEntity<ApiResponse<?>> updateJob(@PathVariable Long jobId, @RequestBody JobDto dto, Authentication authentication) {
        String message = "Your job posting '" + dto.getTitle() + "' has been updated successfully.";
        Map<String, Object> recruiterNotification = new HashMap<>();
        recruiterNotification.put("userEmail", authentication.getName());
        recruiterNotification.put("type", "UPDATE_JOB_POST");
        recruiterNotification.put("message", message);
        recruiterNotification.put("isRead", false);

        rabbitTemplate.convertAndSend(
                "notification_exchange",
                "notification_routing_key",
                recruiterNotification
        );
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "Job Updated", jobService.updateJob(jobId, dto)));
    }

    @PreAuthorize("hasRole('RECRUITER')")
    @DeleteMapping("/{jobId}")
    public ResponseEntity<ApiResponse<?>> deleteJob(@PathVariable Long jobId) {
        jobService.deleteJob(jobId);
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "Job Deleted"));
    }
}
