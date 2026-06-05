package com.hothouse.mapper.farming;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.farming.PestIdentification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface PestIdentificationMapper extends BaseMapper<PestIdentification> {

    @Select("SELECT * FROM t_pest_identification WHERE greenhouse_id = #{greenhouseId} AND deleted = 0 ORDER BY identify_time DESC LIMIT #{limit}")
    List<PestIdentification> selectRecentByGreenhouseId(@Param("greenhouseId") Long greenhouseId, @Param("limit") Integer limit);

    @Select("SELECT * FROM t_pest_identification WHERE greenhouse_id = #{greenhouseId} AND identify_time BETWEEN #{startTime} AND #{endTime} AND deleted = 0 ORDER BY identify_time DESC")
    List<PestIdentification> selectByTimeRange(@Param("greenhouseId") Long greenhouseId,
                                                @Param("startTime") LocalDateTime startTime,
                                                @Param("endTime") LocalDateTime endTime);

    @Select("SELECT * FROM t_pest_identification WHERE handle_status = #{handleStatus} AND deleted = 0 ORDER BY identify_time DESC")
    List<PestIdentification> selectByHandleStatus(@Param("handleStatus") Integer handleStatus);
}
