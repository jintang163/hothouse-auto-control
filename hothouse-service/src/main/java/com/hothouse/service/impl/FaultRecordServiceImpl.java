package com.hothouse.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.entity.FaultRecord;
import com.hothouse.mapper.FaultRecordMapper;
import com.hothouse.service.FaultRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FaultRecordServiceImpl extends ServiceImpl<FaultRecordMapper, FaultRecord> implements FaultRecordService {

    private final FaultRecordMapper faultRecordMapper;

    @Override
    public List<Map<String, Object>> getFaultTypeStats(LocalDateTime startTime, LocalDateTime endTime) {
        return faultRecordMapper.selectFaultTypeStats(startTime, endTime);
    }

    @Override
    public List<Map<String, Object>> getGreenhouseStats(LocalDateTime startTime, LocalDateTime endTime) {
        return faultRecordMapper.selectGreenhouseStats(startTime, endTime);
    }

    @Override
    public List<Map<String, Object>> getDailyTrend(LocalDateTime startTime, LocalDateTime endTime) {
        return faultRecordMapper.selectDailyTrend(startTime, endTime);
    }

    @Override
    public List<Map<String, Object>> getHighFrequencyFaults(LocalDateTime startTime, LocalDateTime endTime) {
        return faultRecordMapper.selectHighFrequencyFaults(startTime, endTime);
    }

    @Override
    public List<FaultRecord> getByDeviceCode(String deviceCode, Integer limit) {
        return faultRecordMapper.selectByDeviceCode(deviceCode, limit);
    }

    @Override
    public Map<String, Object> getFaultOverview() {
        Map<String, Object> result = new HashMap<>();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);

        LambdaQueryWrapper<FaultRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.ge(FaultRecord::getFaultTime, thirtyDaysAgo);
        long totalCount = count(wrapper);

        LambdaQueryWrapper<FaultRecord> unresolvedWrapper = new LambdaQueryWrapper<>();
        unresolvedWrapper.ge(FaultRecord::getFaultTime, thirtyDaysAgo)
            .lt(FaultRecord::getStatus, 2);
        long unresolvedCount = count(unresolvedWrapper);

        LambdaQueryWrapper<FaultRecord> criticalWrapper = new LambdaQueryWrapper<>();
        criticalWrapper.ge(FaultRecord::getFaultTime, thirtyDaysAgo)
            .eq(FaultRecord::getFaultLevel, 3);
        long criticalCount = count(criticalWrapper);

        result.put("totalCount", totalCount);
        result.put("unresolvedCount", unresolvedCount);
        result.put("criticalCount", criticalCount);

        return result;
    }
}
