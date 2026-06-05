package com.hothouse.admin.controller.mobile;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hothouse.common.dto.RealTimeDataDTO;
import com.hothouse.common.dto.farming.PestIdentifyDTO;
import com.hothouse.common.dto.farming.TaskFeedbackDTO;
import com.hothouse.common.entity.farming.*;
import com.hothouse.common.enums.farming.HandleStatus;
import com.hothouse.common.enums.farming.TaskStatus;
import com.hothouse.common.result.Result;
import com.hothouse.service.DeviceControlService;
import com.hothouse.service.farming.*;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/mobile/farming")
@RequiredArgsConstructor
public class MobileFarmingController {

    private final PlantingBatchService plantingBatchService;
    private final FarmingTaskService farmingTaskService;
    private final FarmingLogService farmingLogService;
    private final PestDiseaseService pestDiseaseService;
    private final PestIdentificationService pestIdentificationService;
    private final YieldRecordService yieldRecordService;
    private final FarmingPrescriptionService farmingPrescriptionService;
    private final DeviceControlService deviceControlService;

    @GetMapping("/home/{greenhouseId}")
    public Result<Map<String, Object>> getHomeData(@PathVariable Long greenhouseId) {
        Map<String, Object> data = new HashMap<>();

        PlantingBatch currentBatch = plantingBatchService.getCurrentByGreenhouseId(greenhouseId);
        data.put("currentBatch", currentBatch);

        RealTimeDataDTO realTimeData = deviceControlService.getRealTimeData(greenhouseId);
        data.put("environmentData", realTimeData);

        long todayTaskCount = farmingTaskService.count(new LambdaQueryWrapper<FarmingTask>()
                .eq(FarmingTask::getGreenhouseId, greenhouseId)
                .in(FarmingTask::getStatus, TaskStatus.PENDING, TaskStatus.IN_PROGRESS)
                .ge(FarmingTask::getPlanStartTime, LocalDateTime.now().toLocalDate().atStartOfDay())
                .lt(FarmingTask::getPlanStartTime, LocalDateTime.now().toLocalDate().plusDays(1).atStartOfDay()));
        data.put("todayTaskCount", todayTaskCount);

        long pendingIdentifyCount = pestIdentificationService.count(new LambdaQueryWrapper<PestIdentification>()
                .eq(PestIdentification::getGreenhouseId, greenhouseId)
                .eq(PestIdentification::getHandleStatus, HandleStatus.PENDING));
        data.put("pendingIdentifyCount", pendingIdentifyCount);

        List<Map<String, Object>> yieldTrend = getYieldTrendData(greenhouseId, 7);
        data.put("yieldTrend", yieldTrend);

        return Result.success(data);
    }

    @GetMapping("/tasks")
    public Result<Page<FarmingTask>> getTaskList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long greenhouseId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String executor) {
        LambdaQueryWrapper<FarmingTask> wrapper = new LambdaQueryWrapper<>();
        if (greenhouseId != null) {
            wrapper.eq(FarmingTask::getGreenhouseId, greenhouseId);
        }
        if (status != null) {
            wrapper.eq(FarmingTask::getStatus, TaskStatus.getByCode(status));
        }
        if (StringUtils.hasText(executor)) {
            wrapper.eq(FarmingTask::getExecutor, executor);
        }
        wrapper.orderByDesc(FarmingTask::getPriority, FarmingTask::getCreateTime);
        return Result.success(farmingTaskService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/tasks/{id}")
    public Result<FarmingTask> getTaskDetail(@PathVariable Long id) {
        return Result.success(farmingTaskService.getById(id));
    }

    @PostMapping("/tasks/{id}/start")
    public Result<Boolean> startTask(@PathVariable Long id, @RequestParam String executor) {
        return Result.success(farmingTaskService.startTask(id, executor));
    }

    @PostMapping("/tasks/{id}/execute")
    public Result<Boolean> executeTaskByDevice(@PathVariable Long id) {
        return Result.success(farmingTaskService.executeTaskByDevice(id));
    }

    @PostMapping("/tasks/{id}/feedback")
    public Result<Boolean> submitTaskFeedback(@PathVariable Long id, @RequestBody TaskFeedbackDTO dto) {
        dto.setTaskId(id);
        return Result.success(farmingTaskService.submitTaskFeedback(dto));
    }

    @PostMapping("/tasks/{id}/cancel")
    public Result<Boolean> cancelTask(@PathVariable Long id, @RequestParam String operator) {
        return Result.success(farmingTaskService.cancelTask(id, operator));
    }

    @GetMapping("/logs")
    public Result<Page<FarmingLog>> getLogList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long greenhouseId,
            @RequestParam(required = false) Long taskId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        LambdaQueryWrapper<FarmingLog> wrapper = new LambdaQueryWrapper<>();
        if (greenhouseId != null) {
            wrapper.eq(FarmingLog::getGreenhouseId, greenhouseId);
        }
        if (taskId != null) {
            wrapper.eq(FarmingLog::getTaskId, taskId);
        }
        if (startTime != null) {
            wrapper.ge(FarmingLog::getOperationTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(FarmingLog::getOperationTime, endTime);
        }
        wrapper.orderByDesc(FarmingLog::getOperationTime);
        return Result.success(farmingLogService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/logs/task/{taskId}")
    public Result<List<FarmingLog>> getLogsByTask(@PathVariable Long taskId) {
        LambdaQueryWrapper<FarmingLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FarmingLog::getTaskId, taskId);
        wrapper.orderByDesc(FarmingLog::getOperationTime);
        return Result.success(farmingLogService.list(wrapper));
    }

    @PostMapping("/logs")
    public Result<Boolean> createLog(@RequestBody FarmingLog log) {
        if (log.getOperationTime() == null) {
            log.setOperationTime(LocalDateTime.now());
        }
        if (log.getLogCode() == null) {
            log.setLogCode(farmingLogService.generateLogCode());
        }
        return Result.success(farmingLogService.save(log));
    }

    @GetMapping("/pests")
    public Result<List<PestDisease>> getPestList(
            @RequestParam(required = false) String pestType,
            @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<PestDisease> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(pestType)) {
            wrapper.eq(PestDisease::getPestType, pestType);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.like(PestDisease::getPestName, keyword)
                    .or().like(PestDisease::getAliasNames, keyword)
                    .or().like(PestDisease::getSymptomDescription, keyword);
        }
        wrapper.eq(PestDisease::getStatus, 1);
        wrapper.orderByDesc(PestDisease::getSeverityLevel);
        return Result.success(pestDiseaseService.list(wrapper));
    }

    @GetMapping("/pests/{id}")
    public Result<PestDisease> getPestDetail(@PathVariable Long id) {
        return Result.success(pestDiseaseService.getById(id));
    }

    @PostMapping("/pests/identify")
    public Result<PestIdentification> identifyPest(@RequestBody PestIdentifyDTO dto) {
        return Result.success(pestDiseaseService.identifyPest(dto));
    }

    @GetMapping("/pests/records")
    public Result<Page<PestIdentification>> getIdentifyRecords(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long greenhouseId,
            @RequestParam(required = false) Integer handleStatus,
            @RequestParam(required = false) String handler) {
        LambdaQueryWrapper<PestIdentification> wrapper = new LambdaQueryWrapper<>();
        if (greenhouseId != null) {
            wrapper.eq(PestIdentification::getGreenhouseId, greenhouseId);
        }
        if (handleStatus != null) {
            wrapper.eq(PestIdentification::getHandleStatus, HandleStatus.values()[handleStatus]);
        }
        if (StringUtils.hasText(handler)) {
            wrapper.eq(PestIdentification::getHandler, handler);
        }
        wrapper.orderByDesc(PestIdentification::getIdentifyTime);
        return Result.success(pestIdentificationService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/yield")
    public Result<Page<YieldRecord>> getYieldList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long greenhouseId,
            @RequestParam(required = false) Long varietyId) {
        LambdaQueryWrapper<YieldRecord> wrapper = new LambdaQueryWrapper<>();
        if (greenhouseId != null) {
            wrapper.eq(YieldRecord::getGreenhouseId, greenhouseId);
        }
        if (varietyId != null) {
            wrapper.eq(YieldRecord::getVarietyId, varietyId);
        }
        wrapper.orderByDesc(YieldRecord::getHarvestDate);
        return Result.success(yieldRecordService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/yield/trend/{greenhouseId}")
    public Result<List<Map<String, Object>>> getYieldTrend(
            @PathVariable Long greenhouseId,
            @RequestParam(defaultValue = "7") Integer days) {
        List<Map<String, Object>> trend = getYieldTrendData(greenhouseId, days);
        return Result.success(trend);
    }

    @PostMapping("/yield")
    public Result<Boolean> submitYieldRecord(@RequestBody YieldRecord record) {
        if (record.getRecordCode() == null) {
            record.setRecordCode(yieldRecordService.generateRecordCode());
        }
        if (record.getHarvestDate() == null) {
            record.setHarvestDate(LocalDate.now());
        }
        return Result.success(yieldRecordService.save(record));
    }

    @GetMapping("/prescriptions/current/{greenhouseId}")
    public Result<FarmingPrescription> getCurrentPrescription(@PathVariable Long greenhouseId) {
        PlantingBatch batch = plantingBatchService.getCurrentByGreenhouseId(greenhouseId);
        if (batch == null) {
            return Result.success(null);
        }
        FarmingPrescription prescription = farmingPrescriptionService.getLatestByVarietyAndStage(
                batch.getVarietyId(), batch.getCurrentStageId());
        return Result.success(prescription);
    }

    private List<Map<String, Object>> getYieldTrendData(Long greenhouseId, int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);

        List<YieldRecord> records = yieldRecordService.listByDateRange(greenhouseId, startDate, endDate);

        Map<LocalDate, BigDecimal> dailyYield = records.stream()
                .collect(Collectors.groupingBy(
                        YieldRecord::getHarvestDate,
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                YieldRecord::getYieldQuantity,
                                BigDecimal::add
                        )
                ));

        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LocalDate date = startDate.plusDays(i);
            Map<String, Object> item = new HashMap<>();
            item.put("date", date.toString());
            item.put("yield", dailyYield.getOrDefault(date, BigDecimal.ZERO));
            trend.add(item);
        }
        return trend;
    }
}
