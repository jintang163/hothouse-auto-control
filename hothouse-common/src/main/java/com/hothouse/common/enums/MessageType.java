package com.hothouse.common.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum MessageType {

    HEARTBEAT(0x01, "心跳"),
    AUTH(0x02, "认证"),
    DATA_UPLOAD(0x03, "数据上报"),
    CONTROL_CMD(0x04, "控制指令"),
    CONTROL_ACK(0x05, "控制回执"),
    ALARM(0x06, "告警上报");

    @EnumValue
    private final Integer code;
    private final String desc;

    MessageType(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static MessageType getByCode(Integer code) {
        for (MessageType type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        return null;
    }
}
