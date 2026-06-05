package com.hothouse.rule;

import com.hothouse.common.dto.RuleExecutionResult;
import com.hothouse.common.entity.ControlStrategy;
import com.hothouse.common.entity.SensorData;

public interface RuleEngine {

    RuleExecutionResult execute(ControlStrategy strategy, SensorData sensorData);
}
