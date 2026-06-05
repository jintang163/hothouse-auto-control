package com.hothouse.common.entity.farming;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hothouse.common.entity.BaseEntity;
import com.hothouse.common.enums.farming.OperationType;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_prescription_fertigation")
public class PrescriptionFertigation extends BaseEntity {

    private static final long serialVersionUID = 1L;

    private Long prescriptionId;

    private OperationType operationType;

    private String fertilizerType;

    private String fertilizerName;

    private BigDecimal dosage;

    private String dosageUnit;

    private BigDecimal waterAmount;

    private BigDecimal phTarget;

    private BigDecimal ecTarget;

    private Integer frequencyHours;

    private String triggerCondition;

    private String deviceCodes;
}
