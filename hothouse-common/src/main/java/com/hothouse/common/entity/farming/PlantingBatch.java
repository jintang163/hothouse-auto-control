package com.hothouse.common.entity.farming;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hothouse.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_planting_batch")
public class PlantingBatch extends BaseEntity {

    private static final long serialVersionUID = 1L;

    private String batchCode;

    private String batchName;

    private Long greenhouseId;

    private Long varietyId;

    private Long currentStageId;

    private LocalDate plantDate;

    private LocalDate expectedHarvestDate;

    private LocalDate actualHarvestDate;

    private Integer plantingDensity;

    private String seedSource;

    private Integer status;

    private BigDecimal totalYield;

    private BigDecimal totalCost;

    private String remark;
}
