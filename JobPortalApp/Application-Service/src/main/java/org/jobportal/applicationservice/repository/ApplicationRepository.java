package org.jobportal.applicationservice.repository;

import org.jobportal.applicationservice.entity.Application;
import org.jobportal.applicationservice.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Optional<List<Application>> findByCandidateEmail(String email);
    Optional<List<Application>> findByJobId(Long id);
    Optional<List<Application>> findByStatus(ApplicationStatus status);
    Optional<Application> findFirstByJobIdAndCandidateEmail(Long id, String email);
    int countByJobId(Long id);
}
