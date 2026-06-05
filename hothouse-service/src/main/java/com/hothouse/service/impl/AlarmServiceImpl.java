package com.hothouse.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.entity.Alarm;
import com.hothouse.common.enums.AlarmLevel;
import com.hothouse.common.event.AlarmEvent;
import com.hothouse.mapper.AlarmMapper;
import com.hothouse.service.AlarmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlarmServiceImpl extends ServiceImpl<AlarmMapper, Alarm>
        implements AlarmService {

    private final ApplicationEventPublisher eventPublisher;

    @Override
    public List<Alarm> getActiveAlarms(Long greenhouseId) {
        return baseMapper.selectActiveAlarms(greenhouseId);
    }

    @Override
    public List<Alarm> getByTimeRange(Long greenhouseId, LocalDateTime startTime, LocalDateTime endTime) {
        return baseMapper.selectByTimeRange(greenhouseId, startTime, endTime);
    }

    @Override
    public boolean save(Alarm alarm) {
        if (alarm.getAlarmTime() == null) {
            alarm.setAlarmTime(LocalDateTime.now());
        }
        if (alarm.getStatus() == null) {
            alarm.setStatus(0);
        }
        boolean result = super.save(alarm);

        if (result && alarm.getAlarmLevel() != null &&
                alarm.getAlarmLevel().ordinal() >= AlarmLevel.WARNING.ordinal()) {
            eventPublisher.publishEvent(new AlarmEvent(this, alarm));
        }

        return result;
    }

    @Override
    public boolean handle(Long id, String handledBy, String remark) {
        Alarm alarm = getById(id);
        if (alarm != null) {
            alarm.setStatus(1);
            alarm.setRecoverTime(LocalDateTime.now());
            alarm.setHandledBy(handledBy);
            alarm.setHandleRemark(remark);
            alarm.setHandleTime(LocalDateTime.now());
            return super.updateById(alarm);
        }
        return false;
    }

    @Override
    public int countActive() {
        return lambdaQuery().eq(Alarm::getStatus, 0).count().intValue();
    }
}
