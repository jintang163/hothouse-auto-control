package com.hothouse.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.entity.Device;
import com.hothouse.common.enums.DeviceStatus;
import com.hothouse.common.enums.DeviceType;
import com.hothouse.mapper.DeviceMapper;
import com.hothouse.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DeviceServiceImpl extends ServiceImpl<DeviceMapper, Device>
        implements DeviceService {

    @Override
    public List<Device> list() {
        return super.list();
    }

    @Override
    public Device getById(Long id) {
        return super.getById(id);
    }

    @Override
    public Device getByCode(String deviceCode) {
        return baseMapper.selectByCode(deviceCode);
    }

    @Override
    public List<Device> getByGreenhouseId(Long greenhouseId) {
        return baseMapper.selectByGreenhouseId(greenhouseId);
    }

    @Override
    public List<Device> getByType(Long greenhouseId, DeviceType deviceType) {
        return baseMapper.selectByType(greenhouseId, deviceType.getCode());
    }

    @Override
    public boolean save(Device device) {
        if (device.getDeviceStatus() == null) {
            device.setDeviceStatus(DeviceStatus.OFFLINE);
        }
        return super.save(device);
    }

    @Override
    public boolean update(Device device) {
        return super.updateById(device);
    }

    @Override
    public boolean delete(Long id) {
        return super.removeById(id);
    }

    @Override
    public boolean updateStatus(String deviceCode, Integer status) {
        Device device = getByCode(deviceCode);
        if (device != null) {
            device.setDeviceStatus(DeviceStatus.values()[status]);
            return super.updateById(device);
        }
        return false;
    }
}
