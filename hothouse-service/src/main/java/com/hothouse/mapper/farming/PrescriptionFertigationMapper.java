package com.hothouse.mapper.farming;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.farming.PrescriptionFertigation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface PrescriptionFertigationMapper extends BaseMapper<PrescriptionFertigation> {

    @Select("SELECT * FROM t_prescription_fertigation WHERE prescription_id = #{prescriptionId} AND deleted = 0 ORDER BY id")
    List<PrescriptionFertigation> selectByPrescriptionId(@Param("prescriptionId") Long prescriptionId);
}
