package com.hothouse.netty.command;

import com.hothouse.common.dto.DeviceControlDTO;
import com.hothouse.common.entity.ControlLog;
import com.hothouse.common.enums.MessageType;
import com.hothouse.common.protocol.ControlCommand;
import com.hothouse.common.protocol.IotMessage;
import com.hothouse.netty.session.DeviceSession;
import com.hothouse.netty.session.DeviceSessionManager;
import com.hothouse.service.ControlLogService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class CommandService {

    private final DeviceSessionManager sessionManager;
    private final ControlLogService controlLogService;
    private final ObjectMapper objectMapper;

    private final Map<Integer, CompletableFuture<Boolean>> pendingCommands = new ConcurrentHashMap<>();
    private static final int ACK_TIMEOUT = 30;

    public boolean sendCommand(DeviceControlDTO controlDTO, String triggerSource) {
        String deviceCode = controlDTO.getDeviceCode();
        DeviceSession session = sessionManager.getSession(deviceCode);

        if (session == null || !session.isActive()) {
            log.warn("Device is offline, cannot send command, deviceCode: {}", deviceCode);
            saveControlLog(controlDTO, triggerSource, 2, "设备离线");
            return false;
        }

        try {
            ControlCommand command = new ControlCommand();
            command.setTargetDeviceCode(deviceCode);
            command.setAction(controlDTO.getAction());
            command.setActionParams(controlDTO.getActionParams());
            command.setTriggerSource(triggerSource);
            command.setRemark(controlDTO.getRemark());

            int sequence = session.nextSequence();

            IotMessage message = new IotMessage();
            message.setMagic(IotMessage.MAGIC);
            message.setVersion(1);
            message.setMessageType(MessageType.CONTROL_CMD);
            message.setDeviceCode(deviceCode);
            message.setGatewayCode(session.getGatewayCode());
            message.setTimestamp(System.currentTimeMillis());
            message.setSequence(sequence);
            message.setPayload(objectMapper.writeValueAsString(command));

            CompletableFuture<Boolean> future = new CompletableFuture<>();
            pendingCommands.put(sequence, future);

            session.getChannel().writeAndFlush(message);

            saveControlLog(controlDTO, triggerSource, 1, "指令已发送");

            log.info("Control command sent, deviceCode: {}, action: {}, sequence: {}",
                    deviceCode, controlDTO.getAction(), sequence);

            try {
                Boolean result = future.get(ACK_TIMEOUT, TimeUnit.SECONDS);
                pendingCommands.remove(sequence);
                if (Boolean.TRUE.equals(result)) {
                    updateControlLog(sequence, 0, "执行成功");
                    return true;
                } else {
                    updateControlLog(sequence, 3, "执行失败");
                    return retryCommand(session, controlDTO, triggerSource, sequence);
                }
            } catch (Exception e) {
                pendingCommands.remove(sequence);
                log.warn("Command timeout, deviceCode: {}, sequence: {}", deviceCode, sequence);
                updateControlLog(sequence, 4, "指令超时");
                return retryCommand(session, controlDTO, triggerSource, sequence);
            }
        } catch (Exception e) {
            log.error("Send command error, deviceCode: {}", deviceCode, e);
            saveControlLog(controlDTO, triggerSource, 3, e.getMessage());
            return false;
        }
    }

    private boolean retryCommand(DeviceSession session, DeviceControlDTO controlDTO,
                                 String triggerSource, int originalSequence) {
        int retryCount = 3;
        for (int i = 1; i <= retryCount; i++) {
            try {
                log.info("Retry command, attempt: {}, deviceCode: {}", i, controlDTO.getDeviceCode());

                Thread.sleep(1000L * i);

                ControlCommand command = new ControlCommand();
                command.setTargetDeviceCode(controlDTO.getDeviceCode());
                command.setAction(controlDTO.getAction());
                command.setActionParams(controlDTO.getActionParams());
                command.setTriggerSource(triggerSource + "_retry_" + i);

                int sequence = session.nextSequence();

                IotMessage message = new IotMessage();
                message.setMagic(IotMessage.MAGIC);
                message.setVersion(1);
                message.setMessageType(MessageType.CONTROL_CMD);
                message.setDeviceCode(controlDTO.getDeviceCode());
                message.setGatewayCode(session.getGatewayCode());
                message.setTimestamp(System.currentTimeMillis());
                message.setSequence(sequence);
                message.setPayload(objectMapper.writeValueAsString(command));

                CompletableFuture<Boolean> future = new CompletableFuture<>();
                pendingCommands.put(sequence, future);

                session.getChannel().writeAndFlush(message);
                updateRetryCount(originalSequence, i);

                Boolean result = future.get(ACK_TIMEOUT, TimeUnit.SECONDS);
                pendingCommands.remove(sequence);

                if (Boolean.TRUE.equals(result)) {
                    updateControlLog(originalSequence, 0, "重试成功");
                    return true;
                }
            } catch (Exception e) {
                log.warn("Retry command failed, attempt: {}, deviceCode: {}",
                        i, controlDTO.getDeviceCode(), e);
            }
        }
        updateControlLog(originalSequence, 3, "重试失败");
        return false;
    }

    public void handleAck(int sequence, boolean success, String message) {
        CompletableFuture<Boolean> future = pendingCommands.get(sequence);
        if (future != null) {
            future.complete(success);
            log.debug("Command ack handled, sequence: {}, success: {}", sequence, success);
        }
    }

    private void saveControlLog(DeviceControlDTO controlDTO, String triggerSource,
                                int status, String remark) {
        try {
            ControlLog log = new ControlLog();
            log.setDeviceCode(controlDTO.getDeviceCode());
            log.setDeviceName(controlDTO.getDeviceType() != null ?
                    controlDTO.getDeviceType().getDesc() : "未知设备");
            log.setActionType(controlDTO.getAction());
            log.setActionContent(controlDTO.getActionParams());
            log.setTriggerSource(triggerSource);
            log.setCommandStatus(status);
            log.setCommandTime(LocalDateTime.now());
            log.setRetryCount(0);
            log.setOperator(controlDTO.getOperator());
            log.setRemark(remark);
            controlLogService.save(log);
        } catch (Exception e) {
            log.error("Save control log error", e);
        }
    }

    private void updateControlLog(int sequence, int status, String remark) {
    }

    private void updateRetryCount(int sequence, int retryCount) {
    }
}
