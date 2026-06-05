package com.hothouse.common.entity.farming;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hothouse.common.entity.BaseEntity;
import com.hothouse.common.enums.farming.HandleStatus;
import com.hothouse.common.enums.farming.IdentifyMethod;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_pest_identification")
public class PestIdentification extends BaseEntity {

    private static final long serialVersionUID = 1L;

    private String identifyCode;

    private Long greenhouseId;

    private Long varietyId;

    private String imageUrl;

    private IdentifyMethod identifyMethod;

    private Long pestId;

    private String pestName;

    private BigDecimal confidence;

    private String identifyResult;

    private Integer damageLevel;

    private BigDecimal affectedArea;

    private String suggestion;

    private String handler;

    private HandleStatus handleStatus;

    private String handleResult;

    private LocalDateTime handleTime;

    private LocalDateTime identifyTime;
}
