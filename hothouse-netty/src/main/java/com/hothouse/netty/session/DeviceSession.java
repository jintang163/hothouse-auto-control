package com.hothouse.netty.session;

import io.netty.channel.Channel;
import io.netty.channel.ChannelId;
import lombok.Data;

import java.net.InetSocketAddress;
import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicInteger;

@Data
public class DeviceSession {

    private String deviceCode;

    private String gatewayCode;

    private Channel channel;

    private ChannelId channelId;

    private InetSocketAddress remoteAddress;

    private LocalDateTime connectTime;

    private LocalDateTime lastActiveTime;

    private AtomicInteger sequenceGenerator;

    private volatile boolean authenticated;

    public DeviceSession() {
        this.sequenceGenerator = new AtomicInteger(0);
        this.connectTime = LocalDateTime.now();
        this.lastActiveTime = LocalDateTime.now();
    }

    public int nextSequence() {
        return sequenceGenerator.incrementAndGet();
    }

    public void refreshActiveTime() {
        this.lastActiveTime = LocalDateTime.now();
    }

    public boolean isActive() {
        return channel != null && channel.isActive();
    }
}
