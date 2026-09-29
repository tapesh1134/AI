package org.jobportal.jobservice.service;

import org.jobportal.jobservice.dto.JobDto;
import org.jobportal.jobservice.entity.Job;

import java.util.List;

public interface JobService {
    void addJob(String postedBy, JobDto dto);
    List<Job> getAllJobs();
    Job getJobById(Long id);
    Job updateJob(Long jobId, JobDto dto);
    void deleteJob(Long id);
    List<Job> getJobsByCategory(String category);
    List<Job> getJobsByLocation(String location);
    List<Job> searchJobs(String title, String category, String location, Double minSalary, Double maxSalary, Long experienceRequired);
}
