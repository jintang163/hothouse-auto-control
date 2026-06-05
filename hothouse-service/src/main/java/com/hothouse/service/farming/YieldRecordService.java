package com.hothouse.service.farming;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hothouse.common.entity.farming.YieldRecord;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface YieldRecordService extends IService<YieldRecord> {

    List<YieldRecord> listByGreenhouseId(Long greenhouseId);

    List<YieldRecord> listByDateRange(Long greenhouseId, LocalDate startDate, LocalDate endDate);

    BigDecimal getTotalYield(Long greenhouseId, Long varietyId, LocalDate startDate, LocalDate endDate);

    Map<String, Object> getYieldAnalysis(Long greenhouseId, Long varietyId);

    String generateRecordCode();
}
