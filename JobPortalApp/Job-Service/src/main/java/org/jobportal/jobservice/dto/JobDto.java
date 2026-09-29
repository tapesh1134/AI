package org.jobportal.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.jobportal.jobservice.entity.JobStatus;
import org.jobportal.jobservice.entity.JobType;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class JobDto {
    private String title;
    private String category;
    private JobType type;
    private String location;
    private Double salaryMin;
    private Double salaryMax;
    private List<String> skills;
    private Long experienceRequired;
    private JobStatus status;
}