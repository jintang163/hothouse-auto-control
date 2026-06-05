package com.hothouse.common.entity.farming;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hothouse.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_growth_stage")
public class GrowthStage extends BaseEntity {

    private static final long serialVersionUID = 1L;

    private Long varietyId;

    private String stageName;

    private String stageCode;

    private Integer stageOrder;

    private Integer durationDays;

    private String description;
}
