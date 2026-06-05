package com.hothouse.service;

import com.hothouse.common.entity.ControlStrategy;
import com.hothouse.common.enums.ControlMode;

import java.util.List;

public interface ControlStrategyService {

    List<ControlStrategy> list();

    ControlStrategy getById(Long id);

    List<ControlStrategy> getActiveByGreenhouseId(Long greenhouseId);

    ControlStrategy getByMode(Long greenhouseId, ControlMode mode);

    boolean save(ControlStrategy strategy);

    boolean update(ControlStrategy strategy);

    boolean delete(Long id);

    boolean enable(Long id);

    boolean disable(Long id);
}
