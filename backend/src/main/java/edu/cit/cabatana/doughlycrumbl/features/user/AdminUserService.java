package edu.cit.cabatana.doughlycrumbl.features.user;

import edu.cit.cabatana.doughlycrumbl.shared.exception.BadRequestException;
import edu.cit.cabatana.doughlycrumbl.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private static final String ADMIN_ROLE = "ADMIN";

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(AdminUserResponse::from)
                .toList();
    }

    @Transactional
    public AdminUserResponse banUser(Long id, Long actorId) {
        User user = getManagedUser(id, actorId, "ban");
        guardLastUsableAdmin(user);
        user.setAccountLocked(true);
        return AdminUserResponse.from(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse unbanUser(Long id, Long actorId) {
        User user = getManagedUser(id, actorId, "unban");
        user.setAccountLocked(false);
        user.setEnabled(true);
        return AdminUserResponse.from(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse disableUser(Long id, Long actorId) {
        User user = getManagedUser(id, actorId, "remove");
        guardLastUsableAdmin(user);
        user.setEnabled(false);
        return AdminUserResponse.from(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse restoreUser(Long id, Long actorId) {
        User user = getManagedUser(id, actorId, "restore");
        user.setEnabled(true);
        user.setAccountLocked(false);
        return AdminUserResponse.from(userRepository.save(user));
    }

    private User getManagedUser(Long id, Long actorId, String action) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        if (user.getId().equals(actorId)) {
            throw new BadRequestException("Admins cannot " + action + " their own account.");
        }
        return user;
    }

    private void guardLastUsableAdmin(User user) {
        if (ADMIN_ROLE.equals(user.getRole())
                && isUsable(user)
                && userRepository.findByRole(ADMIN_ROLE).stream().filter(this::isUsable).count() <= 1) {
            throw new BadRequestException("Cannot remove or ban the last active admin account.");
        }
    }

    private boolean isUsable(User user) {
        return !Boolean.FALSE.equals(user.getEnabled()) && !Boolean.TRUE.equals(user.getAccountLocked());
    }
}
