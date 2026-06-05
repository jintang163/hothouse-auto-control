package com.hothouse.service;

import com.hothouse.common.dto.DeviceControlDTO;
import com.hothouse.common.dto.RealTimeDataDTO;
import com.hothouse.common.entity.SensorData;

public interface DeviceControlService {

    boolean manualControl(DeviceControlDTO controlDTO);

    boolean autoControl(SensorData sensorData);

    RealTimeDataDTO getRealTimeData(Long greenhouseId);

    boolean switchControlMode(Long greenhouseId, Integer mode);
}
