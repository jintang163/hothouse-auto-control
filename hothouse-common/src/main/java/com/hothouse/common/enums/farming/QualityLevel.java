package com.hothouse.common.enums.farming;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum QualityLevel {

    SPECIAL(1, "特级"),
    FIRST(2, "一级"),
    SECOND(3, "二级"),
    THIRD(4, "三级");

    @EnumValue
    private final Integer code;
    private final String desc;

    QualityLevel(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static QualityLevel getByCode(Integer code) {
        for (QualityLevel level : values()) {
            if (level.getCode().equals(code)) {
                return level;
            }
        }
        return null;
    }
}
