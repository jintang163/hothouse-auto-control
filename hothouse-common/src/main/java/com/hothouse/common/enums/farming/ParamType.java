package com.hothouse.common.enums.farming;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum ParamType {

    TEMP("TEMP", "温度"),
    HUMIDITY("HUMIDITY", "湿度"),
    CO2("CO2", "CO2浓度"),
    LIGHT("LIGHT", "光照"),
    SOIL_MOISTURE("SOIL_MOISTURE", "土壤湿度"),
    SOIL_TEMP("SOIL_TEMP", "土壤温度");

    @EnumValue
    private final String code;
    private final String desc;

    ParamType(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static ParamType getByCode(String code) {
        for (ParamType type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        return null;
    }
}
