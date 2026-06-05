package com.hothouse.admin.controller.farming;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hothouse.common.entity.farming.PestDisease;
import com.hothouse.common.enums.farming.PestType;
import com.hothouse.common.result.Result;
import com.hothouse.service.farming.PestDiseaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/farming/pest")
@RequiredArgsConstructor
public class PestDiseaseController {

    private final PestDiseaseService pestDiseaseService;

    @GetMapping
    public Result<Page<PestDisease>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String pestType,
            @RequestParam(required = false) String cropName,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<PestDisease> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(pestType)) {
            wrapper.eq(PestDisease::getPestType, PestType.getByCode(pestType));
        }
        if (StringUtils.hasText(cropName)) {
            wrapper.like(PestDisease::getSusceptibleCrops, cropName);
        }
        if (status != null) {
            wrapper.eq(PestDisease::getStatus, status);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.like(PestDisease::getPestName, keyword)
                    .or().like(PestDisease::getPestCode, keyword)
                    .or().like(PestDisease::getAliasNames, keyword);
        }
        wrapper.orderByDesc(PestDisease::getCreateTime);
        return Result.success(pestDiseaseService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/{id}")
    public Result<PestDisease> getById(@PathVariable Long id) {
        return Result.success(pestDiseaseService.getById(id));
    }

    @GetMapping("/type/{pestType}")
    public Result<List<PestDisease>> getByPestType(@PathVariable String pestType) {
        return Result.success(pestDiseaseService.listByPestType(pestType));
    }

    @GetMapping("/crop/{cropName}")
    public Result<List<PestDisease>> getByCropName(@PathVariable String cropName) {
        return Result.success(pestDiseaseService.listByCropName(cropName));
    }

    @GetMapping("/list")
    public Result<List<PestDisease>> listAllActive() {
        return Result.success(pestDiseaseService.listAllActive());
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody PestDisease pestDisease) {
        return Result.success(pestDiseaseService.save(pestDisease));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody PestDisease pestDisease) {
        return Result.success(pestDiseaseService.updateById(pestDisease));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(pestDiseaseService.removeById(id));
    }
}
