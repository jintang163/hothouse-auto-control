package com.hothouse.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.entity.MaintenancePlan;
import com.hothouse.mapper.MaintenancePlanMapper;
import com.hothouse.service.MaintenancePlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenancePlanServiceImpl extends ServiceImpl<MaintenancePlanMapper, MaintenancePlan> implements MaintenancePlanService {

    private final MaintenancePlanMapper maintenancePlanMapper;

    @Override
    public List<MaintenancePlan> getByDeviceType(Integer deviceType) {
        return maintenancePlanMapper.selectByDeviceType(deviceType);
    }
}
