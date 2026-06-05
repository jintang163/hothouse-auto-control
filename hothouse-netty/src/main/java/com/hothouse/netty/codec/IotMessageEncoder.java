package com.hothouse.netty.protocol;

import com.hothouse.common.enums.MessageType;
import com.hothouse.common.protocol.IotMessage;
import com.hothouse.common.util.ProtocolUtil;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToByteEncoder;
import lombok.extern.slf4j.Slf4j;

import java.nio.charset.StandardCharsets;

@Slf4j
public class IotMessageEncoder extends MessageToByteEncoder<IotMessage> {

    @Override
    protected void encode(ChannelHandlerContext ctx, IotMessage msg, ByteBuf out) throws Exception {
        try {
            byte[] payloadBytes = msg.getPayload() != null ?
                    msg.getPayload().getBytes(StandardCharsets.UTF_8) : new byte[0];

            int payloadLength = payloadBytes.length;
            int totalLength = 4 + 2 + 2 + 20 + 20 + 8 + 4 + payloadLength + 2;

            out.writeInt(msg.getMagic());
            out.writeShort(msg.getVersion());
            out.writeShort(msg.getMessageType().getCode());
            out.writeBytes(fixedLengthBytes(msg.getDeviceCode(), 20));
            out.writeBytes(fixedLengthBytes(msg.getGatewayCode(), 20));
            out.writeLong(msg.getTimestamp());
            out.writeInt(msg.getSequence());
            out.writeInt(payloadLength);
            out.writeBytes(payloadBytes);

            byte[] frameBytes = new byte[totalLength - 2];
            out.getBytes(0, frameBytes);
            int checksum = ProtocolUtil.calculateChecksum(frameBytes);
            out.writeShort(checksum);

            log.debug("Encode message success, deviceCode: {}, type: {}",
                    msg.getDeviceCode(), msg.getMessageType());
        } catch (Exception e) {
            log.error("Encode message error", e);
            throw e;
        }
    }

    private byte[] fixedLengthBytes(String str, int length) {
        byte[] bytes = new byte[length];
        if (str != null) {
            byte[] strBytes = str.getBytes(StandardCharsets.UTF_8);
            System.arraycopy(strBytes, 0, bytes, 0, Math.min(strBytes.length, length));
        }
        return bytes;
    }
}
