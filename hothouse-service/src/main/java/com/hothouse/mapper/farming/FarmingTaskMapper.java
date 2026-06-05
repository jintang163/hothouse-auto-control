package com.hothouse.mapper.farming;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.farming.FarmingTask;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface FarmingTaskMapper extends BaseMapper<FarmingTask> {

    @Select("SELECT * FROM t_farming_task WHERE greenhouse_id = #{greenhouseId} AND deleted = 0 ORDER BY plan_start_time DESC")
    List<FarmingTask> selectByGreenhouseId(@Param("greenhouseId") Long greenhouseId);

    @Select("SELECT * FROM t_farming_task WHERE greenhouse_id = #{greenhouseId} AND status = #{status} AND deleted = 0 ORDER BY priority DESC, plan_start_time ASC")
    List<FarmingTask> selectByGreenhouseAndStatus(@Param("greenhouseId") Long greenhouseId, @Param("status") Integer status);

    @Select("SELECT * FROM t_farming_task WHERE executor = #{executor} AND status IN (0,1) AND deleted = 0 ORDER BY priority DESC, plan_start_time ASC")
    List<FarmingTask> selectPendingByExecutor(@Param("executor") String executor);

    @Select("SELECT MAX(task_code) FROM t_farming_task WHERE task_code LIKE #{prefix} || '%'")
    String selectMaxTaskCode(@Param("prefix") String prefix);

    @Select("SELECT * FROM t_farming_task WHERE prescription_id = #{prescriptionId} AND trigger_source = 'AUTO_TIMED' " +
            "AND plan_start_time >= #{startTime} AND deleted = 0 ORDER BY plan_start_time DESC LIMIT 1")
    FarmingTask selectLatestTimedTask(@Param("prescriptionId") Long prescriptionId, @Param("startTime") LocalDateTime startTime);

    @Select("SELECT * FROM t_farming_task WHERE greenhouse_id = #{greenhouseId} " +
            "AND prescription_id = #{prescriptionId} AND task_type = 'ENV_ADJUST' " +
            "AND trigger_source = 'AUTO_THRESHOLD' AND param_type = #{paramType} " +
            "AND status IN (0,1) AND deleted = 0 AND create_time >= #{startTime} " +
            "ORDER BY create_time DESC LIMIT 1")
    FarmingTask selectExistingEnvTask(@Param("greenhouseId") Long greenhouseId,
                                      @Param("prescriptionId") Long prescriptionId,
                                      @Param("paramType") String paramType,
                                      @Param("startTime") LocalDateTime startTime);
}
