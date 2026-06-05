package com.hothouse.service.farming;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hothouse.common.entity.farming.CropVariety;

import java.util.List;

public interface CropVarietyService extends IService<CropVariety> {

    List<CropVariety> listByCropType(String cropType);

    List<CropVariety> listActive();
}
