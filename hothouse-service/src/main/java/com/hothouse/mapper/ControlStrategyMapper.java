package com.hothouse.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.ControlStrategy;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ControlStrategyMapper extends BaseMapper<ControlStrategy> {

    @Select("SELECT * FROM t_control_strategy WHERE greenhouse_id = #{greenhouseId} " +
            "AND enabled = 1 AND deleted = 0 ORDER BY priority DESC")
    List<ControlStrategy> selectActiveByGreenhouseId(@Param("greenhouseId") Long greenhouseId);

    @Select("SELECT * FROM t_control_strategy WHERE greenhouse_id = #{greenhouseId} " +
            "AND control_mode = #{mode} AND enabled = 1 AND deleted = 0 " +
            "ORDER BY priority DESC LIMIT 1")
    ControlStrategy selectByMode(@Param("greenhouseId") Long greenhouseId, @Param("mode") Integer mode);
}
