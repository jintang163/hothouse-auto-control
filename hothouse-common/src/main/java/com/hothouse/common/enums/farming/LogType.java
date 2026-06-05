package com.hothouse.common.enums.farming;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum LogType {

    TASK("TASK", "任务日志"),
    ENV("ENV", "环境日志"),
    OPERATION("OPERATION", "操作日志"),
    YIELD("YIELD", "产量日志");

    @EnumValue
    private final String code;
    private final String desc;

    LogType(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static LogType getByCode(String code) {
        for (LogType type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        return null;
    }
}
