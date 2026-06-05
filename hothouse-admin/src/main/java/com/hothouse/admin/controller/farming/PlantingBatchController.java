package com.hothouse.admin.controller.farming;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hothouse.common.entity.farming.PlantingBatch;
import com.hothouse.common.result.Result;
import com.hothouse.service.farming.PlantingBatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/farming/batch")
@RequiredArgsConstructor
public class PlantingBatchController {

    private final PlantingBatchService plantingBatchService;

    @GetMapping
    public Result<Page<PlantingBatch>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        LambdaQueryWrapper<PlantingBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(PlantingBatch::getCreateTime);
        return Result.success(plantingBatchService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/{id}")
    public Result<PlantingBatch> getById(@PathVariable Long id) {
        return Result.success(plantingBatchService.getById(id));
    }

    @GetMapping("/current/{greenhouseId}")
    public Result<PlantingBatch> getCurrentByGreenhouseId(@PathVariable Long greenhouseId) {
        return Result.success(plantingBatchService.getCurrentByGreenhouseId(greenhouseId));
    }

    @GetMapping("/greenhouse/{greenhouseId}")
    public Result<List<PlantingBatch>> listByGreenhouseId(@PathVariable Long greenhouseId) {
        return Result.success(plantingBatchService.listByGreenhouseId(greenhouseId));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody PlantingBatch batch) {
        return Result.success(plantingBatchService.save(batch));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody PlantingBatch batch) {
        return Result.success(plantingBatchService.updateById(batch));
    }

    @PutMapping("/{batchId}/stage/{stageId}")
    public Result<Boolean> updateCurrentStage(@PathVariable Long batchId, @PathVariable Long stageId) {
        return Result.success(plantingBatchService.updateCurrentStage(batchId, stageId));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(plantingBatchService.removeById(id));
    }
}
