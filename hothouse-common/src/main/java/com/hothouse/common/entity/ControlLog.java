package com.hothouse.common.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_control_log")
public class ControlLog extends BaseEntity {

    private Long greenhouseId;

    private String deviceCode;

    private String deviceName;

    private Integer actionType;

    private String actionContent;

    private String triggerSource;

    private String strategyName;

    private Integer commandStatus;

    private String ackContent;

    private LocalDateTime commandTime;

    private LocalDateTime ackTime;

    private Integer retryCount;

    private String operator;

    private String remark;
}
