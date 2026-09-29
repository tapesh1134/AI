package org.jobportal.profileservice.service;

import org.jobportal.profileservice.dto.CandidateProfileDto;
import org.jobportal.profileservice.dto.RecruiterProfileDto;
import org.jobportal.profileservice.dto.UserProfileDto;
import org.jobportal.profileservice.entity.Role;
import org.jobportal.profileservice.entity.UserProfile;

import java.util.List;

public interface ProfileService {
    UserProfile addCandidateProfile(CandidateProfileDto dto);
    UserProfile addRecruiterProfile(RecruiterProfileDto dto);
    UserProfile updateProfile(Long id, RecruiterProfileDto dto);
    UserProfile updateProfile(Long id, CandidateProfileDto dto);
    void deleteProfile(Long id);
    UserProfile getProfileById(Long id);
    UserProfile getProfileByEmail(String email);
    List<UserProfile> getAllProfiles();
    List<UserProfile> getProfilesByRole(Role role);
}
