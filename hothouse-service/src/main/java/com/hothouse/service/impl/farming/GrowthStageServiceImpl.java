package com.hothouse.service.impl.farming;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.entity.farming.GrowthStage;
import com.hothouse.mapper.farming.GrowthStageMapper;
import com.hothouse.service.farming.GrowthStageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GrowthStageServiceImpl extends ServiceImpl<GrowthStageMapper, GrowthStage>
        implements GrowthStageService {

    private final GrowthStageMapper growthStageMapper;

    @Override
    public List<GrowthStage> listByVarietyId(Long varietyId) {
        return growthStageMapper.selectByVarietyId(varietyId);
    }

    @Override
    public GrowthStage getByCode(Long varietyId, String stageCode) {
        return lambdaQuery()
                .eq(GrowthStage::getVarietyId, varietyId)
                .eq(GrowthStage::getStageCode, stageCode)
                .one();
    }
}
