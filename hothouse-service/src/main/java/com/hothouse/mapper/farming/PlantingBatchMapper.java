package com.hothouse.mapper.farming;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.farming.PlantingBatch;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface PlantingBatchMapper extends BaseMapper<PlantingBatch> {

    @Select("SELECT * FROM t_planting_batch WHERE greenhouse_id = #{greenhouseId} AND status = 1 AND deleted = 0 ORDER BY create_time DESC LIMIT 1")
    PlantingBatch selectCurrentByGreenhouseId(@Param("greenhouseId") Long greenhouseId);

    @Select("SELECT * FROM t_planting_batch WHERE greenhouse_id = #{greenhouseId} AND deleted = 0 ORDER BY create_time DESC")
    List<PlantingBatch> selectByGreenhouseId(@Param("greenhouseId") Long greenhouseId);
}
