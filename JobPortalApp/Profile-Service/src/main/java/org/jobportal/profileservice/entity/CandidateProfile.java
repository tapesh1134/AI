package org.jobportal.profileservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@SuperBuilder
public class CandidateProfile extends UserProfile{
    @Past(message = "DOB must be in the past")
    private LocalDate dob;
    @Column(nullable = false)
    private String gender;
    @ElementCollection
    @Size(min = 1, message = "At least one skill required")
    private List<String> skills;
    @Min(value = 0)
    @Max(value = 50)
    @Column(nullable = false)
    private Integer experience;
    private String resumeUrl;
}
