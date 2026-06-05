package com.hothouse.rule;

import com.hothouse.common.dto.DeviceControlDTO;
import com.hothouse.common.dto.RuleExecutionResult;
import com.hothouse.common.entity.ControlStrategy;
import com.hothouse.common.entity.Device;
import com.hothouse.common.entity.SensorData;
import com.hothouse.common.enums.DeviceType;
import com.hothouse.service.DeviceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class DefaultRuleEngine implements RuleEngine {

    private final DeviceService deviceService;

    private final Map<String, Long> lastExecutionTime = new ConcurrentHashMap<>();
    private final Map<String, Integer> deviceCurrentStatus = new ConcurrentHashMap<>();

    @Override
    public RuleExecutionResult execute(ControlStrategy strategy, SensorData sensorData) {
        RuleExecutionResult result = new RuleExecutionResult();
        result.setStrategyId(strategy.getId());
        result.setStrategyName(strategy.getStrategyName());

        if (!checkDebounce(strategy, sensorData)) {
            result.setExecuted(false);
            result.setReason("防抖期内，跳过执行");
            return result;
        }

        List<DeviceControlDTO> actions = new ArrayList<>();
        StringBuilder reasonBuilder = new StringBuilder();

        BigDecimal temperature = sensorData.getTemperature();
        BigDecimal humidity = sensorData.getHumidity();
        BigDecimal light = sensorData.getLightIntensity();

        if (temperature == null) {
            result.setExecuted(false);
            result.setReason("温度数据为空");
            return result;
        }

        boolean needCooling = temperature.compareTo(strategy.getTempUpperLimit()) >= 0;
        boolean needHeating = temperature.compareTo(strategy.getTempLowerLimit()) <= 0;
        boolean needHumidify = humidity != null && humidity.compareTo(strategy.getHumidityLowerLimit()) <= 0;
        boolean needDehumidify = humidity != null && humidity.compareTo(strategy.getHumidityUpperLimit()) >= 0;
        boolean needSunshade = light != null && strategy.getSunshadeLightThreshold() != null &&
                light.compareTo(BigDecimal.valueOf(strategy.getSunshadeLightThreshold())) >= 0;

        if (strategy.getInterlockEnabled() != null && strategy.getInterlockEnabled() == 1) {
            if (!checkInterlock(sensorData.getGreenhouseId(), needCooling)) {
                result.setExecuted(false);
                result.setReason("联锁保护未通过：湿帘未开启禁止强通风");
                return result;
            }
        }

        if (needCooling) {
            reasonBuilder.append("温度过高(").append(temperature).append("℃)，");
            int fanStatus = getDeviceStatus(sensorData.getGreenhouseId(), DeviceType.FAN);
            if (fanStatus != 1) {
                actions.add(createControl(sensorData.getGreenhouseId(), DeviceType.FAN, 1,
                        "开启风机，温度阈值:" + strategy.getTempUpperLimit() + "℃"));
                reasonBuilder.append("开启风机;");
                updateDeviceStatus(sensorData.getGreenhouseId(), DeviceType.FAN, 1);
            }

            if (strategy.getWetCurtainTempDiff() != null) {
                BigDecimal wetCurtainThreshold = strategy.getTempUpperLimit()
                        .add(BigDecimal.valueOf(strategy.getWetCurtainTempDiff()));
                if (temperature.compareTo(wetCurtainThreshold) >= 0) {
                    int wetCurtainStatus = getDeviceStatus(sensorData.getGreenhouseId(), DeviceType.WET_CURTAIN);
                    if (wetCurtainStatus != 1) {
                        actions.add(createControl(sensorData.getGreenhouseId(), DeviceType.WET_CURTAIN, 1,
                                "开启湿帘，温度差阈值:" + strategy.getWetCurtainTempDiff() + "℃"));
                        reasonBuilder.append("开启湿帘;");
                        updateDeviceStatus(sensorData.getGreenhouseId(), DeviceType.WET_CURTAIN, 1);
                    }
                }
            }
        } else if (needHeating) {
            reasonBuilder.append("温度过低(").append(temperature).append("℃)，");
            int fanStatus = getDeviceStatus(sensorData.getGreenhouseId(), DeviceType.FAN);
            if (fanStatus == 1) {
                actions.add(createControl(sensorData.getGreenhouseId(), DeviceType.FAN, 0,
                        "关闭风机，温度阈值:" + strategy.getTempLowerLimit() + "℃"));
                reasonBuilder.append("关闭风机;");
                updateDeviceStatus(sensorData.getGreenhouseId(), DeviceType.FAN, 0);
            }
            int wetCurtainStatus = getDeviceStatus(sensorData.getGreenhouseId(), DeviceType.WET_CURTAIN);
            if (wetCurtainStatus == 1) {
                actions.add(createControl(sensorData.getGreenhouseId(), DeviceType.WET_CURTAIN, 0,
                        "关闭湿帘，温度过低"));
                reasonBuilder.append("关闭湿帘;");
                updateDeviceStatus(sensorData.getGreenhouseId(), DeviceType.WET_CURTAIN, 0);
            }
        } else {
            reasonBuilder.append("温度正常(").append(temperature).append("℃)，");
        }

        if (needSunshade) {
            reasonBuilder.append("光照过强(").append(light).append("lux)，");
            int sunshadeStatus = getDeviceStatus(sensorData.getGreenhouseId(), DeviceType.SUNSHADE_NET);
            if (sunshadeStatus != 1) {
                actions.add(createControl(sensorData.getGreenhouseId(), DeviceType.SUNSHADE_NET, 1,
                        "展开遮阳网，光照阈值:" + strategy.getSunshadeLightThreshold() + "lux"));
                reasonBuilder.append("展开遮阳网;");
                updateDeviceStatus(sensorData.getGreenhouseId(), DeviceType.SUNSHADE_NET, 1);
            }
        } else {
            int sunshadeStatus = getDeviceStatus(sensorData.getGreenhouseId(), DeviceType.SUNSHADE_NET);
            if (sunshadeStatus == 1) {
                actions.add(createControl(sensorData.getGreenhouseId(), DeviceType.SUNSHADE_NET, 0,
                        "收起遮阳网，光照正常"));
                reasonBuilder.append("收起遮阳网;");
                updateDeviceStatus(sensorData.getGreenhouseId(), DeviceType.SUNSHADE_NET, 0);
            }
        }

        if (needHumidify) {
            reasonBuilder.append("湿度过低(").append(humidity).append("%)，");
        } else if (needDehumidify) {
            reasonBuilder.append("湿度过高(").append(humidity).append("%)，");
        }

        result.setExecuted(!actions.isEmpty());
        result.setControlActions(actions);
        result.setReason(reasonBuilder.toString());

        if (result.getExecuted()) {
            log.info("Rule executed, greenhouse: {}, strategy: {}, reason: {}, actions: {}",
                    sensorData.getGreenhouseId(), strategy.getStrategyName(),
                    reasonBuilder, actions.size());
            updateLastExecution(strategy.getId());
        }

        return result;
    }

    private boolean checkDebounce(ControlStrategy strategy, SensorData sensorData) {
        if (strategy.getDebounceTime() == null || strategy.getDebounceTime() <= 0) {
            return true;
        }

        String key = strategy.getId() + "_" + sensorData.getGreenhouseId();
        Long lastTime = lastExecutionTime.get(key);
        long currentTime = System.currentTimeMillis();

        if (lastTime == null) {
            return true;
        }

        return (currentTime - lastTime) >= (long) strategy.getDebounceTime() * 1000;
    }

    private void updateLastExecution(Long strategyId) {
        String key = strategyId.toString();
        lastExecutionTime.put(key, System.currentTimeMillis());
    }

    private boolean checkInterlock(Long greenhouseId, boolean needCooling) {
        if (!needCooling) {
            return true;
        }

        int fanStatus = getDeviceStatus(greenhouseId, DeviceType.FAN);
        int wetCurtainStatus = getDeviceStatus(greenhouseId, DeviceType.WET_CURTAIN);

        if (fanStatus == 2 && wetCurtainStatus != 1) {
            log.warn("Interlock check failed: fan running but wet curtain off, greenhouse: {}", greenhouseId);
            return false;
        }

        return true;
    }

    private int getDeviceStatus(Long greenhouseId, DeviceType deviceType) {
        String key = greenhouseId + "_" + deviceType.getCode();
        Integer status = deviceCurrentStatus.get(key);
        if (status == null) {
            List<Device> devices = deviceService.getByType(greenhouseId, deviceType);
            if (!devices.isEmpty()) {
                status = devices.get(0).getRunningStatus() != null ?
                        devices.get(0).getRunningStatus() : 0;
                deviceCurrentStatus.put(key, status);
            } else {
                status = 0;
            }
        }
        return status;
    }

    private void updateDeviceStatus(Long greenhouseId, DeviceType deviceType, int status) {
        String key = greenhouseId + "_" + deviceType.getCode();
        deviceCurrentStatus.put(key, status);
    }

    private DeviceControlDTO createControl(Long greenhouseId, DeviceType deviceType,
                                           int action, String params) {
        List<Device> devices = deviceService.getByType(greenhouseId, deviceType);
        DeviceControlDTO dto = new DeviceControlDTO();
        dto.setDeviceType(deviceType);
        dto.setAction(action);
        dto.setActionParams(params);
        dto.setOperator("system_auto");
        dto.setRemark("自动控制");

        if (!devices.isEmpty()) {
            dto.setDeviceCode(devices.get(0).getDeviceCode());
        } else {
            dto.setDeviceCode(greenhouseId + "_" + deviceType.getCode() + "_001");
        }

        return dto;
    }

    public void resetDeviceStatus(Long greenhouseId) {
        deviceCurrentStatus.keySet().removeIf(key -> key.startsWith(greenhouseId + "_"));
    }
}
