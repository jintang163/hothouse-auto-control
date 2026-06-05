-- =========================================================
-- 农事智能管控模块 - 数据库脚本
-- =========================================================

USE hothouse;

-- =========================================================
-- 11. 作物品种表
-- =========================================================
DROP TABLE IF EXISTS t_crop_variety;
CREATE TABLE t_crop_variety (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    crop_name VARCHAR(100) NOT NULL COMMENT '作物名称',
    variety_name VARCHAR(100) NOT NULL COMMENT '品种名称',
    variety_code VARCHAR(50) NOT NULL UNIQUE COMMENT '品种编码',
    crop_type VARCHAR(50) COMMENT '作物分类 蔬菜/水果/花卉',
    growth_cycle_days INT COMMENT '生育周期(天)',
    suitable_temp_min DECIMAL(5,2) COMMENT '适宜温度下限',
    suitable_temp_max DECIMAL(5,2) COMMENT '适宜温度上限',
    suitable_humidity_min DECIMAL(5,2) COMMENT '适宜湿度下限',
    suitable_humidity_max DECIMAL(5,2) COMMENT '适宜湿度上限',
    description TEXT COMMENT '品种描述',
    cultivation_points TEXT COMMENT '栽培要点',
    status TINYINT DEFAULT 1 COMMENT '状态 0-停用 1-启用',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_crop_type (crop_type),
    INDEX idx_variety_code (variety_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作物品种表';

-- =========================================================
-- 12. 生育期配置表
-- =========================================================
DROP TABLE IF EXISTS t_growth_stage;
CREATE TABLE t_growth_stage (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    variety_id BIGINT NOT NULL COMMENT '品种ID',
    stage_name VARCHAR(50) NOT NULL COMMENT '生育期名称',
    stage_code VARCHAR(50) NOT NULL COMMENT '生育期编码',
    stage_order INT NOT NULL COMMENT '排序',
    duration_days INT COMMENT '持续天数',
    description TEXT COMMENT '生育期描述',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_variety_id (variety_id),
    UNIQUE KEY uk_variety_stage (variety_id, stage_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生育期配置表';

-- =========================================================
-- 13. 农事处方主表
-- =========================================================
DROP TABLE IF EXISTS t_farming_prescription;
CREATE TABLE t_farming_prescription (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    prescription_code VARCHAR(50) NOT NULL UNIQUE COMMENT '处方编码',
    prescription_name VARCHAR(100) NOT NULL COMMENT '处方名称',
    variety_id BIGINT NOT NULL COMMENT '品种ID',
    stage_id BIGINT NOT NULL COMMENT '生育期ID',
    greenhouse_id BIGINT COMMENT '适用大棚ID',
    version INT DEFAULT 1 COMMENT '当前版本号',
    parent_id BIGINT COMMENT '父版本ID',
    status TINYINT DEFAULT 0 COMMENT '状态 0-草稿 1-已发布 2-已归档',
    creator VARCHAR(50) COMMENT '创建人',
    description TEXT COMMENT '处方描述',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_variety_id (variety_id),
    INDEX idx_stage_id (stage_id),
    INDEX idx_greenhouse_id (greenhouse_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='农事处方主表';

-- =========================================================
-- 14. 处方环境指标表
-- =========================================================
DROP TABLE IF EXISTS t_prescription_env_target;
CREATE TABLE t_prescription_env_target (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    prescription_id BIGINT NOT NULL COMMENT '处方ID',
    param_type VARCHAR(50) NOT NULL COMMENT '参数类型 TEMP-温度 HUMIDITY-湿度 CO2-CO2浓度 LIGHT-光照 SOIL_MOISTURE-土壤湿度 SOIL_TEMP-土壤温度',
    target_min DECIMAL(10,2) COMMENT '目标最小值',
    target_max DECIMAL(10,2) COMMENT '目标最大值',
    target_value DECIMAL(10,2) COMMENT '目标最优值',
    tolerance_threshold DECIMAL(10,2) COMMENT '容差阈值',
    unit VARCHAR(20) COMMENT '单位',
    priority INT DEFAULT 0 COMMENT '优先级',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_prescription_id (prescription_id),
    UNIQUE KEY uk_prescription_param (prescription_id, param_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='处方环境指标表';

-- =========================================================
-- 15. 处方水肥配置表
-- =========================================================
DROP TABLE IF EXISTS t_prescription_fertigation;
CREATE TABLE t_prescription_fertigation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    prescription_id BIGINT NOT NULL COMMENT '处方ID',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型 IRRIGATION-灌溉 FERTILIZATION-施肥 FOLIAR_FERT-叶面肥',
    fertilizer_type VARCHAR(50) COMMENT '肥料类型',
    fertilizer_name VARCHAR(100) COMMENT '肥料名称',
    dosage DECIMAL(10,2) COMMENT '用量',
    dosage_unit VARCHAR(20) COMMENT '用量单位',
    water_amount DECIMAL(10,2) COMMENT '水量(L)',
    ph_target DECIMAL(5,2) COMMENT '目标PH值',
    ec_target DECIMAL(10,2) COMMENT '目标EC值',
    frequency_hours INT COMMENT '执行频率(小时)',
    trigger_condition TEXT COMMENT '触发条件(JSON)',
    device_codes TEXT COMMENT '关联设备编号(逗号分隔)',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_prescription_id (prescription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='处方水肥配置表';

-- =========================================================
-- 16. 处方农事操作表
-- =========================================================
DROP TABLE IF EXISTS t_prescription_operation;
CREATE TABLE t_prescription_operation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    prescription_id BIGINT NOT NULL COMMENT '处方ID',
    operation_name VARCHAR(100) NOT NULL COMMENT '操作名称',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型 PRUNING-整枝打杈 POLLINATION-授粉 HARVEST-采收 SPRAYING-喷药 OTHER-其他',
    operation_content TEXT COMMENT '操作内容',
    frequency_hours INT COMMENT '执行频率(小时)',
    standard_duration INT COMMENT '标准耗时(分钟)',
    worker_count INT COMMENT '需要人数',
    tools_required TEXT COMMENT '所需工具',
    safety_notes TEXT COMMENT '安全注意事项',
    device_codes TEXT COMMENT '关联设备编号',
    trigger_condition TEXT COMMENT '触发条件(JSON)',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_prescription_id (prescription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='处方农事操作表';

-- =========================================================
-- 17. 农事任务表
-- =========================================================
DROP TABLE IF EXISTS t_farming_task;
CREATE TABLE t_farming_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    task_code VARCHAR(50) NOT NULL UNIQUE COMMENT '任务编码',
    task_name VARCHAR(200) NOT NULL COMMENT '任务名称',
    task_type VARCHAR(50) NOT NULL COMMENT '任务类型 ENV_ADJUST-环境调节 FERTIGATION-水肥 OPERATION-农事操作',
    greenhouse_id BIGINT NOT NULL COMMENT '大棚ID',
    prescription_id BIGINT COMMENT '关联处方ID',
    operation_id BIGINT COMMENT '关联操作ID',
    trigger_source VARCHAR(50) NOT NULL COMMENT '触发来源 AUTO_THRESHOLD-阈值触发 AUTO_TIMED-定时触发 MANUAL-人工创建',
    trigger_reason TEXT COMMENT '触发原因',
    executor VARCHAR(50) COMMENT '执行人',
    execution_method VARCHAR(50) COMMENT '执行方式 DEVICE-设备联动 MANUAL-人工执行',
    device_codes TEXT COMMENT '设备编号(逗号分隔)',
    status TINYINT DEFAULT 0 COMMENT '状态 0-待执行 1-执行中 2-已完成 3-已取消 4-执行失败',
    priority TINYINT DEFAULT 1 COMMENT '优先级 1-低 2-中 3-高 4-紧急',
    plan_start_time DATETIME COMMENT '计划开始时间',
    plan_end_time DATETIME COMMENT '计划结束时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际结束时间',
    actual_duration INT COMMENT '实际耗时(分钟)',
    actual_usage DECIMAL(10,2) COMMENT '实际用量',
    usage_unit VARCHAR(20) COMMENT '用量单位',
    feedback_content TEXT COMMENT '执行反馈',
    deviation_value DECIMAL(10,2) COMMENT '偏差值',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_greenhouse_id (greenhouse_id),
    INDEX idx_prescription_id (prescription_id),
    INDEX idx_status (status),
    INDEX idx_plan_time (plan_start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='农事任务表';

-- =========================================================
-- 18. 农事日志表
-- =========================================================
DROP TABLE IF EXISTS t_farming_log;
CREATE TABLE t_farming_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    log_code VARCHAR(50) NOT NULL UNIQUE COMMENT '日志编码',
    greenhouse_id BIGINT NOT NULL COMMENT '大棚ID',
    task_id BIGINT COMMENT '关联任务ID',
    prescription_id BIGINT COMMENT '关联处方ID',
    variety_id BIGINT COMMENT '品种ID',
    stage_id BIGINT COMMENT '生育期ID',
    log_type VARCHAR(50) NOT NULL COMMENT '日志类型 TASK-任务日志 ENV-环境日志 OPERATION-操作日志 YIELD-产量日志',
    log_content TEXT NOT NULL COMMENT '日志内容',
    operator VARCHAR(50) COMMENT '操作人',
    operation_time DATETIME NOT NULL COMMENT '操作时间',
    weather_data TEXT COMMENT '天气数据(JSON)',
    env_data TEXT COMMENT '环境数据(JSON)',
    images TEXT COMMENT '图片URL(逗号分隔)',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_greenhouse_id (greenhouse_id),
    INDEX idx_task_id (task_id),
    INDEX idx_operation_time (operation_time),
    INDEX idx_variety_stage (variety_id, stage_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='农事日志表';

-- =========================================================
-- 19. 产量记录表
-- =========================================================
DROP TABLE IF EXISTS t_yield_record;
CREATE TABLE t_yield_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    record_code VARCHAR(50) NOT NULL UNIQUE COMMENT '记录编码',
    greenhouse_id BIGINT NOT NULL COMMENT '大棚ID',
    variety_id BIGINT NOT NULL COMMENT '品种ID',
    stage_id BIGINT COMMENT '生育期ID',
    harvest_date DATE NOT NULL COMMENT '采收日期',
    yield_quantity DECIMAL(10,2) NOT NULL COMMENT '产量(kg)',
    yield_unit VARCHAR(20) DEFAULT 'kg' COMMENT '产量单位',
    quality_level TINYINT COMMENT '品质等级 1-特级 2-一级 3-二级 4-三级',
    average_weight DECIMAL(10,2) COMMENT '平均单重(g)',
    commodity_rate DECIMAL(5,2) COMMENT '商品率(%)',
    harvest_workers INT COMMENT '采收人数',
    harvest_duration INT COMMENT '采收耗时(分钟)',
    weather VARCHAR(100) COMMENT '天气情况',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_greenhouse_id (greenhouse_id),
    INDEX idx_variety_id (variety_id),
    INDEX idx_harvest_date (harvest_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产量记录表';

-- =========================================================
-- 20. 病虫害知识库表
-- =========================================================
DROP TABLE IF EXISTS t_pest_disease;
CREATE TABLE t_pest_disease (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    pest_code VARCHAR(50) NOT NULL UNIQUE COMMENT '病虫害编码',
    pest_name VARCHAR(100) NOT NULL COMMENT '病虫害名称',
    pest_type VARCHAR(50) NOT NULL COMMENT '类型 PEST-虫害 DISEASE-病害',
    scientific_name VARCHAR(200) COMMENT '学名',
    alias_names VARCHAR(500) COMMENT '别名(逗号分隔)',
    susceptible_crops TEXT COMMENT '易感作物(逗号分隔)',
    symptom_description TEXT COMMENT '症状描述',
    damage_symptom TEXT COMMENT '危害特征',
    occurrence_condition TEXT COMMENT '发生条件',
    occurrence_period VARCHAR(200) COMMENT '发生时期',
    image_urls TEXT COMMENT '图谱图片URL(逗号分隔)',
    prevention_methods TEXT COMMENT '防治方法(JSON)',
    control_agents TEXT COMMENT '防治药剂(JSON)',
    biological_control TEXT COMMENT '生物防治',
    agricultural_control TEXT COMMENT '农业防治',
    physical_control TEXT COMMENT '物理防治',
    severity_level TINYINT DEFAULT 2 COMMENT '严重程度 1-轻微 2-中等 3-严重',
    status TINYINT DEFAULT 1 COMMENT '状态 0-停用 1-启用',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_pest_type (pest_type),
    INDEX idx_pest_code (pest_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='病虫害知识库表';

-- =========================================================
-- 21. 病虫害识别记录表
-- =========================================================
DROP TABLE IF EXISTS t_pest_identification;
CREATE TABLE t_pest_identification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    identify_code VARCHAR(50) NOT NULL UNIQUE COMMENT '识别编码',
    greenhouse_id BIGINT COMMENT '大棚ID',
    variety_id BIGINT COMMENT '品种ID',
    image_url VARCHAR(500) NOT NULL COMMENT '图片URL',
    identify_method VARCHAR(50) NOT NULL COMMENT '识别方式 AI-智能识别 MANUAL-人工判定',
    pest_id BIGINT COMMENT '识别结果病虫害ID',
    pest_name VARCHAR(100) COMMENT '识别结果名称',
    confidence DECIMAL(5,2) COMMENT '置信度(%)',
    identify_result TEXT COMMENT '识别详细结果(JSON)',
    damage_level TINYINT COMMENT '危害程度 1-轻微 2-中等 3-严重',
    affected_area DECIMAL(10,2) COMMENT '受害面积(平方米)',
    suggestion TEXT COMMENT '处置建议',
    handler VARCHAR(50) COMMENT '处理人',
    handle_status TINYINT DEFAULT 0 COMMENT '处理状态 0-未处理 1-处理中 2-已处理',
    handle_result TEXT COMMENT '处理结果',
    handle_time DATETIME COMMENT '处理时间',
    identify_time DATETIME NOT NULL COMMENT '识别时间',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_greenhouse_id (greenhouse_id),
    INDEX idx_pest_id (pest_id),
    INDEX idx_identify_time (identify_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='病虫害识别记录表';

-- =========================================================
-- 22. 种植批次表
-- =========================================================
DROP TABLE IF EXISTS t_planting_batch;
CREATE TABLE t_planting_batch (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    batch_code VARCHAR(50) NOT NULL UNIQUE COMMENT '批次编码',
    batch_name VARCHAR(100) NOT NULL COMMENT '批次名称',
    greenhouse_id BIGINT NOT NULL COMMENT '大棚ID',
    variety_id BIGINT NOT NULL COMMENT '品种ID',
    current_stage_id BIGINT COMMENT '当前生育期ID',
    plant_date DATE NOT NULL COMMENT '定植日期',
    expected_harvest_date DATE COMMENT '预计采收日期',
    actual_harvest_date DATE COMMENT '实际采收日期',
    planting_density INT COMMENT '种植密度(株/亩)',
    seed_source VARCHAR(200) COMMENT '种苗来源',
    status TINYINT DEFAULT 1 COMMENT '状态 0-已结束 1-种植中',
    total_yield DECIMAL(10,2) COMMENT '累计产量(kg)',
    total_cost DECIMAL(10,2) COMMENT '累计成本(元)',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_greenhouse_id (greenhouse_id),
    INDEX idx_variety_id (variety_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='种植批次表';

-- =========================================================
-- 初始化数据
-- =========================================================

-- 作物品种数据
INSERT INTO t_crop_variety (crop_name, variety_name, variety_code, crop_type, growth_cycle_days, 
    suitable_temp_min, suitable_temp_max, suitable_humidity_min, suitable_humidity_max, 
    description, cultivation_points, status, create_time, update_time) VALUES
('番茄', '粉丽人', 'TOMATO-001', '蔬菜', 120, 15.00, 30.00, 40.00, 85.00, 
 '早熟粉果番茄，抗逆性强，果实商品性好', 
 '1. 基肥充足 2. 及时整枝打杈 3. 花期注意温度控制 4. 合理水肥管理', 
 1, NOW(), NOW()),
('番茄', '红圣女', 'TOMATO-002', '蔬菜', 110, 16.00, 32.00, 45.00, 90.00, 
 '中熟红果番茄，耐储运，产量高', 
 '1. 起垄栽培 2. 地膜覆盖 3. 适时点花 4. 病虫害早防', 
 1, NOW(), NOW()),
('黄瓜', '绿箭一号', 'CUCUMBER-001', '蔬菜', 90, 18.00, 32.00, 50.00, 95.00, 
 '密刺黄瓜，生长势强，瓜条顺直', 
 '1. 高畦栽培 2. 及时搭架 3. 小水勤浇 4. 叶面追肥', 
 1, NOW(), NOW()),
('草莓', '红颜', 'STRAWBERRY-001', '水果', 150, 10.00, 28.00, 55.00, 85.00, 
 '优质草莓品种，甜度高，香气浓', 
 '1. 起垄栽培 2. 地膜覆盖 3. 蜜蜂授粉 4. 合理控温', 
 1, NOW(), NOW()),
('草莓', '章姬', 'STRAWBERRY-002', '水果', 145, 12.00, 26.00, 60.00, 80.00, 
 '奶油草莓，风味独特，市场价值高', 
 '1. 土壤消毒 2. 合理密植 3. 及时摘叶 4. 蜜蜂授粉', 
 1, NOW(), NOW());

-- 生育期配置 - 番茄
INSERT INTO t_growth_stage (variety_id, stage_name, stage_code, stage_order, duration_days, description, create_time, update_time) VALUES
(1, '苗期', 'SEEDLING', 1, 25, '从播种到定植前，培育壮苗', NOW(), NOW()),
(1, '定植缓苗期', 'TRANSPLANT', 2, 7, '定植后缓苗阶段', NOW(), NOW()),
(1, '开花坐果期', 'FLOWERING', 3, 30, '初花到第一穗果坐住', NOW(), NOW()),
(1, '果实膨大期', 'FRUIT_EXPAND', 4, 35, '果实迅速膨大阶段', NOW(), NOW()),
(1, '成熟期', 'RIPENING', 5, 23, '果实转色成熟采收期', NOW(), NOW());

-- 生育期配置 - 黄瓜
INSERT INTO t_growth_stage (variety_id, stage_name, stage_code, stage_order, duration_days, description, create_time, update_time) VALUES
(3, '苗期', 'SEEDLING', 1, 20, '育苗期', NOW(), NOW()),
(3, '初花期', 'FLOWERING', 2, 15, '开始开花', NOW(), NOW()),
(3, '结瓜初期', 'FRUIT_EARLY', 3, 20, '开始结瓜', NOW(), NOW()),
(3, '盛瓜期', 'FRUIT_FULL', 4, 25, '大量结瓜期', NOW(), NOW()),
(3, '结瓜后期', 'FRUIT_LATE', 5, 10, '后期采收', NOW(), NOW());

-- 生育期配置 - 草莓
INSERT INTO t_growth_stage (variety_id, stage_name, stage_code, stage_order, duration_days, description, create_time, update_time) VALUES
(4, '定植缓苗期', 'TRANSPLANT', 1, 15, '定植后缓苗', NOW(), NOW()),
(4, '营养生长期', 'VEGETATIVE', 2, 30, '茎叶生长', NOW(), NOW()),
(4, '花芽分化期', 'BUD_DIFF', 3, 25, '花芽分化', NOW(), NOW()),
(4, '开花期', 'FLOWERING', 4, 20, '开花授粉', NOW(), NOW()),
(4, '果实膨大期', 'FRUIT_EXPAND', 5, 30, '果实膨大', NOW(), NOW()),
(4, '成熟期', 'RIPENING', 6, 30, '成熟采收', NOW(), NOW());

-- 种植批次数据
INSERT INTO t_planting_batch (batch_code, batch_name, greenhouse_id, variety_id, current_stage_id, 
    plant_date, expected_harvest_date, planting_density, seed_source, status, 
    total_yield, total_cost, create_time, update_time) VALUES
('BATCH-GH001-001', '1号棚-番茄-2024春茬', 1, 1, 4, 
 '2024-02-15', '2024-06-15', 2200, 'XX种苗公司', 1, 
 15000.00, 8500.00, NOW(), NOW()),
('BATCH-GH002-001', '2号棚-黄瓜-2024秋茬', 2, 3, 4, 
 '2024-03-01', '2024-06-01', 1800, 'YY种苗公司', 1, 
 12000.00, 6500.00, NOW(), NOW()),
('BATCH-GH003-001', '3号棚-草莓-2024冬茬', 3, 4, 6, 
 '2024-09-01', '2025-02-28', 8000, 'ZZ种苗公司', 1, 
 3500.00, 12000.00, NOW(), NOW());

-- 处方数据 - 番茄果实膨大期
INSERT INTO t_farming_prescription (prescription_code, prescription_name, variety_id, stage_id, 
    greenhouse_id, version, parent_id, status, creator, description, create_time, update_time) VALUES
('PRE-TOMATO-EXPAND-001', '番茄果实膨大期标准处方', 1, 4, 
 1, 1, NULL, 1, '系统管理员', '番茄果实膨大期环境控制与农事操作标准处方', NOW(), NOW());

-- 处方环境指标
INSERT INTO t_prescription_env_target (prescription_id, param_type, target_min, target_max, 
    target_value, tolerance_threshold, unit, priority, create_time, update_time) VALUES
(1, 'TEMP', 20.00, 28.00, 24.00, 2.00, '℃', 1, NOW(), NOW()),
(1, 'HUMIDITY', 50.00, 75.00, 65.00, 5.00, '%', 2, NOW(), NOW()),
(1, 'CO2', 800.00, 1200.00, 1000.00, 100.00, 'ppm', 3, NOW(), NOW()),
(1, 'LIGHT', 30000.00, 60000.00, 45000.00, 5000.00, 'lux', 4, NOW(), NOW()),
(1, 'SOIL_MOISTURE', 60.00, 80.00, 70.00, 5.00, '%', 2, NOW(), NOW()),
(1, 'SOIL_TEMP', 18.00, 24.00, 20.00, 1.00, '℃', 3, NOW(), NOW());

-- 处方水肥配置
INSERT INTO t_prescription_fertigation (prescription_id, operation_type, fertilizer_type, 
    fertilizer_name, dosage, dosage_unit, water_amount, ph_target, ec_target, 
    frequency_hours, device_codes, create_time, update_time) VALUES
(1, 'IRRIGATION', NULL, NULL, NULL, NULL, 500.00, 6.0, 1.8, 72, 'IRR001,IRR002', NOW(), NOW()),
(1, 'FERTILIZATION', '水溶肥', '高钾型水溶肥(NPK 15-5-30)', 5.00, 'kg', 500.00, 5.8, 2.0, 72, 'IRR001,IRR002,FERT001', NOW(), NOW()),
(1, 'FOLIAR_FERT', '叶面肥', '磷酸二氢钾+硼肥', 0.50, 'kg', 200.00, 6.5, NULL, 168, NULL, NOW(), NOW());

-- 处方农事操作
INSERT INTO t_prescription_operation (prescription_id, operation_name, operation_type, 
    operation_content, frequency_hours, standard_duration, worker_count, 
    tools_required, safety_notes, trigger_condition, create_time, update_time) VALUES
(1, '整枝打杈', 'PRUNING', 
 '1. 摘除侧枝 2. 疏花疏果 3. 摘除老叶病叶 4. 绑蔓上架', 
 48, 60, 2, '修枝剪、手套、绑蔓绳', '注意防止病害传播，工具消毒', NULL, NOW(), NOW()),
(1, '熊蜂授粉', 'POLLINATION', 
 '1. 检查熊蜂活动 2. 维持蜂箱温度 3. 补充糖水 4. 避免农药使用', 
 24, 15, 1, '防护服、糖水', '注意蜂蜇，开花期禁用杀虫剂', '{"temperature_min":15}', NOW(), NOW()),
(1, '采收成熟果', 'HARVEST', 
 '1. 挑选成熟度适中果实 2. 带果柄采收 3. 轻拿轻放 4. 分级包装', 
 24, 120, 3, '采收篮、剪刀、手套', '避免机械损伤', '{"fruit_ripeness":"80%"}', NOW(), NOW()),
(1, '病虫害巡查', 'SPRAYING', 
 '1. 巡查病虫害 2. 摘除病叶病果 3. 必要时喷药防治 4. 做好记录', 
 72, 45, 2, '喷雾器、防护服、放大镜', '注意农药安全间隔期', NULL, NOW(), NOW());

-- 处方数据 - 黄瓜盛瓜期
INSERT INTO t_farming_prescription (prescription_code, prescription_name, variety_id, stage_id, 
    greenhouse_id, version, parent_id, status, creator, description, create_time, update_time) VALUES
('PRE-CUCUMBER-FULL-001', '黄瓜盛瓜期标准处方', 3, 4, 
 2, 1, NULL, 1, '系统管理员', '黄瓜盛瓜期水肥管理与环境控制处方', NOW(), NOW());

-- 处方环境指标 - 黄瓜
INSERT INTO t_prescription_env_target (prescription_id, param_type, target_min, target_max, 
    target_value, tolerance_threshold, unit, priority, create_time, update_time) VALUES
(2, 'TEMP', 22.00, 32.00, 26.00, 2.00, '℃', 1, NOW(), NOW()),
(2, 'HUMIDITY', 60.00, 90.00, 75.00, 5.00, '%', 2, NOW(), NOW()),
(2, 'SOIL_MOISTURE', 65.00, 85.00, 75.00, 5.00, '%', 2, NOW(), NOW());

-- 处方水肥配置 - 黄瓜
INSERT INTO t_prescription_fertigation (prescription_id, operation_type, fertilizer_type, 
    fertilizer_name, dosage, dosage_unit, water_amount, ph_target, ec_target, 
    frequency_hours, device_codes, create_time, update_time) VALUES
(2, 'IRRIGATION', NULL, NULL, NULL, NULL, 600.00, 6.0, 1.8, 48, 'IRR003,IRR004', NOW(), NOW()),
(2, 'FERTILIZATION', '水溶肥', '平衡型水溶肥(NPK 20-20-20)', 6.00, 'kg', 600.00, 5.8, 2.2, 48, 'IRR003,IRR004,FERT002', NOW(), NOW());

-- 处方操作 - 黄瓜
INSERT INTO t_prescription_operation (prescription_id, operation_name, operation_type, 
    operation_content, frequency_hours, standard_duration, worker_count, 
    tools_required, safety_notes, create_time, update_time) VALUES
(2, '绑蔓整枝', 'PRUNING', '及时绑蔓，摘除卷须，摘除下部老叶', 72, 90, 2, '绑蔓绳、修枝剪', NULL, NOW(), NOW()),
(2, '采收', 'HARVEST', '采收商品瓜，避免漏采，保证瓜条顺直', 24, 180, 4, '采收篮', '轻拿轻放', NOW(), NOW());

-- 处方数据 - 草莓成熟期
INSERT INTO t_farming_prescription (prescription_code, prescription_name, variety_id, stage_id, 
    greenhouse_id, version, parent_id, status, creator, description, create_time, update_time) VALUES
('PRE-STRAWBERRY-RIPENING-001', '草莓成熟期标准处方', 4, 6, 
 3, 1, NULL, 1, '系统管理员', '草莓成熟期采摘与管理处方', NOW(), NOW());

-- 处方环境指标 - 草莓
INSERT INTO t_prescription_env_target (prescription_id, param_type, target_min, target_max, 
    target_value, tolerance_threshold, unit, priority, create_time, update_time) VALUES
(3, 'TEMP', 15.00, 24.00, 18.00, 2.00, '℃', 1, NOW(), NOW()),
(3, 'HUMIDITY', 60.00, 80.00, 70.00, 5.00, '%', 2, NOW(), NOW()),
(3, 'SOIL_MOISTURE', 55.00, 75.00, 65.00, 5.00, '%', 2, NOW(), NOW());

-- 处方水肥配置 - 草莓
INSERT INTO t_prescription_fertigation (prescription_id, operation_type, fertilizer_type, 
    fertilizer_name, dosage, dosage_unit, water_amount, ph_target, ec_target, 
    frequency_hours, device_codes, create_time, update_time) VALUES
(3, 'IRRIGATION', NULL, NULL, NULL, NULL, 300.00, 5.5, 1.5, 96, 'IRR005,IRR006', NOW(), NOW()),
(3, 'FERTILIZATION', '水溶肥', '高磷高钾型', 3.00, 'kg', 300.00, 5.5, 1.8, 96, 'IRR005,IRR006,FERT003', NOW(), NOW());

-- 处方操作 - 草莓
INSERT INTO t_prescription_operation (prescription_id, operation_name, operation_type, 
    operation_content, frequency_hours, standard_duration, worker_count, 
    tools_required, safety_notes, create_time, update_time) VALUES
(3, '采摘', 'HARVEST', '采摘八成熟果实，带果柄，分级放置', 24, 240, 5, '采收盒、手套', '轻拿轻放', NOW(), NOW()),
(3, '摘除老叶', 'PRUNING', '摘除老叶、病叶，改善通风透光', 168, 60, 2, '修枝剪', NULL, NOW(), NOW());

-- 模拟任务数据
INSERT INTO t_farming_task (task_code, task_name, task_type, greenhouse_id, prescription_id, 
    operation_id, trigger_source, trigger_reason, executor, execution_method, 
    status, priority, plan_start_time, create_time, update_time) VALUES
('TASK-20240601-001', '1号棚温度过高报警-开启风机', 'ENV_ADJUST', 1, 1, NULL, 
 'AUTO_THRESHOLD', '当前温度29.5℃，超过处方阈值28℃', '系统', 'DEVICE', 
 2, 3, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('TASK-20240601-002', '1号棚番茄水肥一体化', 'FERTIGATION', 1, 1, NULL, 
 'AUTO_TIMED', '按处方每72小时执行一次水肥', '系统', 'DEVICE', 
 0, 2, DATE_ADD(NOW(), INTERVAL 4 HOUR), NOW(), NOW()),
('TASK-20240601-003', '1号棚番茄整枝打杈', 'OPERATION', 1, 1, 1, 
 'AUTO_TIMED', '按处方每48小时执行整枝', '张师傅', 'MANUAL', 
 0, 2, DATE_ADD(NOW(), INTERVAL 8 HOUR), NOW(), NOW()),
('TASK-20240601-004', '2号棚黄瓜采收', 'OPERATION', 2, 2, 3, 
 'AUTO_TIMED', '每日采收成熟瓜', '李师傅', 'MANUAL', 
 1, 2, DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('TASK-20240601-005', '3号棚草莓采摘', 'OPERATION', 3, 3, 3, 
 'AUTO_TIMED', '每日采摘成熟果', '王师傅', 'MANUAL', 
 0, 2, DATE_ADD(NOW(), INTERVAL 2 HOUR), NOW(), NOW());

-- 产量记录数据
INSERT INTO t_yield_record (record_code, greenhouse_id, variety_id, stage_id, 
    harvest_date, yield_quantity, quality_level, average_weight, commodity_rate, 
    harvest_workers, harvest_duration, weather, remark, create_time, update_time) VALUES
('YIELD-GH001-20240601', 1, 1, 4, DATE_SUB(NOW(), INTERVAL 1 DAY), 258.50, 2, 180.00, 92.50, 3, 180, '晴', '果实品质良好', NOW(), NOW()),
('YIELD-GH001-20240531', 1, 1, 4, DATE_SUB(NOW(), INTERVAL 2 DAY), 265.00, 1, 185.00, 94.00, 3, 175, '晴', '特级果比例高', NOW(), NOW()),
('YIELD-GH001-20240530', 1, 1, 4, DATE_SUB(NOW(), INTERVAL 3 DAY), 242.00, 2, 175.00, 91.00, 3, 185, '多云', '正常', NOW(), NOW()),
('YIELD-GH002-20240601', 2, 3, 4, DATE_SUB(NOW(), INTERVAL 1 DAY), 420.00, 2, 150.00, 95.00, 4, 240, '晴', '瓜条顺直', NOW(), NOW()),
('YIELD-GH003-20240601', 3, 4, 6, DATE_SUB(NOW(), INTERVAL 1 DAY), 58.50, 1, 25.00, 90.00, 5, 300, '多云转晴', '草莓品质优良', NOW(), NOW());

-- 病虫害知识库数据
INSERT INTO t_pest_disease (pest_code, pest_name, pest_type, scientific_name, alias_names, 
    susceptible_crops, symptom_description, damage_symptom, occurrence_condition, 
    occurrence_period, prevention_methods, control_agents, biological_control, 
    agricultural_control, physical_control, severity_level, status, create_time, update_time) VALUES
('PEST-001', '白粉虱', 'PEST', 'Trialeurodes vaporariorum', '小白蛾、白蚊子', 
 '番茄,黄瓜,茄子,草莓', 
 '成虫和若虫群集在叶片背面，刺吸植物汁液，被害叶片褪绿、变黄、萎蔫，甚至全株枯死', 
 '分泌蜜露，引起煤污病，传播病毒病', 
 '温度25-30℃，相对湿度60-70%', 
 '全年均可发生，春秋季高发', 
 '[{"method":"物理防治","content":"设置黄板诱杀成虫"},{"method":"生物防治","content":"释放丽蚜小蜂"},{"method":"药剂防治","content":"使用吡虫啉、噻虫嗪等药剂"}]', 
 '[{"name":"吡虫啉","dosage":"10%可湿性粉剂2000倍液","interval":"7天"},{"name":"噻虫嗪","dosage":"25%水分散粒剂3000倍液","interval":"10天"}]', 
 '释放丽蚜小蜂、草蛉等天敌', 
 '1. 清洁田园 2. 培育无虫苗 3. 合理密植 4. 加强通风', 
 '黄板诱杀、防虫网隔离', 2, 1, NOW(), NOW()),
('PEST-002', '蚜虫', 'PEST', 'Aphis gossypii', '蜜虫、腻虫', 
 '番茄,黄瓜,西瓜,草莓', 
 '成蚜和若蚜群集在叶片背面、嫩茎、嫩梢上刺吸汁液，使叶片卷缩、变形', 
 '传播病毒病，分泌蜜露诱发煤污病', 
 '温度20-28℃，相对湿度60-75%', 
 '春末夏初和秋季', 
 '[{"method":"物理防治","content":"黄板诱杀"},{"method":"生物防治","content":"释放瓢虫、食蚜蝇"},{"method":"药剂防治","content":"吡虫啉、抗蚜威喷雾"}]', 
 '[{"name":"抗蚜威","dosage":"50%可湿性粉剂2000倍液","interval":"7天"},{"name":"溴氰菊酯","dosage":"2.5%乳油3000倍液","interval":"10天"}]', 
 '释放瓢虫、草蛉、食蚜蝇', 
 '1. 清除杂草 2. 合理布局 3. 保护天敌', 
 '黄板诱杀、银灰膜驱蚜', 2, 1, NOW(), NOW()),
('DISEASE-001', '灰霉病', 'DISEASE', 'Botrytis cinerea', '烂果病', 
 '番茄,黄瓜,草莓,葡萄', 
 '花、果、叶、茎均可发病，病部产生灰色霉层，果实腐烂', 
 '从花器侵入，向果实发展，造成大量烂果', 
 '温度18-25℃，相对湿度90%以上，通风不良', 
 '冬春季节，低温高湿易发病', 
 '[{"method":"农业防治","content":"控制温湿度，加强通风"},{"method":"物理防治","content":"高温闷棚"},{"method":"药剂防治","content":"腐霉利、异菌脲、嘧霉胺"}]', 
 '[{"name":"腐霉利","dosage":"50%可湿性粉剂1500倍液","interval":"7天"},{"name":"嘧霉胺","dosage":"40%悬浮剂1000倍液","interval":"10天"}]', 
 '喷施木霉菌、芽孢杆菌', 
 '1. 选用抗病品种 2. 合理密植 3. 及时清除病残体 4. 变温管理', 
 '高温闷棚、紫外线杀菌', 3, 1, NOW(), NOW()),
('DISEASE-002', '白粉病', 'DISEASE', 'Podosphaera xanthii', '白毛病', 
 '黄瓜,甜瓜,番茄,草莓', 
 '叶片正面或背面产生白色粉状霉斑，后期变灰白色，叶片枯黄', 
 '影响光合作用，导致植株早衰', 
 '温度20-25℃，相对湿度40-80%，干湿交替', 
 '春秋季高发', 
 '[{"method":"农业防治","content":"合理密植，增施磷钾肥"},{"method":"生物防治","content":"喷施武夷菌素"},{"method":"药剂防治","content":"戊唑醇、醚菌酯"}]', 
 '[{"name":"戊唑醇","dosage":"43%悬浮剂4000倍液","interval":"10天"},{"name":"醚菌酯","dosage":"50%水分散粒剂3000倍液","interval":"14天"}]', 
 '喷施武夷菌素、枯草芽孢杆菌', 
 '1. 选用抗病品种 2. 合理水肥 3. 及时整枝打杈', 
 '硫磺熏蒸', 2, 1, NOW(), NOW()),
('DISEASE-003', '霜霉病', 'DISEASE', 'Pseudoperonospora cubensis', '跑马干', 
 '黄瓜,甜瓜,西瓜', 
 '叶片出现水渍状斑点，后变为多角形黄色病斑，叶背长灰黑色霉层', 
 '发病迅速，短期内叶片枯死', 
 '温度15-24℃，相对湿度85%以上，结露时间长', 
 '春秋雨季', 
 '[{"method":"农业防治","content":"选用抗病品种，加强通风"},{"method":"物理防治","content":"高温闷棚"},{"method":"药剂防治","content":"霜脲锰锌、烯酰吗啉"}]', 
 '[{"name":"霜脲锰锌","dosage":"72%可湿性粉剂800倍液","interval":"7天"},{"name":"烯酰吗啉","dosage":"50%水分散粒剂2000倍液","interval":"10天"}]', 
 '喷施哈茨木霉菌', 
 '1. 选用抗病品种 2. 高畦栽培 3. 合理灌水 4. 及时整枝', 
 '高温闷棚、避雨栽培', 3, 1, NOW(), NOW()),
('PEST-003', '红蜘蛛', 'PEST', 'Tetranychus cinnabarinus', '朱砂叶螨', 
 '草莓,番茄,黄瓜,茄子', 
 '成螨、若螨群集在叶片背面刺吸汁液，叶片出现灰白色小点，严重时叶片枯黄', 
 '吐丝结网，影响光合作用', 
 '温度25-30℃，相对湿度50%以下，高温干燥', 
 '夏季高温季节', 
 '[{"method":"农业防治","content":"清除杂草，合理灌水"},{"method":"生物防治","content":"释放捕食螨"},{"method":"药剂防治","content":"阿维菌素、螺螨酯"}]', 
 '[{"name":"阿维菌素","dosage":"1.8%乳油3000倍液","interval":"7天"},{"name":"螺螨酯","dosage":"24%悬浮剂4000倍液","interval":"14天"}]', 
 '释放捕食螨、智利小植绥螨', 
 '1. 清除杂草 2. 合理密植 3. 保持适当湿度', 
 '高温闷棚', 2, 1, NOW(), NOW());

-- 农事日志数据
INSERT INTO t_farming_log (log_code, greenhouse_id, task_id, prescription_id, 
    variety_id, stage_id, log_type, log_content, operator, operation_time, 
    env_data, create_time, update_time) VALUES
('LOG-GH001-20240601-001', 1, 1, 1, 1, 4, 'TASK', 
 '温度过高自动触发，已开启风机降温，温度从29.5℃降至26.8℃', 
 '系统', DATE_SUB(NOW(), INTERVAL 1 HOUR), 
 '{"temperature":26.8,"humidity":65.0,"co2":950.0,"light":55000.0}', 
 DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('LOG-GH001-20240601-002', 1, NULL, 1, 1, 4, 'ENV', 
 '环境巡查：温度26.5℃，湿度64%，CO2 920ppm，光照58000lux，环境正常', 
 '张师傅', DATE_SUB(NOW(), INTERVAL 3 HOUR), 
 '{"temperature":26.5,"humidity":64.0,"co2":920.0,"light":58000.0}', 
 DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR)),
('LOG-GH001-20240601-003', 1, NULL, 1, 1, 4, 'OPERATION', 
 '完成整枝打杈：摘除侧枝8个，摘除老叶病叶12片，绑蔓30株', 
 '张师傅', DATE_SUB(NOW(), INTERVAL 5 HOUR), NULL, 
 DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR)),
('LOG-GH002-20240601-001', 2, 4, 2, 3, 4, 'TASK', 
 '采收黄瓜420kg，其中一级品399kg，商品率95%', 
 '李师傅', DATE_SUB(NOW(), INTERVAL 2 HOUR), NULL, 
 DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('LOG-GH003-20240601-001', 3, 5, 3, 4, 6, 'OPERATION', 
 '巡查发现少量红蜘蛛，已喷施阿维菌素防治', 
 '王师傅', DATE_SUB(NOW(), INTERVAL 6 HOUR), NULL, 
 DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR));

-- 病虫害识别记录
INSERT INTO t_pest_identification (identify_code, greenhouse_id, variety_id, image_url, 
    identify_method, pest_id, pest_name, confidence, damage_level, affected_area, 
    suggestion, handler, handle_status, identify_time, create_time, update_time) VALUES
('IDENT-20240601-001', 3, 4, '/images/pest/20240601/red_spider_001.jpg', 
 'AI', 6, '红蜘蛛', 92.50, 2, 50.00, 
 '建议喷施阿维菌素或螺螨酯，注意叶背喷施均匀，7天后复防', 
 '王师傅', 2, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
('IDENT-20240601-002', 1, 1, '/images/pest/20240601/white_fly_001.jpg', 
 'MANUAL', 1, '白粉虱', NULL, 1, 20.00, 
 '已设置黄板诱杀，加强通风，必要时喷施吡虫啉', 
 '张师傅', 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
('IDENT-20240530-001', 2, 3, '/images/pest/20240530/downy_mildew_001.jpg', 
 'AI', 5, '霜霉病', 88.00, 3, 100.00, 
 '立即喷施烯酰吗啉或霜脲锰锌，加强通风排湿，摘除病叶', 
 '李师傅', 2, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY));

COMMIT;
