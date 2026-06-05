package com.hothouse.common.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_fault_record")
public class FaultRecord extends BaseEntity {

    private String deviceCode;

    private String deviceName;

    private Integer deviceType;

    private Long greenhouseId;

    private String faultCode;

    private String faultType;

    private Integer faultLevel;

    private String faultContent;

    private LocalDateTime faultTime;

    private LocalDateTime recoverTime;

    private Integer durationMinutes;

    private Integer status;

    private String handler;

    private String handleMethod;

    private LocalDateTime handleTime;

    private String sparePartsUsed;

    private BigDecimal cost;

    private String remark;
}
