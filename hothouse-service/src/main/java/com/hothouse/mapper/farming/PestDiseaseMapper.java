package com.hothouse.mapper.farming;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.farming.PestDisease;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface PestDiseaseMapper extends BaseMapper<PestDisease> {

    @Select("SELECT * FROM t_pest_disease WHERE pest_type = #{pestType} AND status = 1 AND deleted = 0 ORDER BY severity_level DESC")
    List<PestDisease> selectByPestType(@Param("pestType") String pestType);

    @Select("SELECT * FROM t_pest_disease WHERE susceptible_crops LIKE CONCAT('%', #{cropName}, '%') AND status = 1 AND deleted = 0 ORDER BY severity_level DESC")
    List<PestDisease> selectByCropName(@Param("cropName") String cropName);

    @Select("SELECT * FROM t_pest_disease WHERE status = 1 AND deleted = 0 ORDER BY severity_level DESC")
    List<PestDisease> selectAllActive();
}
