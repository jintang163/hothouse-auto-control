package com.hothouse.service.impl.farming;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.entity.farming.FarmingLog;
import com.hothouse.common.enums.farming.LogType;
import com.hothouse.mapper.farming.FarmingLogMapper;
import com.hothouse.service.farming.FarmingLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmingLogServiceImpl extends ServiceImpl<FarmingLogMapper, FarmingLog>
        implements FarmingLogService {

    private final FarmingLogMapper farmingLogMapper;

    @Override
    public List<FarmingLog> listRecentByGreenhouseId(Long greenhouseId, Integer limit) {
        return farmingLogMapper.selectRecentByGreenhouseId(greenhouseId, limit);
    }

    @Override
    public List<FarmingLog> listByTimeRange(Long greenhouseId, LocalDateTime startTime, LocalDateTime endTime) {
        return farmingLogMapper.selectByTimeRange(greenhouseId, startTime, endTime);
    }

    @Override
    public List<FarmingLog> listByTaskId(Long taskId) {
        return farmingLogMapper.selectByTaskId(taskId);
    }

    @Override
    public boolean createLog(Long greenhouseId, Long taskId, Long prescriptionId,
                             Long varietyId, Long stageId, LogType logType,
                             String logContent, String operator, String envData, String remark) {
        FarmingLog log = new FarmingLog();
        log.setLogCode(generateLogCode(greenhouseId));
        log.setGreenhouseId(greenhouseId);
        log.setTaskId(taskId);
        log.setPrescriptionId(prescriptionId);
        log.setVarietyId(varietyId);
        log.setStageId(stageId);
        log.setLogType(logType);
        log.setLogContent(logContent);
        log.setOperator(operator);
        log.setOperationTime(LocalDateTime.now());
        log.setEnvData(envData);
        log.setRemark(remark);
        return super.save(log);
    }

    @Override
    public String generateLogCode() {
        return generateLogCode(null);
    }

    private String generateLogCode(Long greenhouseId) {
        String prefix = "LOG";
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String ghPart = greenhouseId != null ? String.format("GH%03d", greenhouseId) : "GH000";

        LambdaQueryWrapper<FarmingLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(FarmingLog::getLogCode, prefix + "-" + ghPart + "-" + datePart + "-");
        wrapper.orderByDesc(FarmingLog::getLogCode);
        wrapper.last("LIMIT 1");
        FarmingLog lastLog = getOne(wrapper);

        int sequence = 1;
        if (lastLog != null && lastLog.getLogCode() != null) {
            String[] parts = lastLog.getLogCode().split("-");
            if (parts.length == 4) {
                try {
                    sequence = Integer.parseInt(parts[3]) + 1;
                } catch (NumberFormatException e) {
                    sequence = 1;
                }
            }
        }

        return String.format("%s-%s-%s-%04d", prefix, ghPart, datePart, sequence);
    }
}
