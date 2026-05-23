package edu.cit.cabatana.doughlycrumbl.features.profile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryAddressRepository extends JpaRepository<DeliveryAddress, Long> {
    List<DeliveryAddress> findByUserIdOrderByDefaultAddressDescCreatedAtDesc(Long userId);
}
