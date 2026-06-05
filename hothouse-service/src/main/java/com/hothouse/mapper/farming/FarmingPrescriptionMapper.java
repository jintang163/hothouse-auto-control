package com.hothouse.mapper.farming;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.farming.FarmingPrescription;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface FarmingPrescriptionMapper extends BaseMapper<FarmingPrescription> {

    @Select("SELECT * FROM t_farming_prescription WHERE greenhouse_id = #{greenhouseId} AND status = 1 AND deleted = 0 ORDER BY create_time DESC")
    List<FarmingPrescription> selectActiveByGreenhouseId(@Param("greenhouseId") Long greenhouseId);

    @Select("SELECT * FROM t_farming_prescription WHERE variety_id = #{varietyId} AND stage_id = #{stageId} AND status = 1 AND deleted = 0 ORDER BY create_time DESC LIMIT 1")
    FarmingPrescription selectLatestByVarietyAndStage(@Param("varietyId") Long varietyId, @Param("stageId") Long stageId);

    @Select("SELECT MAX(version) FROM t_farming_prescription WHERE prescription_code = #{prescriptionCode}")
    Integer selectMaxVersion(@Param("prescriptionCode") String prescriptionCode);
}
