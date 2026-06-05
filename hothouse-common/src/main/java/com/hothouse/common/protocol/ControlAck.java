package com.hothouse.common.protocol;

import lombok.Data;

@Data
public class ControlAck {

    private String targetDeviceCode;

    private Integer sequence;

    private Integer resultCode;

    private String resultMessage;

    private Long executeTime;
}
