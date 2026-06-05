package com.hothouse.common.entity.farming;

import com.baomidou.mybatisplus.annotation.TableName;
import com.hothouse.common.entity.BaseEntity;
import com.hothouse.common.enums.farming.LogType;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_farming_log")
public class FarmingLog extends BaseEntity {

    private static final long serialVersionUID = 1L;

    private String logCode;

    private Long greenhouseId;

    private Long taskId;

    private Long prescriptionId;

    private Long varietyId;

    private Long stageId;

    private LogType logType;

    private String logContent;

    private String operator;

    private LocalDateTime operationTime;

    private String weatherData;

    private String envData;

    private String images;

    private String remark;
}
