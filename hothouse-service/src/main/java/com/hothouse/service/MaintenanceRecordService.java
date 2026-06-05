package com.hothouse.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hothouse.common.entity.MaintenanceRecord;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface MaintenanceRecordService extends IService<MaintenanceRecord> {

    List<MaintenanceRecord> getByDeviceCode(String deviceCode, Integer limit);

    List<Map<String, Object>> getDailyCount(LocalDateTime startTime, LocalDateTime endTime);
}
