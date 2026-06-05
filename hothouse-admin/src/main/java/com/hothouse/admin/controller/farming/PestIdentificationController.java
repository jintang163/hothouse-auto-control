package com.hothouse.admin.controller.farming;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hothouse.common.dto.farming.PestIdentifyDTO;
import com.hothouse.common.entity.farming.PestIdentification;
import com.hothouse.common.enums.farming.HandleStatus;
import com.hothouse.common.result.Result;
import com.hothouse.service.farming.PestDiseaseService;
import com.hothouse.service.farming.PestIdentificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/farming/identify")
@RequiredArgsConstructor
public class PestIdentificationController {

    private final PestIdentificationService pestIdentificationService;
    private final PestDiseaseService pestDiseaseService;

    @GetMapping
    public Result<Page<PestIdentification>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long greenhouseId,
            @RequestParam(required = false) Integer handleStatus,
            @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<PestIdentification> wrapper = new LambdaQueryWrapper<>();
        if (greenhouseId != null) {
            wrapper.eq(PestIdentification::getGreenhouseId, greenhouseId);
        }
        if (handleStatus != null) {
            wrapper.eq(PestIdentification::getHandleStatus, HandleStatus.getByCode(handleStatus));
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.like(PestIdentification::getIdentifyCode, keyword)
                    .or().like(PestIdentification::getPestName, keyword);
        }
        wrapper.orderByDesc(PestIdentification::getIdentifyTime);
        return Result.success(pestIdentificationService.page(new Page<>(page, size), wrapper));
    }

    @GetMapping("/{id}")
    public Result<PestIdentification> getById(@PathVariable Long id) {
        return Result.success(pestIdentificationService.getById(id));
    }

    @GetMapping("/recent/{greenhouseId}")
    public Result<List<PestIdentification>> getRecent(
            @PathVariable Long greenhouseId,
            @RequestParam(defaultValue = "10") Integer limit) {
        return Result.success(pestIdentificationService.listRecentByGreenhouseId(greenhouseId, limit));
    }

    @GetMapping("/pending")
    public Result<List<PestIdentification>> getPending() {
        return Result.success(pestIdentificationService.listByHandleStatus(HandleStatus.PENDING));
    }

    @PostMapping
    public Result<PestIdentification> identify(@RequestBody PestIdentifyDTO dto) {
        return Result.success(pestDiseaseService.identifyPest(dto));
    }

    @PutMapping("/{id}/handle")
    public Result<Boolean> handle(
            @PathVariable Long id,
            @RequestParam String handler,
            @RequestParam String handleResult) {
        return Result.success(pestIdentificationService.updateHandleStatus(
                id, HandleStatus.HANDLED, handler, handleResult));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(pestIdentificationService.removeById(id));
    }
}
