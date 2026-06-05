package com.hothouse.common.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hothouse.common.enums.DeviceStatus;
import com.hothouse.common.enums.DeviceType;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_device")
public class Device extends BaseEntity {

    private Long greenhouseId;

    private String deviceCode;

    private String deviceName;

    private DeviceType deviceType;

    private DeviceStatus deviceStatus;

    private String gatewayCode;

    private String zone;

    private String ipAddress;

    private Integer runningStatus;

    private String remark;
}
