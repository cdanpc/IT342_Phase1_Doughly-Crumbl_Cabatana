package edu.cit.cabatana.doughlycrumbl.features.auth;

import edu.cit.cabatana.doughlycrumbl.features.user.User;
import edu.cit.cabatana.doughlycrumbl.features.user.UserRepository;
import edu.cit.cabatana.doughlycrumbl.shared.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private AuthenticationManager authenticationManager;
    @InjectMocks private AuthService authService;

    // ── register ──────────────────────────────────────────────────────────

    @Test
    void register_passwordMismatch_throwsBadRequest() {
        RegisterRequest req = RegisterRequest.builder()
                .name("Alice")
                .email("alice@test.com")
                .password("abc123")
                .confirmPassword("DIFFERENT")
                .build();

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Passwords do not match");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_duplicateEmail_throwsBadRequest() {
        RegisterRequest req = RegisterRequest.builder()
                .name("Bob")
                .email("bob@test.com")
                .password("abc123")
                .confirmPassword("abc123")
                .build();

        when(userRepository.existsByEmail("bob@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already registered");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_validRequest_savesUserAndReturnsToken() {
        RegisterRequest req = RegisterRequest.builder()
                .name("Carol")
                .email("carol@test.com")
                .password("abc123")
                .confirmPassword("abc123")
                .address("Cebu City")
                .phoneNumber("09171234567")
                .build();

        User saved = User.builder()
                .id(1L).name("Carol").email("carol@test.com")
                .password("hashed").role("CUSTOMER").build();

        when(userRepository.existsByEmail("carol@test.com")).thenReturn(false);
        when(passwordEncoder.encode("abc123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(jwtTokenProvider.generateToken(any())).thenReturn("tok.en.value");

        AuthResponse result = authService.register(req);

        assertThat(result.getToken()).isEqualTo("tok.en.value");
        assertThat(result.getEmail()).isEqualTo("carol@test.com");
        assertThat(result.getRole()).isEqualTo("CUSTOMER");
        verify(userRepository).save(any(User.class));
    }

    // ── login ─────────────────────────────────────────────────────────────

    @Test
    void login_emailNotFound_throwsBadRequest() {
        LoginRequest req = LoginRequest.builder()
                .email("ghost@test.com").password("any").build();

        when(userRepository.existsByEmail("ghost@test.com")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("No account found");

        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void login_wrongPassword_throwsBadRequest() {
        LoginRequest req = LoginRequest.builder()
                .email("dave@test.com").password("wrong").build();

        when(userRepository.existsByEmail("dave@test.com")).thenReturn(true);
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("bad credentials"));

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Incorrect password");
    }

    @Test
    void login_validCredentials_returnsToken() {
        LoginRequest req = LoginRequest.builder()
                .email("eve@test.com").password("correct").build();

        CustomUserDetails principal =
                new CustomUserDetails(2L, "Eve", "eve@test.com", "hashed", "CUSTOMER");
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        when(userRepository.existsByEmail("eve@test.com")).thenReturn(true);
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(jwtTokenProvider.generateToken(principal)).thenReturn("jwt.token.here");

        AuthResponse result = authService.login(req);

        assertThat(result.getToken()).isEqualTo("jwt.token.here");
        assertThat(result.getEmail()).isEqualTo("eve@test.com");
    }
}
