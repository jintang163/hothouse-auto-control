package com.hothouse.service.farming;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hothouse.common.entity.farming.PlantingBatch;

import java.util.List;

public interface PlantingBatchService extends IService<PlantingBatch> {

    PlantingBatch getCurrentByGreenhouseId(Long greenhouseId);

    List<PlantingBatch> listByGreenhouseId(Long greenhouseId);

    boolean updateCurrentStage(Long batchId, Long stageId);
}
