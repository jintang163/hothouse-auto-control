package com.hothouse.common.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum DeviceStatus {

    OFFLINE(0, "离线"),
    ONLINE(1, "在线"),
    RUNNING(2, "运行中"),
    FAULT(3, "故障");

    @EnumValue
    private final Integer code;
    private final String desc;

    DeviceStatus(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
