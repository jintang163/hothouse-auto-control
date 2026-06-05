package com.hothouse.common.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_device_ledger")
public class DeviceLedger extends BaseEntity {

    private String deviceCode;

    private String deviceName;

    private Integer deviceType;

    private Long greenhouseId;

    private BigDecimal totalRunHours;

    private Integer startStopCount;

    private BigDecimal currentRunHours;

    private LocalDateTime lastStartTime;

    private LocalDateTime lastStopTime;

    private BigDecimal lastMaintenanceHours;

    private BigDecimal nextMaintenanceHours;

    private Integer maintenanceStatus;
}
