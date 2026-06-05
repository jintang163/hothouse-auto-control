package com.hothouse.admin.controller.farming;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hothouse.common.dto.farming.TaskFeedbackDTO;
import com.hothouse.common.entity.farming.FarmingTask;
import com.hothouse.common.enums.farming.TaskStatus;
import com.hothouse.common.result.Result;
import com.hothouse.service.farming.FarmingTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/farming/task")
@RequiredArgsConstructor
public class FarmingTaskController {

    private final FarmingTaskService farmingTaskService;

    @GetMapping
    public Result<Page<FarmingTask>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long greenhouseId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer priority,
            @RequestParam(required = false) String executor) {
        LambdaQueryWrapper<FarmingTask> wrapper = new LambdaQueryWrapper<>();
        if (greenhouseId != null) {
            wrapper.eq(FarmingTask::getGreenhouseId, greenhouseId);
        }
        if (status != null) {
            wrapper.eq(FarmingTask::getStatus, TaskStatus.getByCode(status));
        }
        if (priority != null) {
            wrapper.eq(FarmingTask::getPriority, priority);
        }
        if (StringUtils.hasText(executor)) {
            wrapper.eq(FarmingTask::getExecutor, executor);
        }
        wrapper.orderByDesc(FarmingTask::getCreateTime);
        return Result.success(farmingTaskService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/{id}")
    public Result<FarmingTask> getById(@PathVariable Long id) {
        return Result.success(farmingTaskService.getById(id));
    }

    @GetMapping("/greenhouse/{greenhouseId}")
    public Result<List<FarmingTask>> listByGreenhouseId(@PathVariable Long greenhouseId) {
        return Result.success(farmingTaskService.listByGreenhouseId(greenhouseId));
    }

    @GetMapping("/greenhouse/{greenhouseId}/status/{status}")
    public Result<List<FarmingTask>> listByGreenhouseAndStatus(@PathVariable Long greenhouseId, @PathVariable Integer status) {
        return Result.success(farmingTaskService.listByGreenhouseAndStatus(greenhouseId, TaskStatus.getByCode(status)));
    }

    @GetMapping("/pending/{executor}")
    public Result<List<FarmingTask>> listPendingByExecutor(@PathVariable String executor) {
        return Result.success(farmingTaskService.listPendingByExecutor(executor));
    }

    @PostMapping("/device/{id}")
    public Result<Boolean> executeTaskByDevice(@PathVariable Long id) {
        return Result.success(farmingTaskService.executeTaskByDevice(id));
    }

    @PostMapping("/start/{id}")
    public Result<Boolean> startTask(@PathVariable Long id, @RequestParam String executor) {
        return Result.success(farmingTaskService.startTask(id, executor));
    }

    @PostMapping("/feedback")
    public Result<Boolean> submitTaskFeedback(@RequestBody TaskFeedbackDTO dto) {
        return Result.success(farmingTaskService.submitTaskFeedback(dto));
    }

    @PostMapping("/cancel/{id}")
    public Result<Boolean> cancelTask(@PathVariable Long id, @RequestParam String operator) {
        return Result.success(farmingTaskService.cancelTask(id, operator));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody FarmingTask task) {
        return Result.success(farmingTaskService.save(task));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody FarmingTask task) {
        return Result.success(farmingTaskService.updateById(task));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(farmingTaskService.removeById(id));
    }
}
