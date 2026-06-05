package com.hothouse.admin.controller;

import com.hothouse.common.entity.SensorData;
import com.hothouse.common.result.Result;
import com.hothouse.service.SensorDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/sensor-data")
@RequiredArgsConstructor
public class SensorDataController {

    private final SensorDataService sensorDataService;

    @GetMapping("/latest/{greenhouseId}")
    public Result<SensorData> getLatest(@PathVariable Long greenhouseId) {
        return Result.success(sensorDataService.getLatest(greenhouseId));
    }

    @GetMapping("/history/{greenhouseId}")
    public Result<List<SensorData>> getHistory(
            @PathVariable Long greenhouseId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(sensorDataService.getByTimeRange(greenhouseId, startTime, endTime));
    }
}
