package com.hothouse.netty.codec;

import com.hothouse.common.enums.MessageType;
import com.hothouse.common.protocol.IotMessage;
import com.hothouse.common.util.ProtocolUtil;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.ByteToMessageDecoder;
import lombok.extern.slf4j.Slf4j;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
public class IotMessageDecoder extends ByteToMessageDecoder {

    private static final int MIN_FRAME_LENGTH = 4 + 2 + 2 + 20 + 20 + 8 + 4 + 4 + 2;
    private static final int MAX_PAYLOAD_LENGTH = 1024 * 1024;

    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception {
        if (in.readableBytes() < MIN_FRAME_LENGTH) {
            return;
        }

        in.markReaderIndex();

        int magic = in.readInt();
        if (magic != IotMessage.MAGIC) {
            log.warn("Invalid magic number: {}, close channel", magic);
            in.clear();
            ctx.close();
            return;
        }

        int version = in.readUnsignedShort();
        int messageTypeCode = in.readUnsignedShort();
        MessageType messageType = MessageType.getByCode(messageTypeCode);
        if (messageType == null) {
            log.warn("Unknown message type: {}", messageTypeCode);
            in.skipBytes(in.readableBytes());
            return;
        }

        byte[] deviceCodeBytes = new byte[20];
        in.readBytes(deviceCodeBytes);
        String deviceCode = new String(deviceCodeBytes, StandardCharsets.UTF_8).trim();

        byte[] gatewayCodeBytes = new byte[20];
        in.readBytes(gatewayCodeBytes);
        String gatewayCode = new String(gatewayCodeBytes, StandardCharsets.UTF_8).trim();

        long timestamp = in.readLong();
        int sequence = in.readInt();
        int payloadLength = in.readInt();

        if (payloadLength < 0 || payloadLength > MAX_PAYLOAD_LENGTH) {
            log.warn("Invalid payload length: {}", payloadLength);
            in.clear();
            ctx.close();
            return;
        }

        if (in.readableBytes() < payloadLength + 2) {
            in.resetReaderIndex();
            return;
        }

        byte[] payloadBytes = new byte[payloadLength];
        in.readBytes(payloadBytes);
        String payload = new String(payloadBytes, StandardCharsets.UTF_8);

        int receivedChecksum = in.readUnsignedShort();

        in.resetReaderIndex();
        byte[] frameBytes = new byte[MIN_FRAME_LENGTH + payloadLength - 2];
        in.readBytes(frameBytes);
        int calculatedChecksum = ProtocolUtil.calculateChecksum(frameBytes);

        if (receivedChecksum != calculatedChecksum) {
            log.warn("Checksum mismatch, received: {}, calculated: {}", receivedChecksum, calculatedChecksum);
            return;
        }

        IotMessage message = new IotMessage();
        message.setMagic(magic);
        message.setVersion(version);
        message.setMessageType(messageType);
        message.setDeviceCode(deviceCode);
        message.setGatewayCode(gatewayCode);
        message.setTimestamp(timestamp);
        message.setSequence(sequence);
        message.setPayload(payload);
        message.setChecksum(receivedChecksum);

        out.add(message);
        log.debug("Decode message success, deviceCode: {}, type: {}, payload: {}",
                deviceCode, messageType, payload);
    }
}
