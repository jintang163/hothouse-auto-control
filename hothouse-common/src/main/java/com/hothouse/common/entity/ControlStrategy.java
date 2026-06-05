package com.hothouse.common.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hothouse.common.enums.ControlMode;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_control_strategy")
public class ControlStrategy extends BaseEntity {

    private Long greenhouseId;

    private String strategyName;

    private String cropType;

    private ControlMode controlMode;

    private BigDecimal tempUpperLimit;

    private BigDecimal tempLowerLimit;

    private BigDecimal humidityUpperLimit;

    private BigDecimal humidityLowerLimit;

    private BigDecimal co2UpperLimit;

    private BigDecimal lightUpperLimit;

    private Integer fanTempThreshold;

    private Integer wetCurtainTempDiff;

    private Integer sunshadeLightThreshold;

    private Integer debounceTime;

    private Integer interlockEnabled;

    private Integer priority;

    private Integer enabled;

    private String cronExpression;
}
