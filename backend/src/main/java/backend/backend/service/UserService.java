package backend.backend.service;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import backend.backend.entity.Role;
import backend.backend.entity.User;
import backend.backend.repository.RoleRepository;
import backend.backend.repository.UserRepository;
import backend.backend.service.dto.AdminUserUpsertRequest;
import backend.backend.service.dto.UserResponse;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse getMe() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    public Page<UserResponse> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional
    public UserResponse createUserByAdmin(AdminUserUpsertRequest request) {
        String normalizedEmail = normalizeRequiredEmail(request.getEmail());
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new RuntimeException("This email is already registered");
        }

        String rawPassword = normalizeRequiredPassword(request.getPassword());

        User user = new User()
                .setFirstName(normalizeOptionalText(request.getFirstName()))
                .setLastName(normalizeOptionalText(request.getLastName()))
                .setEmail(normalizedEmail)
                .setPassword(passwordEncoder.encode(rawPassword));

        user.setRoles(resolveRolesOrDefault(request.getRoles()));

        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUserByAdmin(Long id, AdminUserUpsertRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getEmail() != null) {
            String normalizedEmail = normalizeRequiredEmail(request.getEmail());
            userRepository.findByEmail(normalizedEmail).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new RuntimeException("This email is already registered");
                }
            });
            user.setEmail(normalizedEmail);
        }

        if (request.getFirstName() != null) {
            user.setFirstName(normalizeOptionalText(request.getFirstName()));
        }

        if (request.getLastName() != null) {
            user.setLastName(normalizeOptionalText(request.getLastName()));
        }

        if (request.getPassword() != null) {
            String trimmedPassword = request.getPassword().trim();
            if (trimmedPassword.isEmpty()) {
                throw new RuntimeException("Password cannot be empty");
            }
            user.setPassword(passwordEncoder.encode(trimmedPassword));
        }

        if (request.getRoles() != null) {
            user.setRoles(resolveRequiredRoles(request.getRoles()));
        }

        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public UserResponse updateRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = roleRepository.findByName(roleName.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        user.getRoles().clear();
        user.getRoles().add(role);
        
        return mapToResponse(userRepository.save(user));
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        if (user.getRoles() != null) {
            response.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        }
        return response;
    }

    private String normalizeRequiredEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        return email.trim().toLowerCase();
    }

    private String normalizeRequiredPassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }
        return password.trim();
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Set<Role> resolveRolesOrDefault(Set<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            Role defaultRole = roleRepository.findByName("USER")
                    .orElseThrow(() -> new RuntimeException("Default USER role is missing"));
            Set<Role> roles = new HashSet<>();
            roles.add(defaultRole);
            return roles;
        }

        return resolveRequiredRoles(roleNames);
    }

    private Set<Role> resolveRequiredRoles(Set<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            throw new RuntimeException("At least one role is required");
        }

        Set<Role> roles = new HashSet<>();
        for (String roleName : roleNames) {
            if (roleName == null || roleName.trim().isEmpty()) {
                throw new RuntimeException("Role name cannot be empty");
            }

            Role role = roleRepository.findByName(roleName.trim().toUpperCase())
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
            roles.add(role);
        }

        return roles;
    }
}
