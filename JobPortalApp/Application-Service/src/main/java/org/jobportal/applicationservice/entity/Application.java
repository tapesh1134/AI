package org.jobportal.applicationservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long applicationId;
    @Column(nullable = false)
    private Long jobId;
    @Column(nullable = false)
    private String candidateEmail;
    private LocalDate appliedAt;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;
    private String coverLetter;
    @Column(nullable = false)
    private String resumeUrl;

    @PrePersist
    public void prePersist() {
        appliedAt = LocalDate.now();
    }
}
