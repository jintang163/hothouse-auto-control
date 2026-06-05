package com.hothouse.netty.handler;

import com.hothouse.common.entity.SensorData;
import com.hothouse.common.enums.MessageType;
import com.hothouse.common.event.SensorDataEvent;
import com.hothouse.common.protocol.IotMessage;
import com.hothouse.common.protocol.SensorDataPayload;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hothouse.netty.processor.DataProcessor;
import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Component
@ChannelHandler.Sharable
@RequiredArgsConstructor
public class DataUploadHandler extends SimpleChannelInboundHandler<IotMessage> {

    private final ObjectMapper objectMapper;
    private final DataProcessor dataProcessor;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, IotMessage msg) throws Exception {
        if (msg.getMessageType() == MessageType.DATA_UPLOAD) {
            handleDataUpload(ctx, msg);
        } else if (msg.getMessageType() == MessageType.ALARM) {
            handleAlarmUpload(ctx, msg);
        } else {
            ctx.fireChannelRead(msg);
        }
    }

    private void handleDataUpload(ChannelHandlerContext ctx, IotMessage msg) {
        try {
            log.debug("Data upload received, deviceCode: {}, payload: {}",
                    msg.getDeviceCode(), msg.getPayload());

            SensorDataPayload payload = objectMapper.readValue(msg.getPayload(), SensorDataPayload.class);

            SensorData sensorData = dataProcessor.process(msg, payload);

            if (sensorData != null) {
                eventPublisher.publishEvent(new SensorDataEvent(this, sensorData));
                sendDataAck(ctx, msg, true, null);
            } else {
                sendDataAck(ctx, msg, false, "Invalid data");
            }
        } catch (Exception e) {
            log.error("Process data upload error, deviceCode: {}", msg.getDeviceCode(), e);
            sendDataAck(ctx, msg, false, e.getMessage());
        }
    }

    private void handleAlarmUpload(ChannelHandlerContext ctx, IotMessage msg) {
        log.info("Alarm upload received, deviceCode: {}, payload: {}",
                msg.getDeviceCode(), msg.getPayload());
        sendDataAck(ctx, msg, true, null);
    }

    private void sendDataAck(ChannelHandlerContext ctx, IotMessage req, boolean success, String errorMsg) {
        IotMessage resp = new IotMessage();
        resp.setMagic(IotMessage.MAGIC);
        resp.setVersion(1);
        resp.setMessageType(MessageType.DATA_UPLOAD);
        resp.setDeviceCode(req.getDeviceCode());
        resp.setGatewayCode(req.getGatewayCode());
        resp.setTimestamp(System.currentTimeMillis());
        resp.setSequence(req.getSequence());

        try {
            String payload = success ?
                    objectMapper.writeValueAsString(new AckResult(200, "success")) :
                    objectMapper.writeValueAsString(new AckResult(500, errorMsg));
            resp.setPayload(payload);
        } catch (Exception e) {
            resp.setPayload("{\"code\":500,\"message\":\"error\"}");
        }

        ctx.writeAndFlush(resp);
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    private static class AckResult {
        private int code;
        private String message;
    }
}
