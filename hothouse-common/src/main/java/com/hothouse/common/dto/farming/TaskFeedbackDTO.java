package com.hothouse.common.dto.farming;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TaskFeedbackDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long taskId;

    private Integer actualDuration;

    private BigDecimal actualUsage;

    private String usageUnit;

    private String feedbackContent;

    private String operator;

    private LocalDateTime actualEndTime;
}
