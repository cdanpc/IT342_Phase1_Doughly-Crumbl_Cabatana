package edu.cit.cabatana.doughlycrumbl.features.auth;

import edu.cit.cabatana.doughlycrumbl.features.auth.LoginRequest;
import edu.cit.cabatana.doughlycrumbl.features.auth.RegisterRequest;
import edu.cit.cabatana.doughlycrumbl.features.auth.AuthResponse;
import edu.cit.cabatana.doughlycrumbl.shared.exception.BadRequestException;
import edu.cit.cabatana.doughlycrumbl.model.User;
import edu.cit.cabatana.doughlycrumbl.repository.UserRepository;
import edu.cit.cabatana.doughlycrumbl.features.auth.CustomUserDetails;
import edu.cit.cabatana.doughlycrumbl.features.auth.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        // Create user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
            .provider("LOCAL")
                .role("CUSTOMER")
                .build();

        user = userRepository.save(user);

        // Generate token
        CustomUserDetails userDetails = CustomUserDetails.fromUser(user);
        String token = jwtTokenProvider.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // Check if the email exists before attempting authentication
        // so we can return a specific message instead of Spring Security's generic one
        if (!userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("No account found with that email address.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String token = jwtTokenProvider.generateToken(userDetails);

            return AuthResponse.builder()
                    .token(token)
                    .userId(userDetails.getId())
                    .name(userDetails.getName())
                    .email(userDetails.getEmail())
                    .role(userDetails.getRole())
                    .build();

        } catch (BadCredentialsException ex) {
            throw new BadRequestException("Incorrect password. Please try again.");
        }
    }
}

