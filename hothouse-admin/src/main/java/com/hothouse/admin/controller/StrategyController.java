package com.hothouse.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hothouse.common.entity.ControlStrategy;
import com.hothouse.common.result.Result;
import com.hothouse.service.ControlStrategyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/strategy")
@RequiredArgsConstructor
public class StrategyController {

    private final ControlStrategyService strategyService;

    @GetMapping
    public Result<Page<ControlStrategy>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long greenhouseId,
            @RequestParam(required = false) Integer controlMode,
            @RequestParam(required = false) Integer enabled) {
        LambdaQueryWrapper<ControlStrategy> wrapper = new LambdaQueryWrapper<>();
        if (greenhouseId != null) {
            wrapper.eq(ControlStrategy::getGreenhouseId, greenhouseId);
        }
        if (controlMode != null) {
            wrapper.eq(ControlStrategy::getControlMode, controlMode);
        }
        if (enabled != null) {
            wrapper.eq(ControlStrategy::getEnabled, enabled);
        }
        wrapper.orderByDesc(ControlStrategy::getPriority)
                .orderByDesc(ControlStrategy::getCreateTime);
        return Result.success(strategyService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/{id}")
    public Result<ControlStrategy> getById(@PathVariable Long id) {
        return Result.success(strategyService.getById(id));
    }

    @GetMapping("/active/{greenhouseId}")
    public Result<List<ControlStrategy>> getActiveByGreenhouseId(@PathVariable Long greenhouseId) {
        return Result.success(strategyService.getActiveByGreenhouseId(greenhouseId));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody ControlStrategy strategy) {
        return Result.success(strategyService.save(strategy));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody ControlStrategy strategy) {
        return Result.success(strategyService.update(strategy));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(strategyService.delete(id));
    }

    @PutMapping("/{id}/status")
    public Result<Boolean> toggleStatus(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        Integer status = (Integer) params.get("status");
        if (status != null && status == 1) {
            return Result.success(strategyService.enable(id));
        } else {
            return Result.success(strategyService.disable(id));
        }
    }

    @PostMapping("/enable/{id}")
    public Result<Boolean> enable(@PathVariable Long id) {
        return Result.success(strategyService.enable(id));
    }

    @PostMapping("/disable/{id}")
    public Result<Boolean> disable(@PathVariable Long id) {
        return Result.success(strategyService.disable(id));
    }
}
