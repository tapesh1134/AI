package org.jobportal.jobservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long jobId;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false)
    private String category;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobType type;
    @Column(nullable = false)
    private String location;
    @Column(nullable = false)
    private Double salaryMin;
    @Column(nullable = false)
    private Double salaryMax;
    @ElementCollection
    @CollectionTable(name = "job_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill", nullable = false)
    private List<String> skills;
    @Column(nullable = false)
    private Long experienceRequired;
    @Column(nullable = false)
    private String postedBy;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status;
    private LocalDateTime postedAt;

    @PrePersist
    public void prePersist() {
        postedAt = LocalDateTime.now();
    }
}
