package com.hothouse.admin.controller;

import com.hothouse.common.result.Result;
import com.hothouse.netty.session.DeviceSessionManager;
import com.hothouse.service.AlarmService;
import com.hothouse.service.DeviceService;
import com.hothouse.service.GreenhouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/overview")
@RequiredArgsConstructor
public class OverviewController {

    private final GreenhouseService greenhouseService;
    private final DeviceService deviceService;
    private final AlarmService alarmService;
    private final DeviceSessionManager sessionManager;

    @GetMapping
    public Result<Map<String, Object>> getOverview() {
        Map<String, Object> data = new HashMap<>();
        data.put("greenhouseCount", greenhouseService.list().size());
        data.put("deviceCount", deviceService.list().size());
        data.put("onlineDeviceCount", sessionManager.getOnlineCount());
        data.put("activeAlarmCount", alarmService.countActive());
        return Result.success(data);
    }
}
