package com.hothouse.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.entity.ControlLog;
import com.hothouse.mapper.ControlLogMapper;
import com.hothouse.service.ControlLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ControlLogServiceImpl extends ServiceImpl<ControlLogMapper, ControlLog>
        implements ControlLogService {

    @Override
    public boolean save(ControlLog controlLog) {
        if (controlLog.getCommandTime() == null) {
            controlLog.setCommandTime(LocalDateTime.now());
        }
        return super.save(controlLog);
    }

    @Override
    public List<ControlLog> getByTimeRange(Long greenhouseId, LocalDateTime startTime, LocalDateTime endTime) {
        return baseMapper.selectByTimeRange(greenhouseId, startTime, endTime);
    }

    @Override
    public List<ControlLog> getRecentByDevice(String deviceCode, Integer limit) {
        return baseMapper.selectRecentByDevice(deviceCode, limit);
    }
}
