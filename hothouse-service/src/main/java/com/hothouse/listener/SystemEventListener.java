package com.hothouse.listener;

import com.hothouse.common.entity.Alarm;
import com.hothouse.common.entity.SensorData;
import com.hothouse.common.enums.AlarmLevel;
import com.hothouse.common.event.AlarmEvent;
import com.hothouse.common.event.ControlAckEvent;
import com.hothouse.common.event.SensorDataEvent;
import com.hothouse.common.protocol.ControlAck;
import com.hothouse.netty.command.CommandService;
import com.hothouse.service.AlarmService;
import com.hothouse.service.DeviceControlService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class SystemEventListener {

    private final DeviceControlService deviceControlService;
    private final AlarmService alarmService;
    private final CommandService commandService;

    @Async
    @EventListener
    public void onSensorData(SensorDataEvent event) {
        SensorData sensorData = event.getSensorData();
        log.debug("Receive sensor data event, greenhouse: {}", sensorData.getGreenhouseId());

        try {
            deviceControlService.autoControl(sensorData);
            checkAlarm(sensorData);
        } catch (Exception e) {
            log.error("Process sensor data event error", e);
        }
    }

    @Async
    @EventListener
    public void onControlAck(ControlAckEvent event) {
        ControlAck ack = event.getControlAck();
        log.info("Receive control ack event, device: {}, result: {}",
                ack.getTargetDeviceCode(), ack.getResultCode());

        commandService.handleAck(ack.getSequence(),
                ack.getResultCode() == 200, ack.getResultMessage());
    }

    @Async
    @EventListener
    public void onAlarm(AlarmEvent event) {
        Alarm alarm = event.getAlarm();
        log.warn("Receive alarm event, level: {}, device: {}, content: {}",
                alarm.getAlarmLevel(), alarm.getDeviceCode(), alarm.getAlarmContent());
    }

    private void checkAlarm(SensorData sensorData) {
        if (sensorData.getTemperature() != null) {
            if (sensorData.getTemperature().compareTo(BigDecimal.valueOf(40)) >= 0) {
                createAlarm(sensorData, "TEMPERATURE_HIGH",
                        "温度过高", AlarmLevel.ERROR,
                        sensorData.getTemperature().toString(), "40.0");
            } else if (sensorData.getTemperature().compareTo(BigDecimal.valueOf(35)) >= 0) {
                createAlarm(sensorData, "TEMPERATURE_WARNING",
                        "温度偏高", AlarmLevel.WARNING,
                        sensorData.getTemperature().toString(), "35.0");
            } else if (sensorData.getTemperature().compareTo(BigDecimal.valueOf(5)) <= 0) {
                createAlarm(sensorData, "TEMPERATURE_LOW",
                        "温度过低", AlarmLevel.ERROR,
                        sensorData.getTemperature().toString(), "5.0");
            }
        }

        if (sensorData.getHumidity() != null) {
            if (sensorData.getHumidity().compareTo(BigDecimal.valueOf(90)) >= 0) {
                createAlarm(sensorData, "HUMIDITY_HIGH",
                        "湿度过高", AlarmLevel.WARNING,
                        sensorData.getHumidity().toString(), "90.0");
            } else if (sensorData.getHumidity().compareTo(BigDecimal.valueOf(20)) <= 0) {
                createAlarm(sensorData, "HUMIDITY_LOW",
                        "湿度过低", AlarmLevel.WARNING,
                        sensorData.getHumidity().toString(), "20.0");
            }
        }

        if (sensorData.getCo2() != null &&
                sensorData.getCo2().compareTo(BigDecimal.valueOf(5000)) >= 0) {
            createAlarm(sensorData, "CO2_HIGH",
                    "CO2浓度过高", AlarmLevel.CRITICAL,
                    sensorData.getCo2().toString(), "5000.0");
        }
    }

    private void createAlarm(SensorData sensorData, String alarmCode,
                             String alarmName, AlarmLevel level,
                             String alarmValue, String threshold) {
        Alarm alarm = new Alarm();
        alarm.setGreenhouseId(sensorData.getGreenhouseId());
        alarm.setDeviceCode(sensorData.getDeviceCode());
        alarm.setAlarmCode(alarmCode);
        alarm.setAlarmName(alarmName);
        alarm.setAlarmLevel(level);
        alarm.setAlarmContent(alarmName + ": " + alarmValue);
        alarm.setAlarmValue(alarmValue);
        alarm.setThresholdValue(threshold);
        alarm.setStatus(0);

        alarmService.save(alarm);
    }
}
