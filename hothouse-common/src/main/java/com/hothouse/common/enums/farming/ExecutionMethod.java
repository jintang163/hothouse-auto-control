package com.hothouse.common.enums.farming;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum ExecutionMethod {

    DEVICE("DEVICE", "设备联动"),
    MANUAL("MANUAL", "人工执行");

    @EnumValue
    private final String code;
    private final String desc;

    ExecutionMethod(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static ExecutionMethod getByCode(String code) {
        for (ExecutionMethod method : values()) {
            if (method.getCode().equals(code)) {
                return method;
            }
        }
        return null;
    }
}
