package com.hothouse.common.entity.farming;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hothouse.common.entity.BaseEntity;
import com.hothouse.common.enums.farming.PestType;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_pest_disease")
public class PestDisease extends BaseEntity {

    private static final long serialVersionUID = 1L;

    private String pestCode;

    private String pestName;

    private PestType pestType;

    private String scientificName;

    private String aliasNames;

    private String susceptibleCrops;

    private String symptomDescription;

    private String damageSymptom;

    private String occurrenceCondition;

    private String occurrencePeriod;

    private String imageUrls;

    private String preventionMethods;

    private String controlAgents;

    private String biologicalControl;

    private String agriculturalControl;

    private String physicalControl;

    private Integer severityLevel;

    private Integer status;
}
