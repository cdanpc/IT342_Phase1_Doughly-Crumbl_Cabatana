package edu.cit.cabatana.doughlycrumbl.features.user;

import edu.cit.cabatana.doughlycrumbl.features.auth.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getUsers() {
        return ResponseEntity.ok(adminUserService.getUsers());
    }

    @PutMapping("/{id}/ban")
    public ResponseEntity<AdminUserResponse> banUser(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails admin) {
        return ResponseEntity.ok(adminUserService.banUser(id, admin.getId()));
    }

    @PutMapping("/{id}/unban")
    public ResponseEntity<AdminUserResponse> unbanUser(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails admin) {
        return ResponseEntity.ok(adminUserService.unbanUser(id, admin.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<AdminUserResponse> disableUser(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails admin) {
        return ResponseEntity.ok(adminUserService.disableUser(id, admin.getId()));
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<AdminUserResponse> restoreUser(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails admin) {
        return ResponseEntity.ok(adminUserService.restoreUser(id, admin.getId()));
    }
}
