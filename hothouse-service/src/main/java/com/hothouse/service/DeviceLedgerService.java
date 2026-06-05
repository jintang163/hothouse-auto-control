package com.hothouse.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hothouse.common.entity.DeviceLedger;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface DeviceLedgerService extends IService<DeviceLedger> {

    DeviceLedger getByDeviceCode(String deviceCode);

    boolean addRunHours(String deviceCode, BigDecimal hours, Integer count);

    boolean updateLastStartTime(String deviceCode, LocalDateTime time);

    boolean updateLastStopTime(String deviceCode, LocalDateTime time);

    List<Map<String, Object>> getDeviceTypeStats();

    List<DeviceLedger> getNeedMaintenance();

    boolean updateAfterMaintenance(String deviceCode, Integer cycleHours);

    void calculateDailyRunHours();

    void checkMaintenanceStatus();
}
