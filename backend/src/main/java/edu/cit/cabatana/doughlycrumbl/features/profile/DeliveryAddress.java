package edu.cit.cabatana.doughlycrumbl.features.profile;

import edu.cit.cabatana.doughlycrumbl.features.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_addresses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 80)
    private String label;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean defaultAddress = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
