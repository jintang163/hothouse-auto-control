package com.hothouse.service.impl;

import com.hothouse.common.dto.DeviceControlDTO;
import com.hothouse.common.dto.RealTimeDataDTO;
import com.hothouse.common.dto.RuleExecutionResult;
import com.hothouse.common.entity.ControlStrategy;
import com.hothouse.common.entity.Device;
import com.hothouse.common.entity.Greenhouse;
import com.hothouse.common.entity.SensorData;
import com.hothouse.common.enums.ControlMode;
import com.hothouse.common.enums.DeviceType;
import com.hothouse.netty.command.CommandService;
import com.hothouse.rule.DefaultRuleEngine;
import com.hothouse.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceControlServiceImpl implements DeviceControlService {

    private final DeviceService deviceService;
    private final SensorDataService sensorDataService;
    private final ControlStrategyService strategyService;
    private final GreenhouseService greenhouseService;
    private final DefaultRuleEngine ruleEngine;
    private final CommandService commandService;
    private final AlarmService alarmService;

    private final Map<Long, ControlMode> greenhouseControlMode = new ConcurrentHashMap<>();

    @Override
    public boolean manualControl(DeviceControlDTO controlDTO) {
        log.info("Manual control request, device: {}, action: {}, operator: {}",
                controlDTO.getDeviceCode(), controlDTO.getAction(), controlDTO.getOperator());

        ControlMode currentMode = greenhouseControlMode.get(getGreenhouseIdByDevice(controlDTO.getDeviceCode()));
        if (currentMode == ControlMode.AUTO) {
            log.warn("Greenhouse is in AUTO mode, manual control disabled");
            return false;
        }

        return commandService.sendCommand(controlDTO, "MANUAL");
    }

    @Override
    public boolean autoControl(SensorData sensorData) {
        Long greenhouseId = sensorData.getGreenhouseId();
        ControlMode mode = greenhouseControlMode.getOrDefault(greenhouseId, ControlMode.AUTO);

        if (mode != ControlMode.AUTO) {
            log.debug("Greenhouse {} not in AUTO mode, skip auto control", greenhouseId);
            return false;
        }

        List<ControlStrategy> strategies = strategyService.getActiveByGreenhouseId(greenhouseId);
        if (strategies.isEmpty()) {
            log.debug("No active strategy for greenhouse {}", greenhouseId);
            return false;
        }

        boolean allSuccess = true;
        for (ControlStrategy strategy : strategies) {
            RuleExecutionResult result = ruleEngine.execute(strategy, sensorData);

            if (result.getExecuted() && result.getControlActions() != null) {
                for (DeviceControlDTO action : result.getControlActions()) {
                    boolean success = commandService.sendCommand(action,
                            "AUTO_" + strategy.getStrategyName());
                    if (!success) {
                        allSuccess = false;
                        log.error("Auto control failed, device: {}, action: {}",
                                action.getDeviceCode(), action.getAction());
                    }
                }
            }
        }

        return allSuccess;
    }

    @Override
    public RealTimeDataDTO getRealTimeData(Long greenhouseId) {
        RealTimeDataDTO dto = new RealTimeDataDTO();
        dto.setGreenhouseId(greenhouseId);

        Greenhouse greenhouse = greenhouseService.getById(greenhouseId);
        if (greenhouse != null) {
            dto.setGreenhouseName(greenhouse.getName());
        }

        SensorData latestData = sensorDataService.getLatest(greenhouseId);
        if (latestData != null) {
            dto.setTemperature(latestData.getTemperature());
            dto.setHumidity(latestData.getHumidity());
            dto.setCo2(latestData.getCo2());
            dto.setLightIntensity(latestData.getLightIntensity());
            dto.setSoilMoisture(latestData.getSoilMoisture());
            dto.setSoilTemperature(latestData.getSoilTemperature());
            dto.setCollectTime(latestData.getCollectTime() != null ?
                    latestData.getCollectTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) :
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }

        dto.setFanStatus(getRunningStatus(greenhouseId, DeviceType.FAN));
        dto.setWetCurtainStatus(getRunningStatus(greenhouseId, DeviceType.WET_CURTAIN));
        dto.setSunshadeStatus(getRunningStatus(greenhouseId, DeviceType.SUNSHADE_NET));

        return dto;
    }

    @Override
    public boolean switchControlMode(Long greenhouseId, Integer mode) {
        ControlMode controlMode = ControlMode.values()[mode];
        greenhouseControlMode.put(greenhouseId, controlMode);
        log.info("Greenhouse {} control mode switched to {}", greenhouseId, controlMode);
        return true;
    }

    private Integer getRunningStatus(Long greenhouseId, DeviceType deviceType) {
        List<Device> devices = deviceService.getByType(greenhouseId, deviceType);
        if (!devices.isEmpty()) {
            return devices.get(0).getRunningStatus() != null ?
                    devices.get(0).getRunningStatus() : 0;
        }
        return 0;
    }

    private Long getGreenhouseIdByDevice(String deviceCode) {
        Device device = deviceService.getByCode(deviceCode);
        return device != null ? device.getGreenhouseId() : 0L;
    }
}
