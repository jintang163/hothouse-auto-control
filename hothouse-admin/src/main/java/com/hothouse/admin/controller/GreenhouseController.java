package com.hothouse.admin.controller;

import com.hothouse.common.entity.Greenhouse;
import com.hothouse.common.result.Result;
import com.hothouse.service.GreenhouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/greenhouse")
@RequiredArgsConstructor
public class GreenhouseController {

    private final GreenhouseService greenhouseService;

    @GetMapping
    public Result<List<Greenhouse>> list() {
        return Result.success(greenhouseService.list());
    }

    @GetMapping("/{id}")
    public Result<Greenhouse> getById(@PathVariable Long id) {
        return Result.success(greenhouseService.getById(id));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody Greenhouse greenhouse) {
        return Result.success(greenhouseService.save(greenhouse));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody Greenhouse greenhouse) {
        return Result.success(greenhouseService.update(greenhouse));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(greenhouseService.delete(id));
    }
}
