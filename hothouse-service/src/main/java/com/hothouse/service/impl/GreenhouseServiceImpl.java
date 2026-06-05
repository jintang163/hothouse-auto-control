package com.hothouse.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.entity.Greenhouse;
import com.hothouse.mapper.GreenhouseMapper;
import com.hothouse.service.GreenhouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GreenhouseServiceImpl extends ServiceImpl<GreenhouseMapper, Greenhouse>
        implements GreenhouseService {

    @Override
    public List<Greenhouse> list() {
        return super.list();
    }

    @Override
    public Greenhouse getById(Long id) {
        return super.getById(id);
    }

    @Override
    public boolean save(Greenhouse greenhouse) {
        return super.save(greenhouse);
    }

    @Override
    public boolean update(Greenhouse greenhouse) {
        return super.updateById(greenhouse);
    }

    @Override
    public boolean delete(Long id) {
        return super.removeById(id);
    }
}
