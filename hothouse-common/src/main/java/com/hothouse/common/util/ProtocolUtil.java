package com.hothouse.common.util;

import cn.hutool.core.util.HexUtil;
import cn.hutool.crypto.digest.MD5;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public class ProtocolUtil {

    public static int calculateChecksum(byte[] data) {
        int checksum = 0;
        for (byte b : data) {
            checksum += (b & 0xFF);
        }
        return checksum & 0xFFFF;
    }

    public static String generateDeviceKey(String deviceCode) {
        return MD5.create().digestHex(deviceCode + "_hothouse_secret");
    }

    public static byte[] intToBytes(int value) {
        return ByteBuffer.allocate(4).order(ByteOrder.BIG_ENDIAN).putInt(value).array();
    }

    public static int bytesToInt(byte[] bytes) {
        return ByteBuffer.wrap(bytes).order(ByteOrder.BIG_ENDIAN).getInt();
    }

    public static String bytesToHex(byte[] bytes) {
        return HexUtil.encodeHexStr(bytes);
    }

    public static byte[] hexToBytes(String hex) {
        return HexUtil.decodeHex(hex);
    }
}
