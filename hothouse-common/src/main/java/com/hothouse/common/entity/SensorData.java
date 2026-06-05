package com.hothouse.common.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_sensor_data")
public class SensorData extends BaseEntity {

    private Long greenhouseId;

    private String deviceCode;

    private BigDecimal temperature;

    private BigDecimal humidity;

    private BigDecimal co2;

    private BigDecimal lightIntensity;

    private BigDecimal soilMoisture;

    private BigDecimal soilTemperature;

    private LocalDateTime collectTime;

    private String rawData;
}
