package edu.cit.cabatana.doughlycrumbl.features.order;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for DeliveryFeeCalculator — verifies all four distance zones.
 */
class DeliveryServiceTest {

    private final DeliveryFeeCalculator calculator = new DeliveryFeeCalculator();

    @Test
    void calculateFee_zone1_exactBoundary_returns80() {
        assertThat(calculator.calculate(3.0))
                .isEqualByComparingTo(new BigDecimal("80.00"));
    }

    @Test
    void calculateFee_zone1_withinRange_returns80() {
        assertThat(calculator.calculate(1.5))
                .isEqualByComparingTo(new BigDecimal("80.00"));
    }

    @Test
    void calculateFee_zone2_withinRange_returns120() {
        assertThat(calculator.calculate(5.0))
                .isEqualByComparingTo(new BigDecimal("120.00"));
    }

    @Test
    void calculateFee_zone3_withinRange_returns160() {
        assertThat(calculator.calculate(10.0))
                .isEqualByComparingTo(new BigDecimal("160.00"));
    }

    @Test
    void calculateFee_zone4_beyondMax_returns200() {
        assertThat(calculator.calculate(20.0))
                .isEqualByComparingTo(new BigDecimal("200.00"));
    }
}