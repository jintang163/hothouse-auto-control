package com.hothouse.common.entity.farming;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hothouse.common.entity.BaseEntity;
import com.hothouse.common.enums.farming.ExecutionMethod;
import com.hothouse.common.enums.farming.ParamType;
import com.hothouse.common.enums.farming.TaskStatus;
import com.hothouse.common.enums.farming.TaskType;
import com.hothouse.common.enums.farming.TriggerSource;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_farming_task")
public class FarmingTask extends BaseEntity {

    private static final long serialVersionUID = 1L;

    private String taskCode;

    private String taskName;

    private TaskType taskType;

    private Long greenhouseId;

    private Long prescriptionId;

    private Long operationId;

    private TriggerSource triggerSource;

    private String triggerReason;

    private String executor;

    private ExecutionMethod executionMethod;

    private String deviceCodes;

    private TaskStatus status;

    private Integer priority;

    private LocalDateTime planStartTime;

    private LocalDateTime planEndTime;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    private Integer actualDuration;

    private BigDecimal actualUsage;

    private String usageUnit;

    private String feedbackContent;

    private BigDecimal deviationValue;

    private ParamType paramType;
}
