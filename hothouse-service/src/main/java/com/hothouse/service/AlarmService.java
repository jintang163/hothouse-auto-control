package com.hothouse.service;

import com.hothouse.common.entity.Alarm;

import java.time.LocalDateTime;
import java.util.List;

public interface AlarmService {

    List<Alarm> getActiveAlarms(Long greenhouseId);

    List<Alarm> getByTimeRange(Long greenhouseId, LocalDateTime startTime, LocalDateTime endTime);

    boolean save(Alarm alarm);

    boolean handle(Long id, String handledBy, String remark);

    int countActive();
}
