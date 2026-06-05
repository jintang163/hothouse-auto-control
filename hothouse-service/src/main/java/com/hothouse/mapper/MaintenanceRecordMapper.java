package com.hothouse.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.MaintenanceRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface MaintenanceRecordMapper extends BaseMapper<MaintenanceRecord> {

    @Select("SELECT * FROM t_maintenance_record WHERE device_code = #{deviceCode} AND deleted = 0 ORDER BY maintenance_time DESC LIMIT #{limit}")
    List<MaintenanceRecord> selectByDeviceCode(@Param("deviceCode") String deviceCode, @Param("limit") Integer limit);

    @Select("SELECT DATE(maintenance_time) as date, COUNT(*) as count FROM t_maintenance_record WHERE maintenance_time >= #{startTime} AND maintenance_time < #{endTime} AND deleted = 0 GROUP BY DATE(maintenance_time) ORDER BY date")
    List<Map<String, Object>> selectDailyCount(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}
