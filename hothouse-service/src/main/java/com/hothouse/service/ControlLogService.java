package com.hothouse.service;

import com.hothouse.common.entity.ControlLog;

import java.time.LocalDateTime;
import java.util.List;

public interface ControlLogService {

    boolean save(ControlLog controlLog);

    List<ControlLog> getByTimeRange(Long greenhouseId, LocalDateTime startTime, LocalDateTime endTime);

    List<ControlLog> getRecentByDevice(String deviceCode, Integer limit);
}
