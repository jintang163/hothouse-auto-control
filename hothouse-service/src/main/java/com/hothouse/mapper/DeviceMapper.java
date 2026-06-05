package com.hothouse.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.Device;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface DeviceMapper extends BaseMapper<Device> {

    @Select("SELECT * FROM t_device WHERE device_code = #{deviceCode} AND deleted = 0")
    Device selectByCode(@Param("deviceCode") String deviceCode);

    @Select("SELECT * FROM t_device WHERE greenhouse_id = #{greenhouseId} AND deleted = 0")
    List<Device> selectByGreenhouseId(@Param("greenhouseId") Long greenhouseId);

    @Select("SELECT * FROM t_device WHERE greenhouse_id = #{greenhouseId} AND device_type = #{deviceType} AND deleted = 0")
    List<Device> selectByType(@Param("greenhouseId") Long greenhouseId, @Param("deviceType") Integer deviceType);
}
