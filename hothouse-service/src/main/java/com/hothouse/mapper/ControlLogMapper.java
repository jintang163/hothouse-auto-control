package com.hothouse.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.ControlLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ControlLogMapper extends BaseMapper<ControlLog> {

    @Select("SELECT * FROM t_control_log WHERE greenhouse_id = #{greenhouseId} " +
            "AND command_time BETWEEN #{startTime} AND #{endTime} " +
            "AND deleted = 0 ORDER BY command_time DESC")
    List<ControlLog> selectByTimeRange(@Param("greenhouseId") Long greenhouseId,
                                       @Param("startTime") LocalDateTime startTime,
                                       @Param("endTime") LocalDateTime endTime);

    @Select("SELECT * FROM t_control_log WHERE device_code = #{deviceCode} " +
            "AND deleted = 0 ORDER BY command_time DESC LIMIT #{limit}")
    List<ControlLog> selectRecentByDevice(@Param("deviceCode") String deviceCode, @Param("limit") Integer limit);

    @Select("SELECT * FROM t_control_log WHERE device_code = #{deviceCode} " +
            "AND command_time >= #{startTime} AND command_time < #{endTime} " +
            "AND deleted = 0 ORDER BY command_time")
    List<ControlLog> selectByDeviceAndTime(@Param("deviceCode") String deviceCode,
                                            @Param("startTime") LocalDateTime startTime,
                                            @Param("endTime") LocalDateTime endTime);
}
