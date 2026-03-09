package edu.cit.cabatana.doughlycrumbl.repository;

import edu.cit.cabatana.doughlycrumbl.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
