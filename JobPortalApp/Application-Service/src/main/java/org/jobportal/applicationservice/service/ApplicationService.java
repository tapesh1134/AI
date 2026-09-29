package org.jobportal.applicationservice.service;

import org.jobportal.applicationservice.dto.ApplicationDto;
import org.jobportal.applicationservice.entity.Application;
import org.jobportal.applicationservice.entity.ApplicationStatus;

import java.util.List;

public interface ApplicationService {
    Application submitApplication(String candidateEmail, ApplicationDto dto);
    List<Application> getByCandidateEmail(String candidateEmail);
    List<Application> getByJobId(Long jobId);
    void updateStatus(Long id, ApplicationStatus status);
    void withdrawApplication(Long id, String candidateEmail);
    Application getApplicationById(Long id);
    List<Application> getApplicationByStatus(ApplicationStatus status);
    int countByJobId(Long id);
}
