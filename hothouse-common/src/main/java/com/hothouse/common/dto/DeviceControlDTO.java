package com.hothouse.common.dto;

import com.hothouse.common.enums.DeviceType;
import lombok.Data;

import java.io.Serializable;

@Data
public class DeviceControlDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String deviceCode;

    private DeviceType deviceType;

    private Integer action;

    private String actionParams;

    private String operator;

    private String remark;
}
