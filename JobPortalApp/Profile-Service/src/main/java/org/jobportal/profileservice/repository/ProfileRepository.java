package org.jobportal.profileservice.repository;

import org.jobportal.profileservice.entity.Role;
import org.jobportal.profileservice.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByEmail(String email);
    Optional<UserProfile> findByMobile(Long mobile);
    Optional<UserProfile> findByProfileId(Long profileId);
    List<UserProfile> findByRole(Role role);
    void deleteByProfileId(Long profileId);
}
