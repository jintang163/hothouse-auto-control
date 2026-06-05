package com.hothouse.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.entity.MaintenanceRecord;
import com.hothouse.mapper.MaintenanceRecordMapper;
import com.hothouse.service.MaintenanceRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MaintenanceRecordServiceImpl extends ServiceImpl<MaintenanceRecordMapper, MaintenanceRecord> implements MaintenanceRecordService {

    private final MaintenanceRecordMapper maintenanceRecordMapper;

    @Override
    public List<MaintenanceRecord> getByDeviceCode(String deviceCode, Integer limit) {
        return maintenanceRecordMapper.selectByDeviceCode(deviceCode, limit);
    }

    @Override
    public List<Map<String, Object>> getDailyCount(LocalDateTime startTime, LocalDateTime endTime) {
        return maintenanceRecordMapper.selectDailyCount(startTime, endTime);
    }
}
