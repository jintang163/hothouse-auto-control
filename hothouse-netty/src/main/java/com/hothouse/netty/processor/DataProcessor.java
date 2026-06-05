package com.hothouse.netty.processor;

import com.hothouse.common.entity.SensorData;
import com.hothouse.common.protocol.IotMessage;
import com.hothouse.common.protocol.SensorDataPayload;

public interface DataProcessor {

    SensorData process(IotMessage message, SensorDataPayload payload);
}
