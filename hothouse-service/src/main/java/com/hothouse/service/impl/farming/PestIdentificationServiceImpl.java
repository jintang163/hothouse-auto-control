package com.hothouse.service.impl.farming;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.entity.farming.PestIdentification;
import com.hothouse.common.enums.farming.HandleStatus;
import com.hothouse.mapper.farming.PestIdentificationMapper;
import com.hothouse.service.farming.PestIdentificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PestIdentificationServiceImpl extends ServiceImpl<PestIdentificationMapper, PestIdentification> 
        implements PestIdentificationService {

    private final PestIdentificationMapper pestIdentificationMapper;

    @Override
    public List<PestIdentification> listRecentByGreenhouseId(Long greenhouseId, Integer limit) {
        return pestIdentificationMapper.selectRecentByGreenhouseId(greenhouseId, limit);
    }

    @Override
    public List<PestIdentification> listByTimeRange(Long greenhouseId, LocalDateTime startTime, LocalDateTime endTime) {
        return pestIdentificationMapper.selectByTimeRange(greenhouseId, startTime, endTime);
    }

    @Override
    public List<PestIdentification> listByHandleStatus(HandleStatus handleStatus) {
        return pestIdentificationMapper.selectByHandleStatus(handleStatus.getCode());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateHandleStatus(Long id, HandleStatus handleStatus, String handler, String handleResult) {
        PestIdentification identification = getById(id);
        if (identification == null) {
            return false;
        }
        
        identification.setHandleStatus(handleStatus);
        identification.setHandler(handler);
        identification.setHandleResult(handleResult);
        identification.setHandleTime(LocalDateTime.now());
        
        return updateById(identification);
    }
}
