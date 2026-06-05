package com.hothouse.common.protocol;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SensorDataPayload {

    private BigDecimal temperature;

    private BigDecimal humidity;

    private BigDecimal co2;

    private BigDecimal lightIntensity;

    private BigDecimal soilMoisture;

    private BigDecimal soilTemperature;

    private LocalDateTime collectTime;
}
