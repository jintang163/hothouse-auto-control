package com.hothouse.common.enums.farming;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum HandleStatus {

    PENDING(0, "未处理"),
    PROCESSING(1, "处理中"),
    HANDLED(2, "已处理");

    @EnumValue
    private final Integer code;
    private final String desc;

    HandleStatus(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static HandleStatus getByCode(Integer code) {
        for (HandleStatus status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }
}
