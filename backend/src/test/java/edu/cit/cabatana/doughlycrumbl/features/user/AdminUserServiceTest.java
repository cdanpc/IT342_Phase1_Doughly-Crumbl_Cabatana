package edu.cit.cabatana.doughlycrumbl.features.user;

import edu.cit.cabatana.doughlycrumbl.shared.exception.BadRequestException;
import edu.cit.cabatana.doughlycrumbl.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock private UserRepository userRepository;
    @InjectMocks private AdminUserService adminUserService;

    @Test
    void getUsers_returnsNormalizedAccountFlags() {
        User legacyUser = user(10L, "Customer", "CUSTOMER");
        legacyUser.setEnabled(null);
        legacyUser.setAccountLocked(null);

        when(userRepository.findAll(any(Sort.class))).thenReturn(List.of(legacyUser));

        List<AdminUserResponse> result = adminUserService.getUsers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEnabled()).isTrue();
        assertThat(result.get(0).getAccountLocked()).isFalse();
    }

    @Test
    void banUser_locksAccount() {
        User target = user(2L, "Customer", "CUSTOMER");
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(userRepository.save(target)).thenReturn(target);

        AdminUserResponse result = adminUserService.banUser(2L, 1L);

        assertThat(target.getAccountLocked()).isTrue();
        assertThat(result.getAccountLocked()).isTrue();
        verify(userRepository).save(target);
    }

    @Test
    void disableUser_softRemovesAccount() {
        User target = user(2L, "Customer", "CUSTOMER");
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(userRepository.save(target)).thenReturn(target);

        AdminUserResponse result = adminUserService.disableUser(2L, 1L);

        assertThat(target.getEnabled()).isFalse();
        assertThat(result.getEnabled()).isFalse();
        verify(userRepository).save(target);
    }

    @Test
    void restoreUser_enablesAndUnlocksAccount() {
        User target = user(2L, "Customer", "CUSTOMER");
        target.setEnabled(false);
        target.setAccountLocked(true);
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(userRepository.save(target)).thenReturn(target);

        AdminUserResponse result = adminUserService.restoreUser(2L, 1L);

        assertThat(result.getEnabled()).isTrue();
        assertThat(result.getAccountLocked()).isFalse();
    }

    @Test
    void manageSelf_throwsBadRequest() {
        User target = user(1L, "Admin", "ADMIN");
        when(userRepository.findById(1L)).thenReturn(Optional.of(target));

        assertThatThrownBy(() -> adminUserService.banUser(1L, 1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("own account");

        verify(userRepository, never()).save(any());
    }

    @Test
    void banLastUsableAdmin_throwsBadRequest() {
        User onlyAdmin = user(1L, "Admin", "ADMIN");
        when(userRepository.findById(1L)).thenReturn(Optional.of(onlyAdmin));
        when(userRepository.findByRole("ADMIN")).thenReturn(List.of(onlyAdmin));

        assertThatThrownBy(() -> adminUserService.banUser(1L, 99L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("last active admin");

        verify(userRepository, never()).save(any());
    }

    @Test
    void disableAdmin_allowedWhenAnotherUsableAdminExists() {
        User target = user(1L, "Admin One", "ADMIN");
        User otherAdmin = user(2L, "Admin Two", "ADMIN");
        when(userRepository.findById(1L)).thenReturn(Optional.of(target));
        when(userRepository.findByRole("ADMIN")).thenReturn(List.of(target, otherAdmin));
        when(userRepository.save(target)).thenReturn(target);

        AdminUserResponse result = adminUserService.disableUser(1L, 99L);

        assertThat(result.getEnabled()).isFalse();
    }

    @Test
    void unknownUser_throwsResourceNotFound() {
        when(userRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminUserService.disableUser(404L, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private User user(long id, String name, String role) {
        return User.builder()
                .id(id)
                .name(name)
                .email(name.toLowerCase().replace(" ", ".") + "@test.com")
                .password("hashed")
                .role(role)
                .enabled(true)
                .accountLocked(false)
                .build();
    }
}
