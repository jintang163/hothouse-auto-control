package com.hothouse.admin.task;

import com.hothouse.service.DeviceLedgerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeviceMaintenanceTask {

    private final DeviceLedgerService deviceLedgerService;

    @Scheduled(cron = "0 10 0 * * ?")
    public void calculateDailyRunHours() {
        log.info("开始执行每日设备运行时长统计任务");
        try {
            deviceLedgerService.calculateDailyRunHours();
            log.info("每日设备运行时长统计任务执行完成");
        } catch (Exception e) {
            log.error("每日设备运行时长统计任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 30 0 * * ?")
    public void checkMaintenanceStatus() {
        log.info("开始执行设备保养状态检查任务");
        try {
            deviceLedgerService.checkMaintenanceStatus();
            log.info("设备保养状态检查任务执行完成");
        } catch (Exception e) {
            log.error("设备保养状态检查任务执行失败", e);
        }
    }
}
