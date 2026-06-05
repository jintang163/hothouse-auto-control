package com.hothouse.service.farming;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hothouse.common.entity.farming.GrowthStage;

import java.util.List;

public interface GrowthStageService extends IService<GrowthStage> {

    List<GrowthStage> listByVarietyId(Long varietyId);

    GrowthStage getByCode(Long varietyId, String stageCode);
}
