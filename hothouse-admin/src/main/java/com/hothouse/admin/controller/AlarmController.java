package com.hothouse.admin.controller;

import com.hothouse.common.entity.Alarm;
import com.hothouse.common.result.Result;
import com.hothouse.service.AlarmService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/alarm")
@RequiredArgsConstructor
public class AlarmController {

    private final AlarmService alarmService;

    @GetMapping("/active/{greenhouseId}")
    public Result<List<Alarm>> getActiveAlarms(@PathVariable Long greenhouseId) {
        return Result.success(alarmService.getActiveAlarms(greenhouseId));
    }

    @GetMapping("/history/{greenhouseId}")
    public Result<List<Alarm>> getHistory(
            @PathVariable Long greenhouseId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(alarmService.getByTimeRange(greenhouseId, startTime, endTime));
    }

    @GetMapping("/count")
    public Result<Integer> countActive() {
        return Result.success(alarmService.countActive());
    }

    @PostMapping("/handle")
    public Result<Boolean> handle(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        String handledBy = (String) params.get("handledBy");
        String remark = (String) params.get("remark");
        return Result.success(alarmService.handle(id, handledBy, remark));
    }
}
