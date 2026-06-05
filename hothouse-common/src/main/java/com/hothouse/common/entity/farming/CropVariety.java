package com.hothouse.common.entity.farming;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hothouse.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_crop_variety")
public class CropVariety extends BaseEntity {

    private static final long serialVersionUID = 1L;

    private String cropName;

    private String varietyName;

    private String varietyCode;

    private String cropType;

    private Integer growthCycleDays;

    private BigDecimal suitableTempMin;

    private BigDecimal suitableTempMax;

    private BigDecimal suitableHumidityMin;

    private BigDecimal suitableHumidityMax;

    private String description;

    private String cultivationPoints;

    private Integer status;
}
