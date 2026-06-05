package com.hothouse.common.enums.farming;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum PestType {

    PEST("PEST", "虫害"),
    DISEASE("DISEASE", "病害");

    @EnumValue
    private final String code;
    private final String desc;

    PestType(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static PestType getByCode(String code) {
        for (PestType type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        return null;
    }
}
