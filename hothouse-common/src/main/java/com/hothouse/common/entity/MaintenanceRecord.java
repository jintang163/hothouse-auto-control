package com.hothouse.common.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_maintenance_record")
public class MaintenanceRecord extends BaseEntity {

    private String deviceCode;

    private String deviceName;

    private Long greenhouseId;

    private Long planId;

    private String maintenanceType;

    private String maintenanceContent;

    private BigDecimal runHoursAtMaintenance;

    private String operator;

    private LocalDateTime maintenanceTime;

    private String sparePartsUsed;

    private BigDecimal cost;

    private String remark;
}
