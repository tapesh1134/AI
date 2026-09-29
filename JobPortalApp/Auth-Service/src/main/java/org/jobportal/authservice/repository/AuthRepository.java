package org.jobportal.authservice.repository;

import org.jobportal.authservice.entity.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthRepository extends JpaRepository<UserCredential, Long> {
    Optional<UserCredential> findByEmail(String email);
    Optional<UserCredential> findByUserId(Long userId);
    boolean existsByEmail(String email);
    void deleteByUserId(Long userId);
}
