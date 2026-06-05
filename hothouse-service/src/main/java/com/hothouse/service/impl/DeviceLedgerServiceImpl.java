package com.hothouse.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.entity.Device;
import com.hothouse.common.entity.DeviceLedger;
import com.hothouse.common.entity.ControlLog;
import com.hothouse.mapper.DeviceLedgerMapper;
import com.hothouse.mapper.DeviceMapper;
import com.hothouse.mapper.ControlLogMapper;
import com.hothouse.service.DeviceLedgerService;
import com.hothouse.service.MaintenancePlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceLedgerServiceImpl extends ServiceImpl<DeviceLedgerMapper, DeviceLedger> implements DeviceLedgerService {

    private final DeviceLedgerMapper deviceLedgerMapper;
    private final DeviceMapper deviceMapper;
    private final ControlLogMapper controlLogMapper;
    private final MaintenancePlanService maintenancePlanService;

    @Override
    public DeviceLedger getByDeviceCode(String deviceCode) {
        return deviceLedgerMapper.selectByDeviceCode(deviceCode);
    }

    @Override
    public boolean addRunHours(String deviceCode, BigDecimal hours, Integer count) {
        return deviceLedgerMapper.addRunHours(deviceCode, hours, count) > 0;
    }

    @Override
    public boolean updateLastStartTime(String deviceCode, LocalDateTime time) {
        return deviceLedgerMapper.updateLastStartTime(deviceCode, time) > 0;
    }

    @Override
    public boolean updateLastStopTime(String deviceCode, LocalDateTime time) {
        return deviceLedgerMapper.updateLastStopTime(deviceCode, time) > 0;
    }

    @Override
    public List<Map<String, Object>> getDeviceTypeStats() {
        return deviceLedgerMapper.selectDeviceTypeStats();
    }

    @Override
    public List<DeviceLedger> getNeedMaintenance() {
        return deviceLedgerMapper.selectNeedMaintenance();
    }

    @Override
    public boolean updateAfterMaintenance(String deviceCode, Integer cycleHours) {
        return deviceLedgerMapper.updateAfterMaintenance(deviceCode, cycleHours) > 0;
    }

    @Override
    public void calculateDailyRunHours() {
        log.info("开始计算前日设备运行时长");
        LocalDateTime today = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime yesterday = today.minusDays(1);

        List<Device> devices = deviceMapper.selectList(null);

        for (Device device : devices) {
            if (device.getDeviceType().getCode() >= 10) {
                continue;
            }

            try {
                List<ControlLog> logs = controlLogMapper.selectByDeviceAndTime(
                    device.getDeviceCode(), yesterday, today);

                BigDecimal totalHours = BigDecimal.ZERO;
                int startCount = 0;

                for (ControlLog log : logs) {
                    if (log.getActionType() == 1) {
                        startCount++;
                    }
                }

                DeviceLedger ledger = getByDeviceCode(device.getDeviceCode());
                if (ledger != null && ledger.getLastStartTime() != null) {
                    LocalDateTime startTime = ledger.getLastStartTime();
                    if (startTime.isBefore(today)) {
                        long minutes = ChronoUnit.MINUTES.between(startTime, yesterday.plusDays(1));
                        totalHours = BigDecimal.valueOf(minutes)
                            .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
                    }
                }

                if (totalHours.compareTo(BigDecimal.ZERO) > 0 || startCount > 0) {
                    addRunHours(device.getDeviceCode(), totalHours, startCount);
                    log.info("设备{}运行时长更新：{}小时, 启停次数：{}",
                        device.getDeviceCode(), totalHours, startCount);
                }
            } catch (Exception e) {
                log.error("计算设备{}运行时长失败", device.getDeviceCode(), e);
            }
        }

        log.info("设备运行时长计算完成");
    }

    @Override
    public void checkMaintenanceStatus() {
        log.info("开始检查设备保养状态");

        List<DeviceLedger> ledgers = list();
        for (DeviceLedger ledger : ledgers) {
            try {
                var plans = maintenancePlanService.getByDeviceType(ledger.getDeviceType());
                if (plans.isEmpty()) {
                    continue;
                }

                BigDecimal totalHours = ledger.getTotalRunHours();
                if (totalHours == null) {
                    totalHours = BigDecimal.ZERO;
                }

                int maintenanceStatus = 0;
                BigDecimal nextHours = ledger.getNextMaintenanceHours();

                for (var plan : plans) {
                    BigDecimal cycleHours = BigDecimal.valueOf(plan.getCycleHours());
                    BigDecimal hoursSinceMaintenance = totalHours.subtract(ledger.getLastMaintenanceHours());

                    if (hoursSinceMaintenance.compareTo(cycleHours) >= 0) {
                        maintenanceStatus = 2;
                        break;
                    } else if (hoursSinceMaintenance.compareTo(cycleHours.multiply(BigDecimal.valueOf(0.8))) >= 0) {
                        maintenanceStatus = 1;
                        if (nextHours == null || totalHours.compareTo(nextHours) < 0) {
                            nextHours = ledger.getLastMaintenanceHours().add(cycleHours);
                        }
                    }
                }

                if (maintenanceStatus != ledger.getMaintenanceStatus()) {
                    ledger.setMaintenanceStatus(maintenanceStatus);
                    ledger.setNextMaintenanceHours(nextHours);
                    updateById(ledger);
                    log.info("设备{}保养状态更新为：{}", ledger.getDeviceCode(), maintenanceStatus);
                }
            } catch (Exception e) {
                log.error("检查设备{}保养状态失败", ledger.getDeviceCode(), e);
            }
        }

        log.info("设备保养状态检查完成");
    }
}
