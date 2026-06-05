package com.hothouse.common.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_maintenance_plan")
public class MaintenancePlan extends BaseEntity {

    private Integer deviceType;

    private String planName;

    private String maintenanceType;

    private Integer cycleHours;

    private Integer cycleDays;

    private String description;

    private String requiredSpareParts;

    private Integer enabled;
}
