package com.hothouse.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hothouse.common.entity.FaultRecord;
import com.hothouse.common.result.Result;
import com.hothouse.service.FaultRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/fault-record")
@RequiredArgsConstructor
public class FaultRecordController {

    private final FaultRecordService faultRecordService;

    @GetMapping("/page")
    public Result<Page<FaultRecord>> getPage(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long greenhouseId,
            @RequestParam(required = false) String deviceCode,
            @RequestParam(required = false) String faultType,
            @RequestParam(required = false) Integer faultLevel,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        LambdaQueryWrapper<FaultRecord> wrapper = new LambdaQueryWrapper<>();
        if (greenhouseId != null) {
            wrapper.eq(FaultRecord::getGreenhouseId, greenhouseId);
        }
        if (deviceCode != null && !deviceCode.isEmpty()) {
            wrapper.eq(FaultRecord::getDeviceCode, deviceCode);
        }
        if (faultType != null && !faultType.isEmpty()) {
            wrapper.eq(FaultRecord::getFaultType, faultType);
        }
        if (faultLevel != null) {
            wrapper.eq(FaultRecord::getFaultLevel, faultLevel);
        }
        if (status != null) {
            wrapper.eq(FaultRecord::getStatus, status);
        }
        if (startTime != null) {
            wrapper.ge(FaultRecord::getFaultTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(FaultRecord::getFaultTime, endTime);
        }
        wrapper.orderByDesc(FaultRecord::getFaultTime);
        return Result.success(faultRecordService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/{id}")
    public Result<FaultRecord> getById(@PathVariable Long id) {
        return Result.success(faultRecordService.getById(id));
    }

    @GetMapping("/device/{deviceCode}")
    public Result<List<FaultRecord>> getByDeviceCode(
            @PathVariable String deviceCode,
            @RequestParam(defaultValue = "10") Integer limit) {
        return Result.success(faultRecordService.getByDeviceCode(deviceCode, limit));
    }

    @PostMapping
    public Result<Boolean> add(@RequestBody FaultRecord record) {
        return Result.success(faultRecordService.save(record));
    }

    @PutMapping("/{id}")
    public Result<Boolean> update(@PathVariable Long id, @RequestBody FaultRecord record) {
        record.setId(id);
        return Result.success(faultRecordService.updateById(record));
    }

    @PutMapping("/{id}/handle")
    public Result<Boolean> handleFault(@PathVariable Long id, @RequestBody FaultRecord record) {
        FaultRecord existing = faultRecordService.getById(id);
        if (existing != null) {
            existing.setStatus(2);
            existing.setHandler(record.getHandler());
            existing.setHandleMethod(record.getHandleMethod());
            existing.setHandleTime(LocalDateTime.now());
            existing.setSparePartsUsed(record.getSparePartsUsed());
            existing.setCost(record.getCost());
            existing.setRemark(record.getRemark());
            return Result.success(faultRecordService.updateById(existing));
        }
        return Result.error("故障记录不存在");
    }

    @GetMapping("/overview")
    public Result<Map<String, Object>> getOverview() {
        return Result.success(faultRecordService.getFaultOverview());
    }

    @GetMapping("/stats/fault-type")
    public Result<List<Map<String, Object>>> getFaultTypeStats(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(faultRecordService.getFaultTypeStats(startTime, endTime));
    }

    @GetMapping("/stats/greenhouse")
    public Result<List<Map<String, Object>>> getGreenhouseStats(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(faultRecordService.getGreenhouseStats(startTime, endTime));
    }

    @GetMapping("/stats/daily-trend")
    public Result<List<Map<String, Object>>> getDailyTrend(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(faultRecordService.getDailyTrend(startTime, endTime));
    }

    @GetMapping("/stats/high-frequency")
    public Result<List<Map<String, Object>>> getHighFrequencyFaults(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(faultRecordService.getHighFrequencyFaults(startTime, endTime));
    }
}
