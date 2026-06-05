package com.hothouse.mapper.farming;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.farming.PrescriptionOperation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface PrescriptionOperationMapper extends BaseMapper<PrescriptionOperation> {

    @Select("SELECT * FROM t_prescription_operation WHERE prescription_id = #{prescriptionId} AND deleted = 0 ORDER BY id")
    List<PrescriptionOperation> selectByPrescriptionId(@Param("prescriptionId") Long prescriptionId);
}
