package org.jobportal.profileservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class RecruiterProfile extends  UserProfile{
    @Column(nullable = false, length = 150)
    private String companyName;
    @Column(nullable = false)
    private String companySize;
    @Column(nullable = false)
    private String industry;
    @Pattern(regexp = "^(http|https)://.*$", message = "Website must be valid")
    @Column(nullable = false)
    private String website;
}
