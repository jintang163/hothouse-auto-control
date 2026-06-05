package com.hothouse.common.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum DeviceType {

    FAN(1, "风机"),
    WET_CURTAIN(2, "湿帘"),
    SUNSHADE_NET(3, "遮阳网"),
    TEMPERATURE_SENSOR(10, "温度传感器"),
    HUMIDITY_SENSOR(11, "湿度传感器"),
    GATEWAY(99, "网关");

    @EnumValue
    private final Integer code;
    private final String desc;

    DeviceType(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static DeviceType getByCode(Integer code) {
        for (DeviceType type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        return null;
    }
}
