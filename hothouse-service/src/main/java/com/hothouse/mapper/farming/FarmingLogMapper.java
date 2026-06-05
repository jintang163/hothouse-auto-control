package com.hothouse.mapper.farming;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.farming.FarmingLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface FarmingLogMapper extends BaseMapper<FarmingLog> {

    @Select("SELECT * FROM t_farming_log WHERE greenhouse_id = #{greenhouseId} AND deleted = 0 ORDER BY operation_time DESC LIMIT #{limit}")
    List<FarmingLog> selectRecentByGreenhouseId(@Param("greenhouseId") Long greenhouseId, @Param("limit") Integer limit);

    @Select("SELECT * FROM t_farming_log WHERE greenhouse_id = #{greenhouseId} AND operation_time BETWEEN #{startTime} AND #{endTime} AND deleted = 0 ORDER BY operation_time DESC")
    List<FarmingLog> selectByTimeRange(@Param("greenhouseId") Long greenhouseId,
                                        @Param("startTime") LocalDateTime startTime,
                                        @Param("endTime") LocalDateTime endTime);

    @Select("SELECT * FROM t_farming_log WHERE task_id = #{taskId} AND deleted = 0 ORDER BY operation_time DESC")
    List<FarmingLog> selectByTaskId(@Param("taskId") Long taskId);
}
