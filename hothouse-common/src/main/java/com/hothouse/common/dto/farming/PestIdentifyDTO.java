package com.hothouse.common.dto.farming;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class PestIdentifyDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String imageUrl;

    private Long greenhouseId;

    private Long varietyId;

    private String identifyMethod;

    private BigDecimal confidence;

    private Long pestId;

    private String pestName;

    private String identifyResult;

    private Integer damageLevel;

    private BigDecimal affectedArea;

    private String suggestion;

    private String operator;
}
