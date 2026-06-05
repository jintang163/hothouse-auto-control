package com.hothouse.netty.session;

import io.netty.channel.Channel;
import io.netty.channel.ChannelId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class DeviceSessionManager {

    private final Map<String, DeviceSession> deviceSessionMap = new ConcurrentHashMap<>();
    private final Map<ChannelId, String> channelDeviceMap = new ConcurrentHashMap<>();

    public void addSession(DeviceSession session) {
        deviceSessionMap.put(session.getDeviceCode(), session);
        channelDeviceMap.put(session.getChannelId(), session.getDeviceCode());
        log.info("Device session added, deviceCode: {}, channelId: {}",
                session.getDeviceCode(), session.getChannelId());
    }

    public void removeSession(String deviceCode) {
        DeviceSession session = deviceSessionMap.remove(deviceCode);
        if (session != null) {
            channelDeviceMap.remove(session.getChannelId());
            log.info("Device session removed, deviceCode: {}, channelId: {}",
                    deviceCode, session.getChannelId());
        }
    }

    public void removeSession(ChannelId channelId) {
        String deviceCode = channelDeviceMap.remove(channelId);
        if (deviceCode != null) {
            deviceSessionMap.remove(deviceCode);
            log.info("Device session removed by channel, deviceCode: {}, channelId: {}",
                    deviceCode, channelId);
        }
    }

    public DeviceSession getSession(String deviceCode) {
        return deviceSessionMap.get(deviceCode);
    }

    public DeviceSession getSession(ChannelId channelId) {
        String deviceCode = channelDeviceMap.get(channelId);
        return deviceCode != null ? deviceSessionMap.get(deviceCode) : null;
    }

    public boolean isOnline(String deviceCode) {
        DeviceSession session = deviceSessionMap.get(deviceCode);
        return session != null && session.isActive() && session.isAuthenticated();
    }

    public int getOnlineCount() {
        return (int) deviceSessionMap.values().stream()
                .filter(DeviceSession::isActive)
                .filter(DeviceSession::isAuthenticated)
                .count();
    }

    public void closeSession(String deviceCode) {
        DeviceSession session = deviceSessionMap.remove(deviceCode);
        if (session != null && session.getChannel() != null) {
            session.getChannel().close();
            channelDeviceMap.remove(session.getChannelId());
        }
    }

    public void closeAll() {
        deviceSessionMap.values().forEach(session -> {
            if (session.getChannel() != null) {
                session.getChannel().close();
            }
        });
        deviceSessionMap.clear();
        channelDeviceMap.clear();
    }
}
