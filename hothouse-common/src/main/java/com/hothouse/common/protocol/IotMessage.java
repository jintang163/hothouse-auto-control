package com.hothouse.common.protocol;

import com.hothouse.common.enums.MessageType;
import lombok.Data;

import java.io.Serializable;

@Data
public class IotMessage implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer magic;

    private Integer version;

    private MessageType messageType;

    private String deviceCode;

    private String gatewayCode;

    private Long timestamp;

    private Integer sequence;

    private String payload;

    private Integer checksum;

    public static final int MAGIC = 0x48544853;
}
