package com.hothouse.task;

import com.hothouse.common.entity.Device;
import com.hothouse.common.entity.Greenhouse;
import com.hothouse.common.entity.SensorData;
import com.hothouse.common.entity.farming.*;
import com.hothouse.common.enums.farming.*;
import com.hothouse.mapper.farming.FarmingTaskMapper;
import com.hothouse.mapper.farming.PrescriptionEnvTargetMapper;
import com.hothouse.mapper.farming.PrescriptionFertigationMapper;
import com.hothouse.mapper.farming.PrescriptionOperationMapper;
import com.hothouse.service.DeviceService;
import com.hothouse.service.GreenhouseService;
import com.hothouse.service.SensorDataService;
import com.hothouse.service.farming.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class TaskGenerationEngine {

    private final PlantingBatchService plantingBatchService;
    private final FarmingPrescriptionService prescriptionService;
    private final PrescriptionEnvTargetMapper envTargetMapper;
    private final PrescriptionFertigationMapper fertigationMapper;
    private final PrescriptionOperationMapper operationMapper;
    private final FarmingTaskService taskService;
    private final FarmingTaskMapper taskMapper;
    private final SensorDataService sensorDataService;
    private final GreenhouseService greenhouseService;
    private final DeviceService deviceService;

    @Scheduled(fixedRate = 60000)
    public void checkEnvironmentAndGenerateTasks() {
        log.info("Starting environment check and task generation...");
        
        List<Greenhouse> greenhouses = greenhouseService.list();
        for (Greenhouse greenhouse : greenhouses) {
            if (greenhouse.getStatus() != 1) {
                continue;
            }
            
            try {
                processGreenhouse(greenhouse.getId());
            } catch (Exception e) {
                log.error("Error processing greenhouse: {}", greenhouse.getId(), e);
            }
        }
        
        log.info("Environment check and task generation completed.");
    }

    @Scheduled(cron = "0 0 * * * ?")
    public void checkTimedOperations() {
        log.info("Starting timed operation check...");
        
        List<Greenhouse> greenhouses = greenhouseService.list();
        for (Greenhouse greenhouse : greenhouses) {
            if (greenhouse.getStatus() != 1) {
                continue;
            }
            
            try {
                generateTimedTasks(greenhouse.getId());
            } catch (Exception e) {
                log.error("Error generating timed tasks for greenhouse: {}", greenhouse.getId(), e);
            }
        }
        
        log.info("Timed operation check completed.");
    }

    private void processGreenhouse(Long greenhouseId) {
        PlantingBatch batch = plantingBatchService.getCurrentByGreenhouseId(greenhouseId);
        if (batch == null) {
            log.debug("No active planting batch for greenhouse: {}", greenhouseId);
            return;
        }

        FarmingPrescription prescription = prescriptionService.getLatestByVarietyAndStage(
                batch.getVarietyId(), batch.getCurrentStageId());
        if (prescription == null) {
            log.debug("No active prescription for variety: {}, stage: {}", 
                    batch.getVarietyId(), batch.getCurrentStageId());
            return;
        }

        checkEnvironmentDeviations(greenhouseId, prescription);
    }

    private void checkEnvironmentDeviations(Long greenhouseId, FarmingPrescription prescription) {
        SensorData latestData = sensorDataService.getLatest(greenhouseId);
        if (latestData == null) {
            return;
        }

        List<PrescriptionEnvTarget> envTargets = envTargetMapper.selectByPrescriptionId(prescription.getId());
        Map<String, BigDecimal> sensorValues = buildSensorValueMap(latestData);

        for (PrescriptionEnvTarget target : envTargets) {
            BigDecimal currentValue = sensorValues.get(target.getParamType().getCode());
            if (currentValue == null) {
                continue;
            }

            boolean needsAdjustment = checkDeviation(target, currentValue);
            if (needsAdjustment) {
                generateEnvAdjustmentTask(greenhouseId, prescription, target, currentValue);
            }
        }
    }

    private Map<String, BigDecimal> buildSensorValueMap(SensorData data) {
        Map<String, BigDecimal> map = new HashMap<>();
        map.put("TEMP", data.getTemperature());
        map.put("HUMIDITY", data.getHumidity());
        map.put("CO2", data.getCo2());
        map.put("LIGHT", data.getLightIntensity());
        map.put("SOIL_MOISTURE", data.getSoilMoisture());
        map.put("SOIL_TEMP", data.getSoilTemperature());
        return map;
    }

    private boolean checkDeviation(PrescriptionEnvTarget target, BigDecimal currentValue) {
        if (target.getTargetMin() != null && currentValue.compareTo(target.getTargetMin()) < 0) {
            BigDecimal deviation = target.getTargetMin().subtract(currentValue);
            return deviation.compareTo(target.getToleranceThreshold()) > 0;
        }
        if (target.getTargetMax() != null && currentValue.compareTo(target.getTargetMax()) > 0) {
            BigDecimal deviation = currentValue.subtract(target.getTargetMax());
            return deviation.compareTo(target.getToleranceThreshold()) > 0;
        }
        return false;
    }

    private void generateEnvAdjustmentTask(Long greenhouseId, FarmingPrescription prescription,
                                           PrescriptionEnvTarget target, BigDecimal currentValue) {
        BigDecimal deviation = currentValue.subtract(target.getTargetValue() != null ? 
                target.getTargetValue() : BigDecimal.ZERO);
        BigDecimal absDeviation = deviation.abs();
        
        String triggerReason = String.format("%s当前值%s，目标范围%s-%s，偏差%s，超过阈值%s",
                target.getParamType().getDesc(), currentValue, 
                target.getTargetMin(), target.getTargetMax(),
                absDeviation, target.getToleranceThreshold());

        List<Device> devices = deviceService.getByType(greenhouseId, 
                getDeviceTypeByParam(target.getParamType()));
        String deviceCodes = devices.stream()
                .map(Device::getDeviceCode)
                .reduce((a, b) -> a + "," + b)
                .orElse(null);

        taskService.generateTaskByThreshold(greenhouseId, prescription.getId(), 
                triggerReason, deviceCodes, absDeviation);
    }

    private com.hothouse.common.enums.DeviceType getDeviceTypeByParam(ParamType paramType) {
        return switch (paramType) {
            case TEMP -> com.hothouse.common.enums.DeviceType.FAN;
            case HUMIDITY -> com.hothouse.common.enums.DeviceType.WET_CURTAIN;
            case LIGHT -> com.hothouse.common.enums.DeviceType.SUNSHADE_NET;
            default -> com.hothouse.common.enums.DeviceType.FAN;
        };
    }

    private void generateTimedTasks(Long greenhouseId) {
        PlantingBatch batch = plantingBatchService.getCurrentByGreenhouseId(greenhouseId);
        if (batch == null) {
            return;
        }

        FarmingPrescription prescription = prescriptionService.getLatestByVarietyAndStage(
                batch.getVarietyId(), batch.getCurrentStageId());
        if (prescription == null) {
            return;
        }

        List<PrescriptionFertigation> fertigations = fertigationMapper.selectByPrescriptionId(prescription.getId());
        for (PrescriptionFertigation fertigation : fertigations) {
            if (shouldGenerateTimedTask(prescription.getId(), fertigation.getFrequencyHours())) {
                taskService.generateTaskByTimed(prescription.getId(), null);
            }
        }

        List<PrescriptionOperation> operations = operationMapper.selectByPrescriptionId(prescription.getId());
        for (PrescriptionOperation operation : operations) {
            if (shouldGenerateTimedTask(prescription.getId(), operation.getFrequencyHours())) {
                taskService.generateTaskByTimed(prescription.getId(), operation.getId());
            }
        }
    }

    private boolean shouldGenerateTimedTask(Long prescriptionId, Integer frequencyHours) {
        if (frequencyHours == null || frequencyHours <= 0) {
            return false;
        }
        
        LocalDateTime startTime = LocalDateTime.now().minusHours(frequencyHours);
        FarmingTask latestTask = taskMapper.selectLatestTimedTask(prescriptionId, startTime);
        
        return latestTask == null;
    }
}
