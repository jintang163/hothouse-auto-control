package com.hothouse.common.entity.farming;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hothouse.common.entity.BaseEntity;
import com.hothouse.common.enums.farming.QualityLevel;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_yield_record")
public class YieldRecord extends BaseEntity {

    private static final long serialVersionUID = 1L;

    private String recordCode;

    private Long greenhouseId;

    private Long varietyId;

    private Long stageId;

    private LocalDate harvestDate;

    private BigDecimal yieldQuantity;

    private String yieldUnit;

    private QualityLevel qualityLevel;

    private BigDecimal averageWeight;

    private BigDecimal commodityRate;

    private Integer harvestWorkers;

    private Integer harvestDuration;

    private String weather;

    private String remark;
}
