package com.hothouse.common.dto;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class RuleExecutionResult implements Serializable {

    private static final long serialVersionUID = 1L;

    private Boolean executed;

    private List<DeviceControlDTO> controlActions;

    private String reason;

    private Long strategyId;

    private String strategyName;
}
