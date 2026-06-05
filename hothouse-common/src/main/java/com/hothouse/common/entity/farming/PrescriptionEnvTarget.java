package com.hothouse.common.entity.farming;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hothouse.common.entity.BaseEntity;
import com.hothouse.common.enums.farming.ParamType;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_prescription_env_target")
public class PrescriptionEnvTarget extends BaseEntity {

    private static final long serialVersionUID = 1L;

    private Long prescriptionId;

    private ParamType paramType;

    private BigDecimal targetMin;

    private BigDecimal targetMax;

    private BigDecimal targetValue;

    private BigDecimal toleranceThreshold;

    private String unit;

    private Integer priority;
}
