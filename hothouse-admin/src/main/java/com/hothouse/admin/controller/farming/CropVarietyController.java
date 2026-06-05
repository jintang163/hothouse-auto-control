package com.hothouse.admin.controller.farming;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hothouse.common.entity.farming.CropVariety;
import com.hothouse.common.entity.farming.GrowthStage;
import com.hothouse.common.result.Result;
import com.hothouse.service.farming.CropVarietyService;
import com.hothouse.service.farming.GrowthStageService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/crop-variety")
@RequiredArgsConstructor
public class CropVarietyController {

    private final CropVarietyService cropVarietyService;
    private final GrowthStageService growthStageService;

    @GetMapping
    public Result<Page<CropVariety>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String cropType,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<CropVariety> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(cropType)) {
            wrapper.eq(CropVariety::getCropType, cropType);
        }
        if (status != null) {
            wrapper.eq(CropVariety::getStatus, status);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.like(CropVariety::getCropName, keyword)
                    .or().like(CropVariety::getVarietyName, keyword)
                    .or().like(CropVariety::getVarietyCode, keyword);
        }
        wrapper.orderByDesc(CropVariety::getCreateTime);
        return Result.success(cropVarietyService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/{id}")
    public Result<CropVariety> getById(@PathVariable Long id) {
        return Result.success(cropVarietyService.getById(id));
    }

    @GetMapping("/list")
    public Result<List<CropVariety>> listActive() {
        return Result.success(cropVarietyService.listActive());
    }

    @GetMapping("/type/{cropType}")
    public Result<List<CropVariety>> listByCropType(@PathVariable String cropType) {
        return Result.success(cropVarietyService.listByCropType(cropType));
    }

    @GetMapping("/{varietyId}/stages")
    public Result<List<GrowthStage>> listStages(@PathVariable Long varietyId) {
        return Result.success(growthStageService.listByVarietyId(varietyId));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody CropVariety cropVariety) {
        return Result.success(cropVarietyService.save(cropVariety));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody CropVariety cropVariety) {
        return Result.success(cropVarietyService.updateById(cropVariety));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(cropVarietyService.removeById(id));
    }
}
