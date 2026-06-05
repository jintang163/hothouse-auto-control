package com.hothouse.service.farming;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hothouse.common.entity.farming.FarmingLog;
import com.hothouse.common.enums.farming.LogType;

import java.time.LocalDateTime;
import java.util.List;

public interface FarmingLogService extends IService<FarmingLog> {

    List<FarmingLog> listRecentByGreenhouseId(Long greenhouseId, Integer limit);

    List<FarmingLog> listByTimeRange(Long greenhouseId, LocalDateTime startTime, LocalDateTime endTime);

    List<FarmingLog> listByTaskId(Long taskId);

    boolean createLog(Long greenhouseId, Long taskId, Long prescriptionId,
                      Long varietyId, Long stageId, LogType logType,
                      String logContent, String operator, String envData, String remark);

    String generateLogCode();
}
