package com.hothouse.common.event;

import com.hothouse.common.entity.Alarm;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class AlarmEvent extends ApplicationEvent {

    private final Alarm alarm;

    public AlarmEvent(Object source, Alarm alarm) {
        super(source);
        this.alarm = alarm;
    }
}
