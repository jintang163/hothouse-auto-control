package com.hothouse.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hothouse.common.entity.MaintenancePlan;
import com.hothouse.common.entity.MaintenanceRecord;
import com.hothouse.common.result.Result;
import com.hothouse.service.DeviceLedgerService;
import com.hothouse.service.MaintenancePlanService;
import com.hothouse.service.MaintenanceRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenancePlanService maintenancePlanService;
    private final MaintenanceRecordService maintenanceRecordService;
    private final DeviceLedgerService deviceLedgerService;

    @GetMapping("/plan/list")
    public Result<List<MaintenancePlan>> getPlanList() {
        return Result.success(maintenancePlanService.list());
    }

    @GetMapping("/plan/device-type/{deviceType}")
    public Result<List<MaintenancePlan>> getPlanByDeviceType(@PathVariable Integer deviceType) {
        return Result.success(maintenancePlanService.getByDeviceType(deviceType));
    }

    @PostMapping("/plan")
    public Result<Boolean> addPlan(@RequestBody MaintenancePlan plan) {
        return Result.success(maintenancePlanService.save(plan));
    }

    @PutMapping("/plan/{id}")
    public Result<Boolean> updatePlan(@PathVariable Long id, @RequestBody MaintenancePlan plan) {
        plan.setId(id);
        return Result.success(maintenancePlanService.updateById(plan));
    }

    @DeleteMapping("/plan/{id}")
    public Result<Boolean> deletePlan(@PathVariable Long id) {
        return Result.success(maintenancePlanService.removeById(id));
    }

    @GetMapping("/record/page")
    public Result<Page<MaintenanceRecord>> getRecordPage(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long greenhouseId,
            @RequestParam(required = false) String deviceCode,
            @RequestParam(required = false) String maintenanceType,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        LambdaQueryWrapper<MaintenanceRecord> wrapper = new LambdaQueryWrapper<>();
        if (greenhouseId != null) {
            wrapper.eq(MaintenanceRecord::getGreenhouseId, greenhouseId);
        }
        if (deviceCode != null && !deviceCode.isEmpty()) {
            wrapper.eq(MaintenanceRecord::getDeviceCode, deviceCode);
        }
        if (maintenanceType != null && !maintenanceType.isEmpty()) {
            wrapper.eq(MaintenanceRecord::getMaintenanceType, maintenanceType);
        }
        if (startTime != null) {
            wrapper.ge(MaintenanceRecord::getMaintenanceTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(MaintenanceRecord::getMaintenanceTime, endTime);
        }
        wrapper.orderByDesc(MaintenanceRecord::getMaintenanceTime);
        return Result.success(maintenanceRecordService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/record/device/{deviceCode}")
    public Result<List<MaintenanceRecord>> getRecordByDevice(
            @PathVariable String deviceCode,
            @RequestParam(defaultValue = "10") Integer limit) {
        return Result.success(maintenanceRecordService.getByDeviceCode(deviceCode, limit));
    }

    @PostMapping("/record")
    public Result<Boolean> addRecord(@RequestBody MaintenanceRecord record) {
        boolean saved = maintenanceRecordService.save(record);
        if (saved && record.getPlanId() != null) {
            MaintenancePlan plan = maintenancePlanService.getById(record.getPlanId());
            if (plan != null) {
                deviceLedgerService.updateAfterMaintenance(record.getDeviceCode(), plan.getCycleHours());
            }
        }
        return Result.success(saved);
    }

    @GetMapping("/record/daily-count")
    public Result<List<Map<String, Object>>> getDailyCount(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(maintenanceRecordService.getDailyCount(startTime, endTime));
    }
}
