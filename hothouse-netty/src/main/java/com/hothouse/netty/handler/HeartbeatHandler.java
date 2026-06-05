package com.hothouse.netty.handler;

import com.hothouse.common.enums.MessageType;
import com.hothouse.common.protocol.IotMessage;
import com.hothouse.netty.session.DeviceSession;
import com.hothouse.netty.session.DeviceSessionManager;
import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ChannelHandler.Sharable
@RequiredArgsConstructor
public class HeartbeatHandler extends SimpleChannelInboundHandler<IotMessage> {

    private final DeviceSessionManager sessionManager;

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, IotMessage msg) throws Exception {
        if (msg.getMessageType() == MessageType.HEARTBEAT) {
            handleHeartbeat(ctx, msg);
        } else {
            ctx.fireChannelRead(msg);
        }
    }

    private void handleHeartbeat(ChannelHandlerContext ctx, IotMessage msg) {
        DeviceSession session = sessionManager.getSession(msg.getDeviceCode());
        if (session != null) {
            session.refreshActiveTime();
            log.debug("Heartbeat received, deviceCode: {}, timestamp: {}",
                    msg.getDeviceCode(), msg.getTimestamp());

            sendHeartbeatResponse(ctx, msg, session);
        } else {
            log.warn("Heartbeat from unknown device: {}", msg.getDeviceCode());
        }
    }

    private void sendHeartbeatResponse(ChannelHandlerContext ctx, IotMessage req, DeviceSession session) {
        IotMessage resp = new IotMessage();
        resp.setMagic(IotMessage.MAGIC);
        resp.setVersion(1);
        resp.setMessageType(MessageType.HEARTBEAT);
        resp.setDeviceCode(req.getDeviceCode());
        resp.setGatewayCode(req.getGatewayCode());
        resp.setTimestamp(System.currentTimeMillis());
        resp.setSequence(session.nextSequence());
        resp.setPayload("{\"status\":\"online\"}");

        ctx.writeAndFlush(resp);
    }
}
