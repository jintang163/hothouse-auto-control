package com.hothouse.common.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum ControlMode {

    MANUAL(0, "手动"),
    AUTO(1, "自动"),
    TIMED(2, "定时");

    @EnumValue
    private final Integer code;
    private final String desc;

    ControlMode(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
