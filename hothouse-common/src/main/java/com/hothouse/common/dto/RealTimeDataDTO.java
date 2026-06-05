package com.hothouse.common.dto;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class RealTimeDataDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long greenhouseId;

    private String greenhouseName;

    private BigDecimal temperature;

    private BigDecimal humidity;

    private BigDecimal co2;

    private BigDecimal lightIntensity;

    private BigDecimal soilMoisture;

    private BigDecimal soilTemperature;

    private Integer fanStatus;

    private Integer wetCurtainStatus;

    private Integer sunshadeStatus;

    private String collectTime;
}
