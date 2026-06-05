package com.hothouse.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hothouse.common.entity.DeviceLedger;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface DeviceLedgerMapper extends BaseMapper<DeviceLedger> {

    @Select("SELECT * FROM t_device_ledger WHERE device_code = #{deviceCode} AND deleted = 0")
    DeviceLedger selectByDeviceCode(@Param("deviceCode") String deviceCode);

    @Update("UPDATE t_device_ledger SET total_run_hours = total_run_hours + #{hours}, start_stop_count = start_stop_count + #{count}, update_time = NOW() WHERE device_code = #{deviceCode}")
    int addRunHours(@Param("deviceCode") String deviceCode, @Param("hours") BigDecimal hours, @Param("count") Integer count);

    @Update("UPDATE t_device_ledger SET last_start_time = #{time}, update_time = NOW() WHERE device_code = #{deviceCode}")
    int updateLastStartTime(@Param("deviceCode") String deviceCode, @Param("time") LocalDateTime time);

    @Update("UPDATE t_device_ledger SET last_stop_time = #{time}, update_time = NOW() WHERE device_code = #{deviceCode}")
    int updateLastStopTime(@Param("deviceCode") String deviceCode, @Param("time") LocalDateTime time);

    @Select("SELECT device_type as deviceType, COUNT(*) as count, SUM(total_run_hours) as totalHours FROM t_device_ledger WHERE deleted = 0 GROUP BY device_type")
    List<Map<String, Object>> selectDeviceTypeStats();

    @Select("SELECT * FROM t_device_ledger WHERE maintenance_status != 0 AND deleted = 0 ORDER BY maintenance_status DESC, total_run_hours DESC")
    List<DeviceLedger> selectNeedMaintenance();

    @Update("UPDATE t_device_ledger SET last_maintenance_hours = total_run_hours, next_maintenance_hours = total_run_hours + #{cycleHours}, maintenance_status = 0, update_time = NOW() WHERE device_code = #{deviceCode}")
    int updateAfterMaintenance(@Param("deviceCode") String deviceCode, @Param("cycleHours") Integer cycleHours);
}
