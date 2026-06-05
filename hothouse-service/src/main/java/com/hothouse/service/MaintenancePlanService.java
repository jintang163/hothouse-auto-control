package com.hothouse.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hothouse.common.entity.MaintenancePlan;

import java.util.List;

public interface MaintenancePlanService extends IService<MaintenancePlan> {

    List<MaintenancePlan> getByDeviceType(Integer deviceType);
}
