package com.hothouse.netty.handler;

import com.hothouse.common.enums.MessageType;
import com.hothouse.common.protocol.IotMessage;
import com.hothouse.common.util.ProtocolUtil;
import com.hothouse.netty.session.DeviceSession;
import com.hothouse.netty.session.DeviceSessionManager;
import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.InetSocketAddress;

@Slf4j
@Component
@ChannelHandler.Sharable
@RequiredArgsConstructor
public class DeviceAuthHandler extends SimpleChannelInboundHandler<IotMessage> {

    private final DeviceSessionManager sessionManager;

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, IotMessage msg) throws Exception {
        if (msg.getMessageType() == MessageType.AUTH) {
            handleAuth(ctx, msg);
        } else {
            DeviceSession session = sessionManager.getSession(ctx.channel().id());
            if (session == null || !session.isAuthenticated()) {
                log.warn("Device not authenticated, deviceCode: {}, type: {}",
                        msg.getDeviceCode(), msg.getMessageType());
                sendAuthRequired(ctx, msg);
                return;
            }
            session.refreshActiveTime();
            ctx.fireChannelRead(msg);
        }
    }

    private void handleAuth(ChannelHandlerContext ctx, IotMessage msg) {
        String deviceCode = msg.getDeviceCode();
        String gatewayCode = msg.getGatewayCode();
        String payload = msg.getPayload();

        log.info("Device auth request, deviceCode: {}, gatewayCode: {}, payload: {}",
                deviceCode, gatewayCode, payload);

        String expectedKey = ProtocolUtil.generateDeviceKey(deviceCode);

        DeviceSession session = new DeviceSession();
        session.setDeviceCode(deviceCode);
        session.setGatewayCode(gatewayCode);
        session.setChannel(ctx.channel());
        session.setChannelId(ctx.channel().id());
        session.setRemoteAddress((InetSocketAddress) ctx.channel().remoteAddress());
        session.setAuthenticated(true);

        sessionManager.addSession(session);

        sendAuthSuccess(ctx, msg, session);
        log.info("Device authenticated success, deviceCode: {}", deviceCode);
    }

    private void sendAuthSuccess(ChannelHandlerContext ctx, IotMessage req, DeviceSession session) {
        IotMessage resp = new IotMessage();
        resp.setMagic(IotMessage.MAGIC);
        resp.setVersion(1);
        resp.setMessageType(MessageType.AUTH);
        resp.setDeviceCode(req.getDeviceCode());
        resp.setGatewayCode(req.getGatewayCode());
        resp.setTimestamp(System.currentTimeMillis());
        resp.setSequence(session.nextSequence());
        resp.setPayload("{\"status\":\"success\",\"code\":200}");

        ctx.writeAndFlush(resp);
    }

    private void sendAuthRequired(ChannelHandlerContext ctx, IotMessage req) {
        IotMessage resp = new IotMessage();
        resp.setMagic(IotMessage.MAGIC);
        resp.setVersion(1);
        resp.setMessageType(MessageType.AUTH);
        resp.setDeviceCode(req.getDeviceCode());
        resp.setGatewayCode(req.getGatewayCode());
        resp.setTimestamp(System.currentTimeMillis());
        resp.setSequence(0);
        resp.setPayload("{\"status\":\"error\",\"code\":401,\"message\":\"Authentication required\"}");

        ctx.writeAndFlush(resp);
    }
}
