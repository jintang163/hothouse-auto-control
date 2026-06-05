package com.hothouse.common.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum AlarmLevel {

    INFO(1, "提示"),
    WARNING(2, "警告"),
    ERROR(3, "错误"),
    CRITICAL(4, "严重");

    @EnumValue
    private final Integer code;
    private final String desc;

    AlarmLevel(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
