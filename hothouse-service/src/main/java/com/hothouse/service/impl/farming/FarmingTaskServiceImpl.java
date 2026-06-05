package com.hothouse.service.impl.farming;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.dto.DeviceControlDTO;
import com.hothouse.common.dto.farming.TaskFeedbackDTO;
import com.hothouse.common.entity.farming.FarmingPrescription;
import com.hothouse.common.entity.farming.FarmingTask;
import com.hothouse.common.entity.farming.PrescriptionFertigation;
import com.hothouse.common.entity.farming.PrescriptionOperation;
import com.hothouse.common.enums.farming.ExecutionMethod;
import com.hothouse.common.enums.farming.LogType;
import com.hothouse.common.enums.farming.ParamType;
import com.hothouse.common.enums.farming.TaskStatus;
import com.hothouse.common.enums.farming.TaskType;
import com.hothouse.common.enums.farming.TriggerSource;
import com.hothouse.mapper.farming.FarmingTaskMapper;
import com.hothouse.mapper.farming.PrescriptionFertigationMapper;
import com.hothouse.mapper.farming.PrescriptionOperationMapper;
import com.hothouse.netty.command.CommandService;
import com.hothouse.service.farming.FarmingLogService;
import com.hothouse.service.farming.FarmingPrescriptionService;
import com.hothouse.service.farming.FarmingTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FarmingTaskServiceImpl extends ServiceImpl<FarmingTaskMapper, FarmingTask>
        implements FarmingTaskService {

    private final FarmingTaskMapper farmingTaskMapper;
    private final FarmingLogService farmingLogService;
    private final CommandService commandService;
    private final FarmingPrescriptionService farmingPrescriptionService;
    private final PrescriptionOperationMapper prescriptionOperationMapper;
    private final PrescriptionFertigationMapper prescriptionFertigationMapper;

    @Override
    public List<FarmingTask> listByGreenhouseId(Long greenhouseId) {
        return farmingTaskMapper.selectByGreenhouseId(greenhouseId);
    }

    @Override
    public List<FarmingTask> listByGreenhouseAndStatus(Long greenhouseId, TaskStatus status) {
        return farmingTaskMapper.selectByGreenhouseAndStatus(greenhouseId, status.getCode());
    }

    @Override
    public List<FarmingTask> listPendingByExecutor(String executor) {
        return farmingTaskMapper.selectPendingByExecutor(executor);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean generateTaskByThreshold(Long greenhouseId, Long prescriptionId, String triggerReason,
                                        String deviceCodes, BigDecimal deviationValue, ParamType paramType) {
        log.info("Generate task by threshold, greenhouseId: {}, prescriptionId: {}, paramType: {}, triggerReason: {}",
                greenhouseId, prescriptionId, paramType, triggerReason);

        FarmingPrescription prescription = farmingPrescriptionService.getById(prescriptionId);
        if (prescription == null) {
            log.error("Prescription not found, id: {}", prescriptionId);
            return false;
        }

        LocalDateTime checkTime = LocalDateTime.now().minusMinutes(30);
        FarmingTask existingTask = farmingTaskMapper.selectExistingEnvTask(
                greenhouseId, prescriptionId, paramType.getCode(), checkTime);
        if (existingTask != null) {
            log.warn("Env adjust task already exists for greenhouse: {}, prescription: {}, paramType: {}, existingTaskId: {}",
                    greenhouseId, prescriptionId, paramType, existingTask.getId());
            return false;
        }

        FarmingTask task = new FarmingTask();
        task.setTaskCode(generateTaskCode());
        task.setTaskName("环境调节任务");
        task.setTaskType(TaskType.ENV_ADJUST);
        task.setGreenhouseId(greenhouseId);
        task.setPrescriptionId(prescriptionId);
        task.setTriggerSource(TriggerSource.AUTO_THRESHOLD);
        task.setTriggerReason(triggerReason);
        task.setExecutionMethod(ExecutionMethod.DEVICE);
        task.setDeviceCodes(deviceCodes);
        task.setStatus(TaskStatus.PENDING);
        task.setPriority(1);
        task.setPlanStartTime(LocalDateTime.now());
        task.setDeviationValue(deviationValue);
        task.setParamType(paramType);

        boolean saved = super.save(task);
        if (saved) {
            log.info("Env adjust task generated successfully, taskId: {}, taskCode: {}",
                    task.getId(), task.getTaskCode());
        }
        return saved;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean generateTaskByTimed(Long prescriptionId, Long operationId) {
        log.info("Generate task by timed, prescriptionId: {}, operationId: {}", prescriptionId, operationId);

        FarmingPrescription prescription = farmingPrescriptionService.getById(prescriptionId);
        if (prescription == null) {
            log.error("Prescription not found, id: {}", prescriptionId);
            return false;
        }

        LocalDateTime startTime = LocalDate.now().atStartOfDay();
        FarmingTask existingTask = farmingTaskMapper.selectLatestTimedTask(prescriptionId, startTime);
        if (existingTask != null) {
            log.warn("Timed task already generated today for prescription: {}, operation: {}",
                    prescriptionId, operationId);
            return false;
        }

        PrescriptionOperation operation = prescriptionOperationMapper.selectById(operationId);
        PrescriptionFertigation fertigation = null;
        TaskType taskType;
        String taskName;
        String deviceCodes;
        ExecutionMethod executionMethod;

        if (operation != null) {
            taskType = TaskType.OPERATION;
            taskName = operation.getOperationName();
            deviceCodes = operation.getDeviceCodes();
            executionMethod = operation.getDeviceCodes() != null && !operation.getDeviceCodes().isEmpty()
                    ? ExecutionMethod.DEVICE : ExecutionMethod.MANUAL;
        } else {
            fertigation = prescriptionFertigationMapper.selectById(operationId);
            if (fertigation == null) {
                log.error("Operation or fertigation not found, id: {}", operationId);
                return false;
            }
            taskType = TaskType.FERTIGATION;
            taskName = fertigation.getOperationType() != null
                    ? fertigation.getOperationType().getDesc() : "水肥作业";
            deviceCodes = fertigation.getDeviceCodes();
            executionMethod = fertigation.getDeviceCodes() != null && !fertigation.getDeviceCodes().isEmpty()
                    ? ExecutionMethod.DEVICE : ExecutionMethod.MANUAL;
        }

        FarmingTask task = new FarmingTask();
        task.setTaskCode(generateTaskCode());
        task.setTaskName(taskName);
        task.setTaskType(taskType);
        task.setGreenhouseId(prescription.getGreenhouseId());
        task.setPrescriptionId(prescriptionId);
        task.setOperationId(operationId);
        task.setTriggerSource(TriggerSource.AUTO_TIMED);
        task.setTriggerReason("定时触发");
        task.setExecutionMethod(executionMethod);
        task.setDeviceCodes(deviceCodes);
        task.setStatus(TaskStatus.PENDING);
        task.setPriority(0);
        task.setPlanStartTime(LocalDateTime.now());

        if (operation != null && operation.getStandardDuration() != null) {
            task.setPlanEndTime(LocalDateTime.now().plusMinutes(operation.getStandardDuration()));
        }

        boolean saved = super.save(task);
        if (saved) {
            log.info("Timed task generated successfully, taskId: {}, taskCode: {}, type: {}",
                    task.getId(), task.getTaskCode(), taskType);
        }
        return saved;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean executeTaskByDevice(Long taskId) {
        log.info("Execute task by device, taskId: {}", taskId);

        FarmingTask task = getById(taskId);
        if (task == null) {
            log.error("Task not found, id: {}", taskId);
            return false;
        }

        if (task.getStatus() != TaskStatus.PENDING) {
            log.warn("Task status is not PENDING, taskId: {}, status: {}", taskId, task.getStatus());
            return false;
        }

        if (task.getExecutionMethod() != ExecutionMethod.DEVICE) {
            log.warn("Task execution method is not DEVICE, taskId: {}, method: {}",
                    taskId, task.getExecutionMethod());
            return false;
        }

        String deviceCodes = task.getDeviceCodes();
        if (deviceCodes == null || deviceCodes.isEmpty()) {
            log.error("No device codes for task, taskId: {}", taskId);
            return false;
        }

        task.setStatus(TaskStatus.EXECUTING);
        task.setActualStartTime(LocalDateTime.now());
        super.updateById(task);

        String[] codes = deviceCodes.split(",");
        boolean allSuccess = true;
        StringBuilder feedbackBuilder = new StringBuilder();

        for (String deviceCode : codes) {
            deviceCode = deviceCode.trim();
            if (deviceCode.isEmpty()) {
                continue;
            }

            DeviceControlDTO controlDTO = new DeviceControlDTO();
            controlDTO.setDeviceCode(deviceCode);
            controlDTO.setAction(1);
            controlDTO.setOperator("SYSTEM");
            controlDTO.setRemark("任务执行: " + task.getTaskName());

            boolean success = commandService.sendCommand(controlDTO, "TASK_" + task.getTaskCode());
            if (!success) {
                allSuccess = false;
                feedbackBuilder.append("设备[").append(deviceCode).append("]执行失败; ");
                log.error("Device command failed, taskId: {}, deviceCode: {}", taskId, deviceCode);
            } else {
                feedbackBuilder.append("设备[").append(deviceCode).append("]执行成功; ");
                log.info("Device command success, taskId: {}, deviceCode: {}", taskId, deviceCode);
            }
        }

        task.setActualEndTime(LocalDateTime.now());
        if (task.getActualStartTime() != null) {
            long minutes = Duration.between(task.getActualStartTime(), task.getActualEndTime()).toMinutes();
            task.setActualDuration((int) minutes);
        }

        if (allSuccess) {
            task.setStatus(TaskStatus.COMPLETED);
            task.setFeedbackContent(feedbackBuilder.toString());
        } else {
            task.setStatus(TaskStatus.FAILED);
            task.setFeedbackContent(feedbackBuilder.toString());
        }

        boolean updated = super.updateById(task);

        if (updated && task.getStatus() == TaskStatus.COMPLETED) {
            createFarmingLog(task);
        }

        return allSuccess;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean submitTaskFeedback(TaskFeedbackDTO dto) {
        log.info("Submit task feedback, taskId: {}, operator: {}", dto.getTaskId(), dto.getOperator());

        FarmingTask task = getById(dto.getTaskId());
        if (task == null) {
            log.error("Task not found, id: {}", dto.getTaskId());
            return false;
        }

        if (task.getStatus() != TaskStatus.EXECUTING && task.getStatus() != TaskStatus.PENDING) {
            log.warn("Task status is not EXECUTING or PENDING, taskId: {}, status: {}",
                    dto.getTaskId(), task.getStatus());
            return false;
        }

        task.setActualEndTime(dto.getActualEndTime() != null ? dto.getActualEndTime() : LocalDateTime.now());

        if (task.getActualStartTime() != null) {
            LocalDateTime endTime = task.getActualEndTime();
            long minutes = Duration.between(task.getActualStartTime(), endTime).toMinutes();
            if (dto.getActualDuration() != null) {
                task.setActualDuration(dto.getActualDuration());
            } else {
                task.setActualDuration((int) minutes);
            }
        } else {
            task.setActualDuration(dto.getActualDuration());
        }

        task.setActualUsage(dto.getActualUsage());
        task.setUsageUnit(dto.getUsageUnit());
        task.setFeedbackContent(dto.getFeedbackContent());
        task.setStatus(TaskStatus.COMPLETED);

        boolean updated = super.updateById(task);
        if (updated) {
            createFarmingLog(task);
            log.info("Task feedback submitted successfully, taskId: {}", dto.getTaskId());
        }
        return updated;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean startTask(Long taskId, String executor) {
        log.info("Start task, taskId: {}, executor: {}", taskId, executor);

        FarmingTask task = getById(taskId);
        if (task == null) {
            log.error("Task not found, id: {}", taskId);
            return false;
        }

        if (task.getStatus() != TaskStatus.PENDING) {
            log.warn("Task status is not PENDING, taskId: {}, status: {}", taskId, task.getStatus());
            return false;
        }

        task.setStatus(TaskStatus.EXECUTING);
        task.setExecutor(executor);
        task.setActualStartTime(LocalDateTime.now());

        return super.updateById(task);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean cancelTask(Long taskId, String operator) {
        log.info("Cancel task, taskId: {}, operator: {}", taskId, operator);

        FarmingTask task = getById(taskId);
        if (task == null) {
            log.error("Task not found, id: {}", taskId);
            return false;
        }

        if (task.getStatus() == TaskStatus.COMPLETED || task.getStatus() == TaskStatus.CANCELLED) {
            log.warn("Task cannot be cancelled, taskId: {}, status: {}", taskId, task.getStatus());
            return false;
        }

        task.setStatus(TaskStatus.CANCELLED);
        task.setFeedbackContent("任务已取消，操作人：" + operator);
        task.setActualEndTime(LocalDateTime.now());

        if (task.getActualStartTime() != null) {
            long minutes = Duration.between(task.getActualStartTime(), task.getActualEndTime()).toMinutes();
            task.setActualDuration((int) minutes);
        }

        return super.updateById(task);
    }

    @Override
    public String generateTaskCode() {
        String prefix = "TASK";
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String fullPrefix = prefix + "-" + datePart + "-";

        String maxCode = farmingTaskMapper.selectMaxTaskCode(fullPrefix);

        int sequence = 1;
        if (maxCode != null && !maxCode.isEmpty()) {
            String[] parts = maxCode.split("-");
            if (parts.length == 3) {
                try {
                    sequence = Integer.parseInt(parts[2]) + 1;
                } catch (NumberFormatException e) {
                    sequence = 1;
                }
            }
        }

        return String.format("%s-%s-%04d", prefix, datePart, sequence);
    }

    private void createFarmingLog(FarmingTask task) {
        try {
            FarmingPrescription prescription = farmingPrescriptionService.getById(task.getPrescriptionId());
            Long varietyId = prescription != null ? prescription.getVarietyId() : null;
            Long stageId = prescription != null ? prescription.getStageId() : null;

            StringBuilder logContent = new StringBuilder();
            logContent.append("任务[").append(task.getTaskName()).append("]执行完成。");
            if (task.getActualDuration() != null) {
                logContent.append("实际耗时：").append(task.getActualDuration()).append("分钟。");
            }
            if (task.getActualUsage() != null) {
                logContent.append("实际用量：").append(task.getActualUsage());
                if (task.getUsageUnit() != null) {
                    logContent.append(task.getUsageUnit());
                }
                logContent.append("。");
            }
            if (task.getFeedbackContent() != null) {
                logContent.append("反馈：").append(task.getFeedbackContent());
            }

            farmingLogService.createLog(
                    task.getGreenhouseId(),
                    task.getId(),
                    task.getPrescriptionId(),
                    varietyId,
                    stageId,
                    LogType.TASK,
                    logContent.toString(),
                    task.getExecutor() != null ? task.getExecutor() : "SYSTEM",
                    null,
                    null
            );
            log.info("Farming log created for task: {}", task.getTaskCode());
        } catch (Exception e) {
            log.error("Create farming log error, taskId: {}", task.getId(), e);
        }
    }
}
