package com.hothouse.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.MaintenancePlan;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface MaintenancePlanMapper extends BaseMapper<MaintenancePlan> {

    @Select("SELECT * FROM t_maintenance_plan WHERE device_type = #{deviceType} AND enabled = 1 AND deleted = 0 ORDER BY cycle_hours ASC")
    List<MaintenancePlan> selectByDeviceType(@Param("deviceType") Integer deviceType);
}
