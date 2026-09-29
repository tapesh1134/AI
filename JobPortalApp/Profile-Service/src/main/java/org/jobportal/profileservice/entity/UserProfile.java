package org.jobportal.profileservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Inheritance(strategy = InheritanceType.JOINED)
@SuperBuilder
public abstract class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long profileId;
    @Column(nullable = false)
    protected String fullName;
    @Email(message = "Enter correct email")
    @Column(unique = true, nullable = false)
    protected String email;
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id")
    protected Address address;
    @Enumerated(EnumType.STRING)
    private Role role;
    @Column(unique = true, nullable = false)
    private Long mobile;
}