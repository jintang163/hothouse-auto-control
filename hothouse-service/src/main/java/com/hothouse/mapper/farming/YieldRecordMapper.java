package com.hothouse.mapper.farming;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.farming.YieldRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface YieldRecordMapper extends BaseMapper<YieldRecord> {

    @Select("SELECT * FROM t_yield_record WHERE greenhouse_id = #{greenhouseId} AND deleted = 0 ORDER BY harvest_date DESC")
    List<YieldRecord> selectByGreenhouseId(@Param("greenhouseId") Long greenhouseId);

    @Select("SELECT * FROM t_yield_record WHERE greenhouse_id = #{greenhouseId} AND harvest_date BETWEEN #{startDate} AND #{endDate} AND deleted = 0 ORDER BY harvest_date DESC")
    List<YieldRecord> selectByDateRange(@Param("greenhouseId") Long greenhouseId,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    @Select("SELECT SUM(yield_quantity) FROM t_yield_record WHERE greenhouse_id = #{greenhouseId} AND variety_id = #{varietyId} AND harvest_date BETWEEN #{startDate} AND #{endDate}")
    java.math.BigDecimal selectTotalYield(@Param("greenhouseId") Long greenhouseId,
                                          @Param("varietyId") Long varietyId,
                                          @Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);
}
