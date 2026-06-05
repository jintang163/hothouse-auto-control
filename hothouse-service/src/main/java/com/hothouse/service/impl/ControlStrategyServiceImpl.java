package com.hothouse.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.entity.ControlStrategy;
import com.hothouse.common.enums.ControlMode;
import com.hothouse.mapper.ControlStrategyMapper;
import com.hothouse.service.ControlStrategyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ControlStrategyServiceImpl extends ServiceImpl<ControlStrategyMapper, ControlStrategy>
        implements ControlStrategyService {

    @Override
    public List<ControlStrategy> list() {
        return super.list();
    }

    @Override
    public ControlStrategy getById(Long id) {
        return super.getById(id);
    }

    @Override
    public List<ControlStrategy> getActiveByGreenhouseId(Long greenhouseId) {
        return baseMapper.selectActiveByGreenhouseId(greenhouseId);
    }

    @Override
    public ControlStrategy getByMode(Long greenhouseId, ControlMode mode) {
        return baseMapper.selectByMode(greenhouseId, mode.getCode());
    }

    @Override
    public boolean save(ControlStrategy strategy) {
        if (strategy.getEnabled() == null) {
            strategy.setEnabled(1);
        }
        return super.save(strategy);
    }

    @Override
    public boolean update(ControlStrategy strategy) {
        return super.updateById(strategy);
    }

    @Override
    public boolean delete(Long id) {
        return super.removeById(id);
    }

    @Override
    public boolean enable(Long id) {
        ControlStrategy strategy = getById(id);
        if (strategy != null) {
            strategy.setEnabled(1);
            return super.updateById(strategy);
        }
        return false;
    }

    @Override
    public boolean disable(Long id) {
        ControlStrategy strategy = getById(id);
        if (strategy != null) {
            strategy.setEnabled(0);
            return super.updateById(strategy);
        }
        return false;
    }
}
