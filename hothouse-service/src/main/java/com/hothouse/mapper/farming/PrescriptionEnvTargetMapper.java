package com.hothouse.mapper.farming;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.farming.PrescriptionEnvTarget;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface PrescriptionEnvTargetMapper extends BaseMapper<PrescriptionEnvTarget> {

    @Select("SELECT * FROM t_prescription_env_target WHERE prescription_id = #{prescriptionId} AND deleted = 0 ORDER BY priority")
    List<PrescriptionEnvTarget> selectByPrescriptionId(@Param("prescriptionId") Long prescriptionId);
}
