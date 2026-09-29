package org.jobportal.profileservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.jobportal.profileservice.dto.ApiResponse;
import org.jobportal.profileservice.dto.CandidateProfileDto;
import org.jobportal.profileservice.dto.RecruiterProfileDto;
import org.jobportal.profileservice.entity.Role;
import org.jobportal.profileservice.entity.UserProfile;
import org.jobportal.profileservice.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class ProfileResource {
    private final ProfileService  profileService;
    private final ObjectMapper objectMapper;

    @Autowired
    public ProfileResource(ProfileService profileService, ObjectMapper objectMapper) {
        this.profileService = profileService;
        this.objectMapper = objectMapper;
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @PostMapping("/candidate/add")
    public ResponseEntity<ApiResponse<UserProfile>> addCandidateProfile(@Valid @RequestBody CandidateProfileDto candidateProfileDto, Authentication authentication) {
        candidateProfileDto.setEmail(authentication.getName());

        UserProfile userProfile = profileService.addCandidateProfile(candidateProfileDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Candidate Profile Added Successfully", userProfile));
    }

    @PreAuthorize("hasRole('RECRUITER')")
    @PostMapping("/recruiter/add")
    public ResponseEntity<ApiResponse<UserProfile>> addRecruiterProfile(@Valid @RequestBody RecruiterProfileDto recruiterProfileDto, Authentication authentication) {
        recruiterProfileDto.setEmail(authentication.getName());
        UserProfile userProfile = profileService.addRecruiterProfile(recruiterProfileDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Recruiter Profile Added Successfully", userProfile));
    }

//    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/")
    public ResponseEntity<ApiResponse<List<UserProfile>>> getAll() {
        List<UserProfile> userProfiles = profileService.getAllProfiles();
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "Collected all users profile", userProfiles));
    }

    @GetMapping("/id/{userId}")
    public ResponseEntity<ApiResponse<UserProfile>> getUserProfileByUserId(@PathVariable Long userId) {
        UserProfile userProfile = profileService.getProfileById(userId);
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "User Profile Found", userProfile));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserProfile>> getUserProfileByEmail(@PathVariable String email) {
        UserProfile userProfile = profileService.getProfileByEmail(email);
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "User Profile Found", userProfile));
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<UserProfile>> updateUserProfile(Authentication authentication, @RequestBody Map<String, Object> payload) {
        if(authentication == null || !authentication.isAuthenticated()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(false, "Recruiter Not Found", null));
        }

        String email = authentication.getName();
        UserProfile existing = profileService.getProfileByEmail(email);

        UserProfile updated;

        if (existing.getRole() == Role.CANDIDATE) {
            CandidateProfileDto dto = objectMapper.convertValue(payload, CandidateProfileDto.class);
            updated = profileService.updateProfile(existing.getProfileId(), dto);
        } else {
            RecruiterProfileDto dto = objectMapper.convertValue(payload, RecruiterProfileDto.class);
            updated = profileService.updateProfile(existing.getProfileId(), dto);
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "Updated", updated));
    }

//    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{userId}")
    public  ResponseEntity<ApiResponse<?>> deleteUserProfile(@PathVariable Long userId) {
        profileService.deleteProfile(userId);
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "User Profile Deleted"));
    }
}
