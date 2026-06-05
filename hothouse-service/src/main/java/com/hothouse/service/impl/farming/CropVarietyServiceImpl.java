package com.hothouse.service.impl.farming;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.entity.farming.CropVariety;
import com.hothouse.mapper.farming.CropVarietyMapper;
import com.hothouse.service.farming.CropVarietyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CropVarietyServiceImpl extends ServiceImpl<CropVarietyMapper, CropVariety>
        implements CropVarietyService {

    @Override
    public List<CropVariety> listByCropType(String cropType) {
        return lambdaQuery()
                .eq(CropVariety::getCropType, cropType)
                .list();
    }

    @Override
    public List<CropVariety> listActive() {
        return lambdaQuery()
                .eq(CropVariety::getStatus, 1)
                .list();
    }
}
