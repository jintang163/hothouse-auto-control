package com.hothouse.common.entity.farming;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hothouse.common.entity.BaseEntity;
import com.hothouse.common.enums.farming.PrescriptionStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_farming_prescription")
public class FarmingPrescription extends BaseEntity {

    private static final long serialVersionUID = 1L;

    private String prescriptionCode;

    private String prescriptionName;

    private Long varietyId;

    private Long stageId;

    private Long greenhouseId;

    private Integer version;

    private Long parentId;

    private PrescriptionStatus status;

    private String creator;

    private String description;

    private String remark;
}
