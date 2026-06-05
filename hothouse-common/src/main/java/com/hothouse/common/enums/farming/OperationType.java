package com.hothouse.common.enums.farming;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum OperationType {

    PRUNING("PRUNING", "整枝打杈"),
    POLLINATION("POLLINATION", "授粉"),
    HARVEST("HARVEST", "采收"),
    SPRAYING("SPRAYING", "喷药"),
    IRRIGATION("IRRIGATION", "灌溉"),
    FERTILIZATION("FERTILIZATION", "施肥"),
    FOLIAR_FERT("FOLIAR_FERT", "叶面肥"),
    OTHER("OTHER", "其他");

    @EnumValue
    private final String code;
    private final String desc;

    OperationType(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static OperationType getByCode(String code) {
        for (OperationType type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        return null;
    }
}
