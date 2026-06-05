package com.hothouse.common.protocol;

import lombok.Data;

@Data
public class ControlCommand {

    private String targetDeviceCode;

    private Integer action;

    private String actionParams;

    private Long strategyId;

    private String triggerSource;

    private String remark;
}
