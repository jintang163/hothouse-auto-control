package com.hothouse.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.Greenhouse;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface GreenhouseMapper extends BaseMapper<Greenhouse> {
}
