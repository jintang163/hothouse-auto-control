package com.hothouse.netty.handler;

import com.hothouse.netty.session.DeviceSession;
import com.hothouse.netty.session.DeviceSessionManager;
import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.InetSocketAddress;

@Slf4j
@Component
@ChannelHandler.Sharable
@RequiredArgsConstructor
public class DeviceConnectionHandler extends ChannelInboundHandlerAdapter {

    private final DeviceSessionManager sessionManager;

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        InetSocketAddress address = (InetSocketAddress) ctx.channel().remoteAddress();
        log.info("Device connected, channelId: {}, remoteAddress: {}", ctx.channel().id(), address);
        super.channelActive(ctx);
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) throws Exception {
        DeviceSession session = sessionManager.getSession(ctx.channel().id());
        if (session != null) {
            log.info("Device disconnected, deviceCode: {}, channelId: {}",
                    session.getDeviceCode(), ctx.channel().id());
        } else {
            log.info("Channel disconnected, channelId: {}", ctx.channel().id());
        }
        sessionManager.removeSession(ctx.channel().id());
        super.channelInactive(ctx);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        log.error("Channel exception, channelId: {}", ctx.channel().id(), cause);
        ctx.close();
    }
}
