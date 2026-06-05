package com.hothouse.common.event;

import com.hothouse.common.protocol.ControlAck;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ControlAckEvent extends ApplicationEvent {

    private final ControlAck controlAck;

    public ControlAckEvent(Object source, ControlAck controlAck) {
        super(source);
        this.controlAck = controlAck;
    }
}
