package edu.cit.cabatana.doughlycrumbl.features.order;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;

/**
 * Calculates the delivery fee based on distance zones.
 *
 * Zone 1 (≤ 3 km)   → ₱80
 * Zone 2 (3–8 km)   → ₱120
 * Zone 3 (8–15 km)  → ₱160
 * Zone 4 (> 15 km)  → ₱200
 */
@Component
public class DeliveryFeeCalculator {

    public BigDecimal calculate(double distanceKm) {
        if (distanceKm <= 3.0)  return new BigDecimal("80.00");
        if (distanceKm <= 8.0)  return new BigDecimal("120.00");
        if (distanceKm <= 15.0) return new BigDecimal("160.00");
        return new BigDecimal("200.00");
    }
}