package com.hothouse.service.farming;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hothouse.common.entity.farming.PestIdentification;
import com.hothouse.common.enums.farming.HandleStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface PestIdentificationService extends IService<PestIdentification> {

    List<PestIdentification> listRecentByGreenhouseId(Long greenhouseId, Integer limit);

    List<PestIdentification> listByTimeRange(Long greenhouseId, LocalDateTime startTime, LocalDateTime endTime);

    List<PestIdentification> listByHandleStatus(HandleStatus handleStatus);

    boolean updateHandleStatus(Long id, HandleStatus handleStatus, String handler, String handleResult);
}
