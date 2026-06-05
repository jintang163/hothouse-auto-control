package com.hothouse.common.dto.farming;

import com.hothouse.common.entity.farming.PrescriptionEnvTarget;
import com.hothouse.common.entity.farming.PrescriptionFertigation;
import com.hothouse.common.entity.farming.PrescriptionOperation;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class PrescriptionDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String prescriptionCode;

    private String prescriptionName;

    private Long varietyId;

    private Long stageId;

    private Long greenhouseId;

    private String description;

    private String remark;

    private String creator;

    private List<PrescriptionEnvTarget> envTargets;

    private List<PrescriptionFertigation> fertigations;

    private List<PrescriptionOperation> operations;
}
