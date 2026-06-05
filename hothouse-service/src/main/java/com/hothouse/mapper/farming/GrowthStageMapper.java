package com.hothouse.mapper.farming;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.farming.GrowthStage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface GrowthStageMapper extends BaseMapper<GrowthStage> {

    @Select("SELECT * FROM t_growth_stage WHERE variety_id = #{varietyId} AND deleted = 0 ORDER BY stage_order")
    List<GrowthStage> selectByVarietyId(@Param("varietyId") Long varietyId);
}
