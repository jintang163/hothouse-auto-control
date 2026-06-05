package com.hothouse.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.Alarm;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface AlarmMapper extends BaseMapper<Alarm> {

    @Select("SELECT * FROM t_alarm WHERE greenhouse_id = #{greenhouseId} " +
            "AND status = 0 AND deleted = 0 ORDER BY alarm_time DESC")
    List<Alarm> selectActiveAlarms(@Param("greenhouseId") Long greenhouseId);

    @Select("SELECT * FROM t_alarm WHERE greenhouse_id = #{greenhouseId} " +
            "AND alarm_time BETWEEN #{startTime} AND #{endTime} " +
            "AND deleted = 0 ORDER BY alarm_time DESC")
    List<Alarm> selectByTimeRange(@Param("greenhouseId") Long greenhouseId,
                                  @Param("startTime") LocalDateTime startTime,
                                  @Param("endTime") LocalDateTime endTime);
}
