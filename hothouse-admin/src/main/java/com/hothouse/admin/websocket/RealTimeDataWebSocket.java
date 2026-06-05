package com.hothouse.admin.websocket;

import com.hothouse.common.dto.RealTimeDataDTO;
import com.hothouse.service.DeviceControlService;
import com.hothouse.service.GreenhouseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Component
@RequiredArgsConstructor
public class RealTimeDataWebSocket extends TextWebSocketHandler {

    private final DeviceControlService deviceControlService;
    private final GreenhouseService greenhouseService;
    private final ObjectMapper objectMapper;

    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        log.info("WebSocket client connected, sessionId: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        log.debug("Received message from client: {}", message.getPayload());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        log.info("WebSocket client disconnected, sessionId: {}", session.getId());
    }

    @Scheduled(fixedRate = 2000)
    public void pushRealTimeData() {
        if (sessions.isEmpty()) {
            return;
        }

        try {
            greenhouseService.list().forEach(greenhouse -> {
                try {
                    RealTimeDataDTO data = deviceControlService.getRealTimeData(greenhouse.getId());
                    String json = objectMapper.writeValueAsString(data);
                    TextMessage message = new TextMessage(json);

                    sessions.forEach(session -> {
                        if (session.isOpen()) {
                            try {
                                session.sendMessage(message);
                            } catch (IOException e) {
                                log.error("Send message error, sessionId: {}", session.getId(), e);
                            }
                        }
                    });
                } catch (Exception e) {
                    log.error("Push real time data error, greenhouse: {}", greenhouse.getId(), e);
                }
            });
        } catch (Exception e) {
            log.error("Push real time data error", e);
        }
    }
}
