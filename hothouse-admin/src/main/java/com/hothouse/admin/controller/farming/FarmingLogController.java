package com.hothouse.admin.controller.farming;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hothouse.common.entity.farming.FarmingLog;
import com.hothouse.common.enums.farming.LogType;
import com.hothouse.common.result.Result;
import com.hothouse.service.farming.FarmingLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/farming/log")
@RequiredArgsConstructor
public class FarmingLogController {

    private final FarmingLogService farmingLogService;

    @GetMapping
    public Result<Page<FarmingLog>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long greenhouseId,
            @RequestParam(required = false) String logType,
            @RequestParam(required = false) LocalDateTime startTime,
            @RequestParam(required = false) LocalDateTime endTime) {
        LambdaQueryWrapper<FarmingLog> wrapper = new LambdaQueryWrapper<>();
        if (greenhouseId != null) {
            wrapper.eq(FarmingLog::getGreenhouseId, greenhouseId);
        }
        if (StringUtils.hasText(logType)) {
            wrapper.eq(FarmingLog::getLogType, LogType.getByCode(logType));
        }
        if (startTime != null) {
            wrapper.ge(FarmingLog::getOperationTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(FarmingLog::getOperationTime, endTime);
        }
        wrapper.orderByDesc(FarmingLog::getOperationTime);
        return Result.success(farmingLogService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/{id}")
    public Result<FarmingLog> getById(@PathVariable Long id) {
        return Result.success(farmingLogService.getById(id));
    }

    @GetMapping("/recent/{greenhouseId}")
    public Result<List<FarmingLog>> listRecent(@PathVariable Long greenhouseId,
                                               @RequestParam(defaultValue = "50") Integer limit) {
        return Result.success(farmingLogService.listRecentByGreenhouseId(greenhouseId, limit));
    }

    @GetMapping("/task/{taskId}")
    public Result<List<FarmingLog>> listByTaskId(@PathVariable Long taskId) {
        return Result.success(farmingLogService.listByTaskId(taskId));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody FarmingLog log) {
        return Result.success(farmingLogService.save(log));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(farmingLogService.removeById(id));
    }
}
