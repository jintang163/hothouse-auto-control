package com.hothouse.common.enums.farming;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum TriggerSource {

    AUTO_THRESHOLD("AUTO_THRESHOLD", "阈值触发"),
    AUTO_TIMED("AUTO_TIMED", "定时触发"),
    MANUAL("MANUAL", "人工创建");

    @EnumValue
    private final String code;
    private final String desc;

    TriggerSource(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static TriggerSource getByCode(String code) {
        for (TriggerSource source : values()) {
            if (source.getCode().equals(code)) {
                return source;
            }
        }
        return null;
    }
}
