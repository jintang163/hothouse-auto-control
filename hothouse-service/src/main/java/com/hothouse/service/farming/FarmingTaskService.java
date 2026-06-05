package com.hothouse.service.farming;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hothouse.common.dto.farming.TaskFeedbackDTO;
import com.hothouse.common.entity.farming.FarmingTask;
import com.hothouse.common.enums.farming.ParamType;
import com.hothouse.common.enums.farming.TaskStatus;

import java.math.BigDecimal;
import java.util.List;

public interface FarmingTaskService extends IService<FarmingTask> {

    List<FarmingTask> listByGreenhouseId(Long greenhouseId);

    List<FarmingTask> listByGreenhouseAndStatus(Long greenhouseId, TaskStatus status);

    List<FarmingTask> listPendingByExecutor(String executor);

    boolean generateTaskByThreshold(Long greenhouseId, Long prescriptionId, String triggerReason,
                                     String deviceCodes, BigDecimal deviationValue, ParamType paramType);

    boolean generateTaskByTimed(Long prescriptionId, Long operationId);

    boolean executeTaskByDevice(Long taskId);

    boolean submitTaskFeedback(TaskFeedbackDTO dto);

    boolean startTask(Long taskId, String executor);

    boolean cancelTask(Long taskId, String operator);

    String generateTaskCode();
}
