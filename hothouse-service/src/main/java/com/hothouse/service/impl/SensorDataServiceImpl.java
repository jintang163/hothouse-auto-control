package com.hothouse.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.entity.SensorData;
import com.hothouse.mapper.SensorDataMapper;
import com.hothouse.service.SensorDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SensorDataServiceImpl extends ServiceImpl<SensorDataMapper, SensorData>
        implements SensorDataService {

    @Override
    public boolean save(SensorData sensorData) {
        if (sensorData.getCollectTime() == null) {
            sensorData.setCollectTime(LocalDateTime.now());
        }
        return super.save(sensorData);
    }

    @Override
    public SensorData getLatest(Long greenhouseId) {
        return baseMapper.selectLatest(greenhouseId);
    }

    @Override
    public List<SensorData> getByTimeRange(Long greenhouseId, LocalDateTime startTime, LocalDateTime endTime) {
        return baseMapper.selectByTimeRange(greenhouseId, startTime, endTime);
    }
}
