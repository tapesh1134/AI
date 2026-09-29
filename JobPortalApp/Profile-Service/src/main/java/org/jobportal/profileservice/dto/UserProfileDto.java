package org.jobportal.profileservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.jobportal.profileservice.entity.Role;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class UserProfileDto {
    private String fullName;
    private String email;
    private AddressDto address;
    private Role role;
    private Long mobile;
}