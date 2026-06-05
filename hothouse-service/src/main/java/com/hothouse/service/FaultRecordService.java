package com.hothouse.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hothouse.common.entity.FaultRecord;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface FaultRecordService extends IService<FaultRecord> {

    List<Map<String, Object>> getFaultTypeStats(LocalDateTime startTime, LocalDateTime endTime);

    List<Map<String, Object>> getGreenhouseStats(LocalDateTime startTime, LocalDateTime endTime);

    List<Map<String, Object>> getDailyTrend(LocalDateTime startTime, LocalDateTime endTime);

    List<Map<String, Object>> getHighFrequencyFaults(LocalDateTime startTime, LocalDateTime endTime);

    List<FaultRecord> getByDeviceCode(String deviceCode, Integer limit);

    Map<String, Object> getFaultOverview();
}
