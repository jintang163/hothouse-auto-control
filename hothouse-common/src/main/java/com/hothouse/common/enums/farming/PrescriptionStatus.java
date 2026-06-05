package com.hothouse.common.enums.farming;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum PrescriptionStatus {

    DRAFT(0, "草稿"),
    PUBLISHED(1, "已发布"),
    ARCHIVED(2, "已归档");

    @EnumValue
    private final Integer code;
    private final String desc;

    PrescriptionStatus(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static PrescriptionStatus getByCode(Integer code) {
        for (PrescriptionStatus status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }
}
