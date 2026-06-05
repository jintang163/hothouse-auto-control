package com.hothouse.netty.handler;

import com.hothouse.common.enums.MessageType;
import com.hothouse.common.event.ControlAckEvent;
import com.hothouse.common.protocol.ControlAck;
import com.hothouse.common.protocol.IotMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ChannelHandler.Sharable
@RequiredArgsConstructor
public class ControlResponseHandler extends SimpleChannelInboundHandler<IotMessage> {

    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, IotMessage msg) throws Exception {
        if (msg.getMessageType() == MessageType.CONTROL_ACK) {
            handleControlAck(ctx, msg);
        } else {
            log.warn("Unhandled message type: {}, deviceCode: {}",
                    msg.getMessageType(), msg.getDeviceCode());
        }
    }

    private void handleControlAck(ChannelHandlerContext ctx, IotMessage msg) {
        try {
            log.info("Control ack received, deviceCode: {}, sequence: {}, payload: {}",
                    msg.getDeviceCode(), msg.getSequence(), msg.getPayload());

            ControlAck controlAck = objectMapper.readValue(msg.getPayload(), ControlAck.class);
            controlAck.setTargetDeviceCode(msg.getDeviceCode());
            controlAck.setSequence(msg.getSequence());
            controlAck.setExecuteTime(msg.getTimestamp());

            eventPublisher.publishEvent(new ControlAckEvent(this, controlAck));
        } catch (Exception e) {
            log.error("Process control ack error, deviceCode: {}", msg.getDeviceCode(), e);
        }
    }
}
