package com.hothouse.netty.processor;

import com.hothouse.common.entity.Device;
import com.hothouse.common.entity.SensorData;
import com.hothouse.common.enums.DeviceType;
import com.hothouse.common.protocol.IotMessage;
import com.hothouse.common.protocol.SensorDataPayload;
import com.hothouse.service.DeviceService;
import com.hothouse.service.SensorDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class DefaultDataProcessor implements DataProcessor {

    private final DeviceService deviceService;
    private final SensorDataService sensorDataService;

    @Override
    public SensorData process(IotMessage message, SensorDataPayload payload) {
        try {
            Device device = deviceService.getByCode(message.getDeviceCode());
            if (device == null) {
                log.warn("Device not found, deviceCode: {}", message.getDeviceCode());
                return null;
            }

            if (device.getDeviceType() != DeviceType.TEMPERATURE_SENSOR &&
                device.getDeviceType() != DeviceType.HUMIDITY_SENSOR &&
                device.getDeviceType() != DeviceType.GATEWAY) {
                log.warn("Device is not a sensor, deviceCode: {}, type: {}",
                        message.getDeviceCode(), device.getDeviceType());
                return null;
            }

            SensorData sensorData = new SensorData();
            sensorData.setGreenhouseId(device.getGreenhouseId());
            sensorData.setDeviceCode(message.getDeviceCode());
            sensorData.setTemperature(payload.getTemperature());
            sensorData.setHumidity(payload.getHumidity());
            sensorData.setCo2(payload.getCo2());
            sensorData.setLightIntensity(payload.getLightIntensity());
            sensorData.setSoilMoisture(payload.getSoilMoisture());
            sensorData.setSoilTemperature(payload.getSoilTemperature());
            sensorData.setCollectTime(payload.getCollectTime() != null ?
                    payload.getCollectTime() : LocalDateTime.now());
            sensorData.setRawData(message.getPayload());

            sensorDataService.save(sensorData);

            log.debug("Sensor data saved, greenhouseId: {}, temperature: {}, humidity: {}",
                    sensorData.getGreenhouseId(), sensorData.getTemperature(), sensorData.getHumidity());

            return sensorData;
        } catch (Exception e) {
            log.error("Process sensor data error, deviceCode: {}", message.getDeviceCode(), e);
            return null;
        }
    }
}
