package com.hothouse.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hothouse.common.entity.DeviceLedger;
import com.hothouse.common.result.Result;
import com.hothouse.service.DeviceLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/device-ledger")
@RequiredArgsConstructor
public class DeviceLedgerController {

    private final DeviceLedgerService deviceLedgerService;

    @GetMapping("/page")
    public Result<Page<DeviceLedger>> getPage(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long greenhouseId,
            @RequestParam(required = false) Integer deviceType,
            @RequestParam(required = false) Integer maintenanceStatus) {
        LambdaQueryWrapper<DeviceLedger> wrapper = new LambdaQueryWrapper<>();
        if (greenhouseId != null) {
            wrapper.eq(DeviceLedger::getGreenhouseId, greenhouseId);
        }
        if (deviceType != null) {
            wrapper.eq(DeviceLedger::getDeviceType, deviceType);
        }
        if (maintenanceStatus != null) {
            wrapper.eq(DeviceLedger::getMaintenanceStatus, maintenanceStatus);
        }
        wrapper.orderByDesc(DeviceLedger::getTotalRunHours);
        return Result.success(deviceLedgerService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/{deviceCode}")
    public Result<DeviceLedger> getByDeviceCode(@PathVariable String deviceCode) {
        return Result.success(deviceLedgerService.getByDeviceCode(deviceCode));
    }

    @GetMapping("/stats/device-type")
    public Result<List<Map<String, Object>>> getDeviceTypeStats() {
        return Result.success(deviceLedgerService.getDeviceTypeStats());
    }

    @GetMapping("/need-maintenance")
    public Result<List<DeviceLedger>> getNeedMaintenance() {
        return Result.success(deviceLedgerService.getNeedMaintenance());
    }
}
