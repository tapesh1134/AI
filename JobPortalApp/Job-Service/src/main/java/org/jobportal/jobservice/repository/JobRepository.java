package org.jobportal.jobservice.repository;

import org.jobportal.jobservice.entity.Job;
import org.jobportal.jobservice.entity.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    Optional<List<Job>> findByTitle(String title);
    Optional<List<Job>> findByCategory(String category);
    Optional<List<Job>> findByLocation(String location);
    Optional<List<Job>> findByPostedBy(String postedBy);
    Optional<List<Job>> findByStatus(JobStatus status);
    @Query(value = "SELECT * FROM job j WHERE " +
            "(:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:category IS NULL OR j.category = :category) AND " +
            "(:location IS NULL OR j.location = :location) AND " +
            "(:minSalary IS NULL OR j.salary_max >= :minSalary) AND " +
            "(:maxSalary IS NULL OR j.salary_min <= :maxSalary) AND " +
            "(:experienceRequired IS NULL OR j.experience_required <= :experienceRequired)",
            nativeQuery = true)
    List<Job> searchJobs(String title, String category, String location, Double minSalary, Double maxSalary, Long experienceRequired);
}
