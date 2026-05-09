package edu.cit.cabatana.doughlycrumbl.features.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.cit.cabatana.doughlycrumbl.shared.config.SecurityConfig;
import edu.cit.cabatana.doughlycrumbl.shared.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean  private AuthService authService;
    @MockBean  private JwtTokenProvider jwtTokenProvider;
    @MockBean  private UserDetailsService userDetailsService;

    private AuthResponse stubToken() {
        return AuthResponse.builder()
                .token("jwt.tok.en")
                .userId(1L)
                .name("Test User")
                .email("user@test.com")
                .role("CUSTOMER")
                .build();
    }

    // ── POST /api/auth/register ───────────────────────────────────────────

    @Test
    void register_validPayload_returns201WithToken() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .name("Test User").email("user@test.com")
                .password("abc123").confirmPassword("abc123")
                .address("Cebu City").phoneNumber("09170000000")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(stubToken());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt.tok.en"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }

    @Test
    void register_missingName_returns400() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .email("u@test.com").password("abc123").confirmPassword("abc123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_duplicateEmail_returns400() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .name("Bob").email("bob@test.com")
                .password("abc123").confirmPassword("abc123")
                .build();

        when(authService.register(any())).thenThrow(new BadRequestException("Email is already registered"));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    // ── POST /api/auth/login ──────────────────────────────────────────────

    @Test
    void login_validCredentials_returns200WithToken() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .email("user@test.com").password("abc123")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(stubToken());

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt.tok.en"))
                .andExpect(jsonPath("$.email").value("user@test.com"));
    }

    @Test
    void login_unknownEmail_returns400() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .email("ghost@test.com").password("any")
                .build();

        when(authService.login(any())).thenThrow(new BadRequestException("No account found with that email address."));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_invalidEmail_returns400() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .email("not-an-email").password("abc123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }
}
