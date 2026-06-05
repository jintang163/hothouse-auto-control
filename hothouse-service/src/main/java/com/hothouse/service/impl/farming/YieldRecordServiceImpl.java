package com.hothouse.service.impl.farming;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.entity.farming.YieldRecord;
import com.hothouse.common.enums.farming.QualityLevel;
import com.hothouse.mapper.farming.YieldRecordMapper;
import com.hothouse.service.farming.YieldRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class YieldRecordServiceImpl extends ServiceImpl<YieldRecordMapper, YieldRecord>
        implements YieldRecordService {

    private final YieldRecordMapper yieldRecordMapper;

    @Override
    public List<YieldRecord> listByGreenhouseId(Long greenhouseId) {
        return yieldRecordMapper.selectByGreenhouseId(greenhouseId);
    }

    @Override
    public List<YieldRecord> listByDateRange(Long greenhouseId, LocalDate startDate, LocalDate endDate) {
        return yieldRecordMapper.selectByDateRange(greenhouseId, startDate, endDate);
    }

    @Override
    public BigDecimal getTotalYield(Long greenhouseId, Long varietyId, LocalDate startDate, LocalDate endDate) {
        return yieldRecordMapper.selectTotalYield(greenhouseId, varietyId, startDate, endDate);
    }

    @Override
    public Map<String, Object> getYieldAnalysis(Long greenhouseId, Long varietyId) {
        LambdaQueryWrapper<YieldRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(YieldRecord::getGreenhouseId, greenhouseId);
        if (varietyId != null) {
            wrapper.eq(YieldRecord::getVarietyId, varietyId);
        }
        List<YieldRecord> records = list(wrapper);

        Map<String, Object> analysis = new LinkedHashMap<>();

        BigDecimal totalYield = BigDecimal.ZERO;
        BigDecimal maxYield = BigDecimal.ZERO;
        int count = 0;

        Map<String, BigDecimal> qualityDistribution = new LinkedHashMap<>();
        for (QualityLevel level : QualityLevel.values()) {
            qualityDistribution.put(level.getDesc(), BigDecimal.ZERO);
        }

        for (YieldRecord record : records) {
            BigDecimal yield = record.getYieldQuantity() != null ? record.getYieldQuantity() : BigDecimal.ZERO;
            totalYield = totalYield.add(yield);
            if (yield.compareTo(maxYield) > 0) {
                maxYield = yield;
            }
            count++;

            QualityLevel quality = record.getQualityLevel();
            if (quality != null) {
                qualityDistribution.merge(quality.getDesc(), yield, BigDecimal::add);
            }
        }

        BigDecimal averageYield = count > 0 ? totalYield.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        analysis.put("totalYield", totalYield);
        analysis.put("averageYield", averageYield);
        analysis.put("maxYield", maxYield);
        analysis.put("recordCount", count);
        analysis.put("qualityDistribution", qualityDistribution);

        return analysis;
    }

    @Override
    public String generateRecordCode() {
        return generateRecordCode(null);
    }

    private String generateRecordCode(Long greenhouseId) {
        String prefix = "YIELD";
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String ghPart = greenhouseId != null ? String.format("GH%03d", greenhouseId) : "GH000";

        LambdaQueryWrapper<YieldRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(YieldRecord::getRecordCode, prefix + "-" + ghPart + "-" + datePart + "-");
        wrapper.orderByDesc(YieldRecord::getRecordCode);
        wrapper.last("LIMIT 1");
        YieldRecord lastRecord = getOne(wrapper);

        int sequence = 1;
        if (lastRecord != null && lastRecord.getRecordCode() != null) {
            String[] parts = lastRecord.getRecordCode().split("-");
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
