package com.hothouse.common.dto.farming;

import lombok.Data;

import java.io.Serializable;

@Data
public class PrescriptionCopyDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long sourcePrescriptionId;

    private String newPrescriptionName;

    private Long targetGreenhouseId;

    private String creator;
}
