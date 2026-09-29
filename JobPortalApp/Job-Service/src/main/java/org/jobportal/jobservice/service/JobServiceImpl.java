package org.jobportal.jobservice.service;

import jakarta.transaction.Transactional;
import org.jobportal.jobservice.dto.JobDto;
import org.jobportal.jobservice.entity.Job;
import org.jobportal.jobservice.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobServiceImpl implements JobService {
    private final JobRepository jobRepository;

    @Autowired
    public JobServiceImpl(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    private void validateJobDto(JobDto dto) {
        if (dto.getTitle() == null || dto.getTitle().isBlank()) throw new IllegalArgumentException("Title is required");
        if (dto.getCategory() == null || dto.getCategory().isBlank()) throw new IllegalArgumentException("Category is required");
        if (dto.getLocation() == null || dto.getLocation().isBlank()) throw new IllegalArgumentException("Location is required");
        if (dto.getSalaryMin() != null && dto.getSalaryMin() < 0) throw new IllegalArgumentException("Minimum salary cannot be negative");
        if (dto.getSalaryMin() != null && dto.getSalaryMax() != null && dto.getSalaryMin() > dto.getSalaryMax()) throw new IllegalArgumentException("Min salary cannot be greater than max salary");
        if (dto.getExperienceRequired() != null && dto.getExperienceRequired() < 0) throw new IllegalArgumentException("Experience cannot be negative");
    }

    @Override
    public void addJob(String postedBy, JobDto dto) {
        validateJobDto(dto);

        Job job = Job.builder()
                .title(dto.getTitle())
                .category(dto.getCategory())
                .type(dto.getType())
                .location(dto.getLocation())
                .salaryMin(dto.getSalaryMin())
                .salaryMax(dto.getSalaryMax())
                .skills(dto.getSkills())
                .experienceRequired(dto.getExperienceRequired())
                .postedBy(postedBy)
                .status(dto.getStatus())
                .build();

        jobRepository.save(job);
    }

    @Override
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    @Override
    public Job getJobById(Long id) {
        return jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job Post Not Found"));
    }

    @Override
    public Job updateJob(Long jobId, JobDto dto) {
        validateJobDto(dto);

        Job existingJob = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        if (dto.getTitle() != null) existingJob.setTitle(dto.getTitle());
        if (dto.getCategory() != null) existingJob.setCategory(dto.getCategory());
        if (dto.getType() != null) existingJob.setType(dto.getType());
        if (dto.getLocation() != null) existingJob.setLocation(dto.getLocation());
        if (dto.getSalaryMin() != null) existingJob.setSalaryMin(dto.getSalaryMin());
        if (dto.getSalaryMax() != null) existingJob.setSalaryMax(dto.getSalaryMax());
        if (dto.getSkills() != null) existingJob.setSkills(dto.getSkills());
        if (dto.getExperienceRequired() != null) existingJob.setExperienceRequired(dto.getExperienceRequired());
        if (dto.getStatus() != null) existingJob.setStatus(dto.getStatus());

        return jobRepository.save(existingJob);
    }

    @Override
    @Transactional
    public void deleteJob(Long id) {
        if(jobRepository.findById(id).isEmpty()) throw new RuntimeException("Job Not Found");
        jobRepository.deleteById(id);
    }

    @Override
    public List<Job> getJobsByCategory(String category) {
        return jobRepository.findByCategory(category).orElse(null);
    }

    @Override
    public List<Job> getJobsByLocation(String location) {
        return jobRepository.findByLocation(location).orElse(null);
    }

    @Override
    public List<Job> searchJobs(String title, String category, String location, Double minSalary, Double maxSalary, Long experienceRequired) {
        return jobRepository.searchJobs(title, category, location, minSalary, maxSalary, experienceRequired);
    }
}
