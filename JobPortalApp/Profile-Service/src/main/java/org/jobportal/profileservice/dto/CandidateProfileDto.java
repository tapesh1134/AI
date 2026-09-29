package org.jobportal.profileservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfileDto extends UserProfileDto {
    private LocalDate dob;
    private String gender;
    private List<String> skills;
    private Integer experience;
    private String resumeUrl;
}