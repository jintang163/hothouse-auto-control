package com.hothouse.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.FaultRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface FaultRecordMapper extends BaseMapper<FaultRecord> {

    @Select("SELECT device_type as deviceType, fault_type as faultType, COUNT(*) as count FROM t_fault_record WHERE fault_time >= #{startTime} AND fault_time < #{endTime} AND deleted = 0 GROUP BY device_type, fault_type")
    List<Map<String, Object>> selectFaultTypeStats(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    @Select("SELECT greenhouse_id as greenhouseId, COUNT(*) as count FROM t_fault_record WHERE fault_time >= #{startTime} AND fault_time < #{endTime} AND deleted = 0 GROUP BY greenhouse_id")
    List<Map<String, Object>> selectGreenhouseStats(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    @Select("SELECT DATE(fault_time) as date, COUNT(*) as count FROM t_fault_record WHERE fault_time >= #{startTime} AND fault_time < #{endTime} AND deleted = 0 GROUP BY DATE(fault_time) ORDER BY date")
    List<Map<String, Object>> selectDailyTrend(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    @Select("SELECT device_code as deviceCode, device_name as deviceName, COUNT(*) as count FROM t_fault_record WHERE fault_time >= #{startTime} AND fault_time < #{endTime} AND deleted = 0 GROUP BY device_code, device_name HAVING count >= 3 ORDER BY count DESC")
    List<Map<String, Object>> selectHighFrequencyFaults(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    @Select("SELECT * FROM t_fault_record WHERE device_code = #{deviceCode} AND deleted = 0 ORDER BY fault_time DESC LIMIT #{limit}")
    List<FaultRecord> selectByDeviceCode(@Param("deviceCode") String deviceCode, @Param("limit") Integer limit);
}
