package edu.cit.cabatana.doughlycrumbl.features.notification;

import edu.cit.cabatana.doughlycrumbl.features.notification.NotificationResponse;
import edu.cit.cabatana.doughlycrumbl.features.notification.Notification;
import edu.cit.cabatana.doughlycrumbl.features.user.User;
import edu.cit.cabatana.doughlycrumbl.features.notification.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void send(User recipient, Long orderId, String type, String title, String message) {
        Notification notification = Notification.builder()
                .user(recipient)
                .orderId(orderId)
                .type(type)
                .title(title)
                .message(message)
                .build();
        Notification saved = notificationRepository.save(notification);

        NotificationResponse payload = NotificationResponse.from(saved);
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + recipient.getId(),
                payload
        );
    }

    public List<NotificationResponse> getForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllReadByUserId(userId);
    }
}
