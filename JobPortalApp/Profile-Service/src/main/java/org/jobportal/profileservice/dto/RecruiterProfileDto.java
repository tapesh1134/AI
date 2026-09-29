package org.jobportal.profileservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class RecruiterProfileDto extends UserProfileDto {
    private String companyName;
    private String companySize;
    private String industry;
    private String website;
}