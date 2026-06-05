package com.hothouse.common.enums.farming;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum IdentifyMethod {

    AI("AI", "智能识别"),
    MANUAL("MANUAL", "人工判定");

    @EnumValue
    private final String code;
    private final String desc;

    IdentifyMethod(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static IdentifyMethod getByCode(String code) {
        for (IdentifyMethod method : values()) {
            if (method.getCode().equals(code)) {
                return method;
            }
        }
        return null;
    }
}
