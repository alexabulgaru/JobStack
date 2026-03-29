package backend.backend.service;

import backend.backend.config.security.JwtUtil;
import backend.backend.entity.Role;
import backend.backend.entity.User;
import backend.backend.repository.RoleRepository;
import backend.backend.repository.UserRepository;
import backend.backend.service.dto.AuthResponse;
import backend.backend.service.dto.LoginRequest;
import backend.backend.service.dto.RegisterRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public String register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("This email is already registered");
        }

        User user = new User()
                .setFirstName(request.getFirstName())
                .setLastName(request.getLastName())
                .setEmail(request.getEmail())
                .setPassword(passwordEncoder.encode(request.getPassword()));

        Role userRole = roleRepository.findByName("USER")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("USER");
                    return roleRepository.save(newRole);
                });

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);

        userRepository.save(user);

        return "User registered successfully";
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        String jwtToken = jwtUtil.generateToken(user);
        return new AuthResponse(jwtToken);
    }
}
