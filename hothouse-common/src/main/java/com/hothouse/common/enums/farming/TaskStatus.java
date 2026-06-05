package com.hothouse.common.enums.farming;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum TaskStatus {

    PENDING(0, "待执行"),
    EXECUTING(1, "执行中"),
    COMPLETED(2, "已完成"),
    CANCELLED(3, "已取消"),
    FAILED(4, "执行失败");

    @EnumValue
    private final Integer code;
    private final String desc;

    TaskStatus(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static TaskStatus getByCode(Integer code) {
        for (TaskStatus status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }
}
