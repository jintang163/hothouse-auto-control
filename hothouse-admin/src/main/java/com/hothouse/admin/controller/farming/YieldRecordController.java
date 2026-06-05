package com.hothouse.admin.controller.farming;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hothouse.common.entity.farming.YieldRecord;
import com.hothouse.common.result.Result;
import com.hothouse.service.farming.YieldRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/farming/yield")
@RequiredArgsConstructor
public class YieldRecordController {

    private final YieldRecordService yieldRecordService;

    @GetMapping
    public Result<Page<YieldRecord>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long greenhouseId,
            @RequestParam(required = false) Long varietyId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<YieldRecord> wrapper = new LambdaQueryWrapper<>();
        if (greenhouseId != null) {
            wrapper.eq(YieldRecord::getGreenhouseId, greenhouseId);
        }
        if (varietyId != null) {
            wrapper.eq(YieldRecord::getVarietyId, varietyId);
        }
        if (startDate != null) {
            wrapper.ge(YieldRecord::getHarvestDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(YieldRecord::getHarvestDate, endDate);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.like(YieldRecord::getRecordCode, keyword);
        }
        wrapper.orderByDesc(YieldRecord::getHarvestDate);
        return Result.success(yieldRecordService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/{id}")
    public Result<YieldRecord> getById(@PathVariable Long id) {
        return Result.success(yieldRecordService.getById(id));
    }

    @GetMapping("/greenhouse/{greenhouseId}")
    public Result<List<YieldRecord>> getByGreenhouseId(@PathVariable Long greenhouseId) {
        return Result.success(yieldRecordService.listByGreenhouseId(greenhouseId));
    }

    @GetMapping("/analysis/{greenhouseId}/{varietyId}")
    public Result<Map<String, Object>> getYieldAnalysis(
            @PathVariable Long greenhouseId,
            @PathVariable Long varietyId) {
        return Result.success(yieldRecordService.getYieldAnalysis(greenhouseId, varietyId));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody YieldRecord yieldRecord) {
        if (!StringUtils.hasText(yieldRecord.getRecordCode())) {
            yieldRecord.setRecordCode(yieldRecordService.generateRecordCode());
        }
        return Result.success(yieldRecordService.save(yieldRecord));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody YieldRecord yieldRecord) {
        return Result.success(yieldRecordService.updateById(yieldRecord));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(yieldRecordService.removeById(id));
    }
}
