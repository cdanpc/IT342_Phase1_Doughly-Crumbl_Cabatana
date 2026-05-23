package edu.cit.cabatana.doughlycrumbl.features.user;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String phoneNumber;
    private String address;
    private Boolean enabled;
    private Boolean accountLocked;
    private LocalDateTime createdAt;

    public static AdminUserResponse from(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .enabled(!Boolean.FALSE.equals(user.getEnabled()))
                .accountLocked(Boolean.TRUE.equals(user.getAccountLocked()))
                .createdAt(user.getCreatedAt())
                .build();
    }
}
