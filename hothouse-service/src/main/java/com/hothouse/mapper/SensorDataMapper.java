package com.hothouse.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.SensorData;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface SensorDataMapper extends BaseMapper<SensorData> {

    @Select("SELECT * FROM t_sensor_data WHERE greenhouse_id = #{greenhouseId} " +
            "AND collect_time BETWEEN #{startTime} AND #{endTime} " +
            "ORDER BY collect_time DESC")
    List<SensorData> selectByTimeRange(@Param("greenhouseId") Long greenhouseId,
                                       @Param("startTime") LocalDateTime startTime,
                                       @Param("endTime") LocalDateTime endTime);

    @Select("SELECT * FROM t_sensor_data WHERE greenhouse_id = #{greenhouseId} " +
            "ORDER BY collect_time DESC LIMIT 1")
    SensorData selectLatest(@Param("greenhouseId") Long greenhouseId);
}
