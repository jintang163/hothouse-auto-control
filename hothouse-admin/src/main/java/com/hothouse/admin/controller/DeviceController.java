package com.hothouse.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hothouse.common.entity.Device;
import com.hothouse.common.enums.DeviceType;
import com.hothouse.common.result.Result;
import com.hothouse.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/device")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @GetMapping
    public Result<Page<Device>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long greenhouseId,
            @RequestParam(required = false) Integer deviceType,
            @RequestParam(required = false) Integer deviceStatus,
            @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<Device> wrapper = new LambdaQueryWrapper<>();
        if (greenhouseId != null) {
            wrapper.eq(Device::getGreenhouseId, greenhouseId);
        }
        if (deviceType != null) {
            wrapper.eq(Device::getDeviceType, DeviceType.getByCode(deviceType));
        }
        if (deviceStatus != null) {
            wrapper.eq(Device::getDeviceStatus, deviceStatus);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Device::getDeviceName, keyword)
                    .or().like(Device::getDeviceCode, keyword);
        }
        wrapper.orderByDesc(Device::getCreateTime);
        return Result.success(deviceService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/{id}")
    public Result<Device> getById(@PathVariable Long id) {
        return Result.success(deviceService.getById(id));
    }

    @GetMapping("/code/{code}")
    public Result<Device> getByCode(@PathVariable String code) {
        return Result.success(deviceService.getByCode(code));
    }

    @GetMapping("/greenhouse/{greenhouseId}")
    public Result<List<Device>> getByGreenhouseId(@PathVariable Long greenhouseId) {
        return Result.success(deviceService.getByGreenhouseId(greenhouseId));
    }

    @GetMapping("/type/{greenhouseId}/{type}")
    public Result<List<Device>> getByType(@PathVariable Long greenhouseId, @PathVariable Integer type) {
        return Result.success(deviceService.getByType(greenhouseId, DeviceType.getByCode(type)));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody Device device) {
        return Result.success(deviceService.save(device));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody Device device) {
        return Result.success(deviceService.update(device));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(deviceService.delete(id));
    }
}
