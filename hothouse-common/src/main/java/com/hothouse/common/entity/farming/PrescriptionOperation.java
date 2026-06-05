package com.hothouse.common.entity.farming;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hothouse.common.entity.BaseEntity;
import com.hothouse.common.enums.farming.OperationType;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_prescription_operation")
public class PrescriptionOperation extends BaseEntity {

    private static final long serialVersionUID = 1L;

    private Long prescriptionId;

    private String operationName;

    private OperationType operationType;

    private String operationContent;

    private Integer frequencyHours;

    private Integer standardDuration;

    private Integer workerCount;

    private String toolsRequired;

    private String safetyNotes;

    private String deviceCodes;

    private String triggerCondition;
}
