package org.jobportal.profileservice.service;

import lombok.RequiredArgsConstructor;
import org.jobportal.profileservice.dto.CandidateProfileDto;
import org.jobportal.profileservice.dto.RecruiterProfileDto;
import org.jobportal.profileservice.dto.UserProfileDto;
import org.jobportal.profileservice.entity.*;
import org.jobportal.profileservice.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository repository;

    @Autowired
    public ProfileServiceImpl(ProfileRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserProfile addCandidateProfile(CandidateProfileDto dto) {

        Address address = Address.builder()
                .houseNo(dto.getAddress().getHouseNo())
                .street(dto.getAddress().getStreet())
                .city(dto.getAddress().getCity())
                .state(dto.getAddress().getState())
                .pincode(dto.getAddress().getPincode())
                .build();

        CandidateProfile candidate = CandidateProfile.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .mobile(dto.getMobile())
                .address(address)
                .role(Role.CANDIDATE)
                .dob(dto.getDob())
                .gender(dto.getGender())
                .skills(dto.getSkills())
                .experience(dto.getExperience())
                .resumeUrl(dto.getResumeUrl())
                .build();

        return repository.save(candidate);
    }

    @Override
    public UserProfile addRecruiterProfile(RecruiterProfileDto dto) {

        Address address = Address.builder()
                .houseNo(dto.getAddress().getHouseNo())
                .street(dto.getAddress().getStreet())
                .city(dto.getAddress().getCity())
                .state(dto.getAddress().getState())
                .pincode(dto.getAddress().getPincode())
                .build();

        RecruiterProfile recruiter = RecruiterProfile.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .mobile(dto.getMobile())
                .address(address)
                .role(Role.RECRUITER)
                .companyName(dto.getCompanyName())
                .companySize(dto.getCompanySize())
                .industry(dto.getIndustry())
                .website(dto.getWebsite())
                .build();

        return repository.save(recruiter);
    }

    @Override
    public UserProfile updateProfile(Long id, RecruiterProfileDto dto) {
        RecruiterProfile existing = (RecruiterProfile) repository.findById(id).orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));

        // Update common fields safely
        if (dto.getFullName() != null) existing.setFullName(dto.getFullName());
        if (dto.getMobile() != null) existing.setMobile(dto.getMobile());

        // Address update (merge, not replace)
        if (dto.getAddress() != null) {
            Address addr = existing.getAddress() != null ? existing.getAddress() : new Address();

            if (dto.getAddress().getHouseNo() != null) addr.setHouseNo(dto.getAddress().getHouseNo());
            if (dto.getAddress().getStreet() != null) addr.setStreet(dto.getAddress().getStreet());
            if (dto.getAddress().getCity() != null) addr.setCity(dto.getAddress().getCity());
            if (dto.getAddress().getState() != null) addr.setState(dto.getAddress().getState());
            if (dto.getAddress().getPincode() > 0) addr.setPincode(dto.getAddress().getPincode());
            existing.setAddress(addr);
        }

        if (dto.getCompanyName() != null) existing.setCompanyName(dto.getCompanyName());
        if (dto.getCompanySize() != null) existing.setCompanySize(dto.getCompanySize());
        if (dto.getIndustry() != null) existing.setIndustry(dto.getIndustry());
        if (dto.getWebsite() != null) existing.setWebsite(dto.getWebsite());
        return repository.save(existing);
    }

    @Override
    public UserProfile updateProfile(Long id, CandidateProfileDto dto){
        CandidateProfile existing = (CandidateProfile) repository.findById(id).orElseThrow(() -> new RuntimeException("Profile not found"));

        // Common fields
        if (dto.getFullName() != null) existing.setFullName(dto.getFullName());
        if (dto.getMobile() != null) existing.setMobile(dto.getMobile());

        if (dto.getAddress() != null) {
            Address addr = existing.getAddress() != null ? existing.getAddress() : new Address();
            if (dto.getAddress().getHouseNo() != null) addr.setHouseNo(dto.getAddress().getHouseNo());
            if (dto.getAddress().getStreet() != null) addr.setStreet(dto.getAddress().getStreet());
            if (dto.getAddress().getCity() != null) addr.setCity(dto.getAddress().getCity());
            if (dto.getAddress().getState() != null) addr.setState(dto.getAddress().getState());
            if (dto.getAddress().getPincode() > 0) addr.setPincode(dto.getAddress().getPincode());
            existing.setAddress(addr);
        }

        // Candidate-specific fields
        if (dto.getDob() != null) existing.setDob(dto.getDob());
        if (dto.getGender() != null) existing.setGender(dto.getGender());
        if (dto.getSkills() != null) existing.setSkills(dto.getSkills());
        if (dto.getExperience() != null) existing.setExperience(dto.getExperience());
        if (dto.getResumeUrl() != null) existing.setResumeUrl(dto.getResumeUrl());

        return repository.save(existing);
    }

    @Override
    public void deleteProfile(Long id) {
        if (!repository.existsById(id)) throw new RuntimeException("Profile not found with id: " + id);
        repository.deleteById(id);
    }

    @Override
    public UserProfile getProfileById(Long id) {
        return repository.findByProfileId(id).orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));
    }

    @Override
    public UserProfile getProfileByEmail(String email) {
        return repository.findByEmail(email).orElseThrow(() -> new RuntimeException("Profile not found with email: " + email));
    }

    @Override
    public List<UserProfile> getAllProfiles() {
        return repository.findAll();
    }

    @Override
    public List<UserProfile> getProfilesByRole(Role role) {
        return repository.findByRole(role);
    }
}