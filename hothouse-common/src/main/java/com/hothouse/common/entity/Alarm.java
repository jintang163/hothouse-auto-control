package com.hothouse.common.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hothouse.common.enums.AlarmLevel;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_alarm")
public class Alarm extends BaseEntity {

    private Long greenhouseId;

    private String deviceCode;

    private String alarmCode;

    private String alarmName;

    private AlarmLevel alarmLevel;

    private String alarmContent;

    private String alarmValue;

    private String thresholdValue;

    private LocalDateTime alarmTime;

    private LocalDateTime recoverTime;

    private Integer status;

    private String handleRemark;

    private String handledBy;

    private LocalDateTime handleTime;
}
