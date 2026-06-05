package com.hothouse.service.impl.farming;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.entity.farming.PlantingBatch;
import com.hothouse.mapper.farming.PlantingBatchMapper;
import com.hothouse.service.farming.PlantingBatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlantingBatchServiceImpl extends ServiceImpl<PlantingBatchMapper, PlantingBatch>
        implements PlantingBatchService {

    private final PlantingBatchMapper plantingBatchMapper;

    @Override
    public PlantingBatch getCurrentByGreenhouseId(Long greenhouseId) {
        return plantingBatchMapper.selectCurrentByGreenhouseId(greenhouseId);
    }

    @Override
    public List<PlantingBatch> listByGreenhouseId(Long greenhouseId) {
        return plantingBatchMapper.selectByGreenhouseId(greenhouseId);
    }

    @Override
    public boolean updateCurrentStage(Long batchId, Long stageId) {
        PlantingBatch batch = getById(batchId);
        if (batch != null) {
            batch.setCurrentStageId(stageId);
            batch.setUpdateTime(LocalDateTime.now());
            return super.updateById(batch);
        }
        return false;
    }
}
