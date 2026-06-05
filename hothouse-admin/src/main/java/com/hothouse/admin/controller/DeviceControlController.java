package com.hothouse.admin.controller;

import com.hothouse.common.dto.DeviceControlDTO;
import com.hothouse.common.dto.RealTimeDataDTO;
import com.hothouse.common.result.Result;
import com.hothouse.service.DeviceControlService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/control")
@RequiredArgsConstructor
public class DeviceControlController {

    private final DeviceControlService deviceControlService;

    @GetMapping("/realtime/{greenhouseId}")
    public Result<RealTimeDataDTO> getRealTimeData(@PathVariable Long greenhouseId) {
        return Result.success(deviceControlService.getRealTimeData(greenhouseId));
    }

    @PostMapping("/manual")
    public Result<Boolean> manualControl(@RequestBody DeviceControlDTO controlDTO) {
        return Result.success(deviceControlService.manualControl(controlDTO));
    }

    @PostMapping("/mode")
    public Result<Boolean> switchMode(@RequestBody Map<String, Object> params) {
        Long greenhouseId = Long.valueOf(params.get("greenhouseId").toString());
        Integer mode = Integer.valueOf(params.get("mode").toString());
        return Result.success(deviceControlService.switchControlMode(greenhouseId, mode));
    }
}
