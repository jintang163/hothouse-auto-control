package com.hothouse.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hothouse.common.entity.ControlLog;
import com.hothouse.common.result.Result;
import com.hothouse.service.ControlLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/control-log")
@RequiredArgsConstructor
public class ControlLogController {

    private final ControlLogService controlLogService;

    @GetMapping("/page")
    public Result<Page<ControlLog>> getPage(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long greenhouseId,
            @RequestParam(required = false) String deviceCode,
            @RequestParam(required = false) String operator,
            @RequestParam(required = false) Integer controlType,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        LambdaQueryWrapper<ControlLog> wrapper = new LambdaQueryWrapper<>();
        if (greenhouseId != null) {
            wrapper.eq(ControlLog::getGreenhouseId, greenhouseId);
        }
        if (StringUtils.hasText(deviceCode)) {
            wrapper.eq(ControlLog::getDeviceCode, deviceCode);
        }
        if (StringUtils.hasText(operator)) {
            wrapper.like(ControlLog::getOperator, operator);
        }
        if (controlType != null) {
            wrapper.eq(ControlLog::getControlType, controlType);
        }
        if (startTime != null) {
            wrapper.ge(ControlLog::getCommandTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(ControlLog::getCommandTime, endTime);
        }
        wrapper.orderByDesc(ControlLog::getCommandTime);
        return Result.success(controlLogService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/history/{greenhouseId}")
    public Result<List<ControlLog>> getHistory(
            @PathVariable Long greenhouseId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(controlLogService.getByTimeRange(greenhouseId, startTime, endTime));
    }

    @GetMapping("/device/{deviceCode}")
    public Result<List<ControlLog>> getRecentByDevice(
            @PathVariable String deviceCode,
            @RequestParam(defaultValue = "20") Integer limit) {
        return Result.success(controlLogService.getRecentByDevice(deviceCode, limit));
    }

    @GetMapping("/export")
    public void export(
            @RequestParam(required = false) Long greenhouseId,
            @RequestParam(required = false) String deviceCode,
            @RequestParam(required = false) String operator,
            @RequestParam(required = false) Integer controlType,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime,
            HttpServletResponse response) throws IOException {
        LambdaQueryWrapper<ControlLog> wrapper = new LambdaQueryWrapper<>();
        if (greenhouseId != null) {
            wrapper.eq(ControlLog::getGreenhouseId, greenhouseId);
        }
        if (StringUtils.hasText(deviceCode)) {
            wrapper.eq(ControlLog::getDeviceCode, deviceCode);
        }
        if (StringUtils.hasText(operator)) {
            wrapper.like(ControlLog::getOperator, operator);
        }
        if (controlType != null) {
            wrapper.eq(ControlLog::getControlType, controlType);
        }
        if (startTime != null) {
            wrapper.ge(ControlLog::getCommandTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(ControlLog::getCommandTime, endTime);
        }
        wrapper.orderByDesc(ControlLog::getCommandTime);
        List<ControlLog> list = controlLogService.list(wrapper);

        response.setContentType("text/csv;charset=utf-8");
        response.setHeader("Content-Disposition", "attachment;filename=control_logs.csv");
        OutputStreamWriter writer = new OutputStreamWriter(response.getOutputStream(), StandardCharsets.UTF_8);
        writer.write('\uFEFF');
        writer.write("ID,大棚ID,设备编码,设备名称,操作类型,操作内容,触发来源,策略名称,指令状态,回执内容,指令时间,回执时间,重试次数,操作人,备注\n");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (ControlLog log : list) {
            writer.write(String.format("%d,%d,%s,%s,%d,%s,%s,%s,%d,%s,%s,%s,%d,%s,%s\n",
                    log.getId(),
                    log.getGreenhouseId(),
                    log.getDeviceCode() != null ? log.getDeviceCode() : "",
                    log.getDeviceName() != null ? log.getDeviceName() : "",
                    log.getActionType() != null ? log.getActionType() : 0,
                    log.getActionContent() != null ? log.getActionContent() : "",
                    log.getTriggerSource() != null ? log.getTriggerSource() : "",
                    log.getStrategyName() != null ? log.getStrategyName() : "",
                    log.getCommandStatus() != null ? log.getCommandStatus() : 0,
                    log.getAckContent() != null ? log.getAckContent() : "",
                    log.getCommandTime() != null ? log.getCommandTime().format(formatter) : "",
                    log.getAckTime() != null ? log.getAckTime().format(formatter) : "",
                    log.getRetryCount() != null ? log.getRetryCount() : 0,
                    log.getOperator() != null ? log.getOperator() : "",
                    log.getRemark() != null ? log.getRemark() : ""));
        }
        writer.flush();
        writer.close();
    }
}
