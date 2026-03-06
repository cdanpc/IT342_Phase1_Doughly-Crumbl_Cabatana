package com.doughlycrumbl.backend.repository;

import com.doughlycrumbl.backend.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    Page<Order> findAll(Pageable pageable);

    Page<Order> findByStatus(String status, Pageable pageable);
}
