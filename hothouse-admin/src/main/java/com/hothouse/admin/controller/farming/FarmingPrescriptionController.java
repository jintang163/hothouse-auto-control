package com.hothouse.admin.controller.farming;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hothouse.common.dto.farming.PrescriptionCopyDTO;
import com.hothouse.common.dto.farming.PrescriptionDTO;
import com.hothouse.common.entity.farming.FarmingPrescription;
import com.hothouse.common.enums.farming.PrescriptionStatus;
import com.hothouse.common.result.Result;
import com.hothouse.service.farming.FarmingPrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prescription")
@RequiredArgsConstructor
public class FarmingPrescriptionController {

    private final FarmingPrescriptionService farmingPrescriptionService;

    @GetMapping
    public Result<Page<FarmingPrescription>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long greenhouseId,
            @RequestParam(required = false) Long varietyId,
            @RequestParam(required = false) PrescriptionStatus status,
            @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<FarmingPrescription> wrapper = new LambdaQueryWrapper<>();
        if (greenhouseId != null) {
            wrapper.eq(FarmingPrescription::getGreenhouseId, greenhouseId);
        }
        if (varietyId != null) {
            wrapper.eq(FarmingPrescription::getVarietyId, varietyId);
        }
        if (status != null) {
            wrapper.eq(FarmingPrescription::getStatus, status);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.like(FarmingPrescription::getPrescriptionName, keyword)
                    .or().like(FarmingPrescription::getPrescriptionCode, keyword);
        }
        wrapper.orderByDesc(FarmingPrescription::getCreateTime);
        return Result.success(farmingPrescriptionService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/{id}")
    public Result<PrescriptionDTO> getDetailById(@PathVariable Long id) {
        return Result.success(farmingPrescriptionService.getDetailById(id));
    }

    @GetMapping("/active/{greenhouseId}")
    public Result<List<FarmingPrescription>> listActive(@PathVariable Long greenhouseId) {
        return Result.success(farmingPrescriptionService.listActiveByGreenhouseId(greenhouseId));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody PrescriptionDTO dto) {
        return Result.success(farmingPrescriptionService.savePrescription(dto));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody PrescriptionDTO dto) {
        return Result.success(farmingPrescriptionService.updatePrescription(dto));
    }

    @PostMapping("/copy")
    public Result<Long> copy(@RequestBody PrescriptionCopyDTO dto) {
        return Result.success(farmingPrescriptionService.copyPrescription(dto));
    }

    @PostMapping("/{id}/publish")
    public Result<Boolean> publish(@PathVariable Long id) {
        return Result.success(farmingPrescriptionService.publish(id));
    }

    @PostMapping("/{id}/archive")
    public Result<Boolean> archive(@PathVariable Long id) {
        return Result.success(farmingPrescriptionService.archive(id));
    }

    @PostMapping("/{id}/new-version")
    public Result<Long> newVersion(@PathVariable Long id, @RequestParam String creator) {
        return Result.success(farmingPrescriptionService.createNewVersion(id, creator));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(farmingPrescriptionService.removeById(id));
    }
}
