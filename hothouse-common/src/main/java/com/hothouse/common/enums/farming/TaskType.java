package com.hothouse.common.enums.farming;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum TaskType {

    ENV_ADJUST("ENV_ADJUST", "环境调节"),
    FERTIGATION("FERTIGATION", "水肥作业"),
    OPERATION("OPERATION", "农事操作");

    @EnumValue
    private final String code;
    private final String desc;

    TaskType(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static TaskType getByCode(String code) {
        for (TaskType type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        return null;
    }
}
