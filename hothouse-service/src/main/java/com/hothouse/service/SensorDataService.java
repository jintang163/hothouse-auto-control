package com.hothouse.service;

import com.hothouse.common.entity.SensorData;

import java.time.LocalDateTime;
import java.util.List;

public interface SensorDataService {

    boolean save(SensorData sensorData);

    SensorData getLatest(Long greenhouseId);

    List<SensorData> getByTimeRange(Long greenhouseId, LocalDateTime startTime, LocalDateTime endTime);
}
