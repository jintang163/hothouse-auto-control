package com.hothouse.service;

import com.hothouse.common.entity.Device;
import com.hothouse.common.enums.DeviceType;

import java.util.List;

public interface DeviceService {

    List<Device> list();

    Device getById(Long id);

    Device getByCode(String deviceCode);

    List<Device> getByGreenhouseId(Long greenhouseId);

    List<Device> getByType(Long greenhouseId, DeviceType deviceType);

    boolean save(Device device);

    boolean update(Device device);

    boolean delete(Long id);

    boolean updateStatus(String deviceCode, Integer status);
}
