package com.hothouse.common.event;

import com.hothouse.common.entity.SensorData;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class SensorDataEvent extends ApplicationEvent {

    private final SensorData sensorData;

    public SensorDataEvent(Object source, SensorData sensorData) {
        super(source);
        this.sensorData = sensorData;
    }
}
