-- =========================================================
-- 温室大棚智能环控系统 - 数据库初始化脚本
-- =========================================================

CREATE DATABASE IF NOT EXISTS hothouse DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hothouse;

-- =========================================================
-- 1. 大棚表
-- =========================================================
DROP TABLE IF EXISTS t_greenhouse;
CREATE TABLE t_greenhouse (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '大棚名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '大棚编号',
    location VARCHAR(200) COMMENT '位置',
    area DECIMAL(10,2) COMMENT '面积(平方米)',
    crop_type VARCHAR(50) COMMENT '种植作物类型',
    description TEXT COMMENT '描述',
    status TINYINT DEFAULT 1 COMMENT '状态 0-停用 1-启用',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记 0-未删除 1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='大棚表';

-- =========================================================
-- 2. 设备表
-- =========================================================
DROP TABLE IF EXISTS t_device;
CREATE TABLE t_device (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    greenhouse_id BIGINT NOT NULL COMMENT '大棚ID',
    device_code VARCHAR(50) NOT NULL UNIQUE COMMENT '设备编号',
    device_name VARCHAR(100) NOT NULL COMMENT '设备名称',
    device_type TINYINT NOT NULL COMMENT '设备类型 1-风机 2-湿帘 3-遮阳网 10-温度传感器 11-湿度传感器 99-网关',
    device_status TINYINT DEFAULT 0 COMMENT '设备状态 0-离线 1-在线 2-运行中 3-故障',
    gateway_code VARCHAR(50) COMMENT '所属网关编号',
    zone VARCHAR(50) COMMENT '区域',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    running_status TINYINT DEFAULT 0 COMMENT '运行状态 0-停止 1-运行',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_greenhouse_id (greenhouse_id),
    INDEX idx_device_code (device_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备表';

-- =========================================================
-- 3. 传感器数据表
-- =========================================================
DROP TABLE IF EXISTS t_sensor_data;
CREATE TABLE t_sensor_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    greenhouse_id BIGINT NOT NULL COMMENT '大棚ID',
    device_code VARCHAR(50) NOT NULL COMMENT '设备编号',
    temperature DECIMAL(5,2) COMMENT '温度(℃)',
    humidity DECIMAL(5,2) COMMENT '湿度(%)',
    co2 DECIMAL(10,2) COMMENT 'CO2浓度(ppm)',
    light_intensity DECIMAL(10,2) COMMENT '光照强度(lux)',
    soil_moisture DECIMAL(5,2) COMMENT '土壤湿度(%)',
    soil_temperature DECIMAL(5,2) COMMENT '土壤温度(℃)',
    collect_time DATETIME NOT NULL COMMENT '采集时间',
    raw_data TEXT COMMENT '原始数据',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_greenhouse_time (greenhouse_id, collect_time),
    INDEX idx_collect_time (collect_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='传感器数据表';

-- =========================================================
-- 4. 控制策略表
-- =========================================================
DROP TABLE IF EXISTS t_control_strategy;
CREATE TABLE t_control_strategy (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    greenhouse_id BIGINT NOT NULL COMMENT '大棚ID',
    strategy_name VARCHAR(100) NOT NULL COMMENT '策略名称',
    crop_type VARCHAR(50) COMMENT '作物类型',
    control_mode TINYINT DEFAULT 1 COMMENT '控制模式 0-手动 1-自动 2-定时',
    temp_upper_limit DECIMAL(5,2) DEFAULT 30.00 COMMENT '温度上限(℃)',
    temp_lower_limit DECIMAL(5,2) DEFAULT 15.00 COMMENT '温度下限(℃)',
    humidity_upper_limit DECIMAL(5,2) DEFAULT 90.00 COMMENT '湿度上限(%)',
    humidity_lower_limit DECIMAL(5,2) DEFAULT 30.00 COMMENT '湿度下限(%)',
    co2_upper_limit DECIMAL(10,2) DEFAULT 5000.00 COMMENT 'CO2上限(ppm)',
    light_upper_limit DECIMAL(10,2) DEFAULT 100000.00 COMMENT '光照上限(lux)',
    fan_temp_threshold INT DEFAULT 28 COMMENT '风机启动温度阈值(℃)',
    wet_curtain_temp_diff INT DEFAULT 3 COMMENT '湿帘启动温度差(℃)',
    sunshade_light_threshold INT DEFAULT 50000 COMMENT '遮阳网启动光照阈值(lux)',
    debounce_time INT DEFAULT 30 COMMENT '防抖时间(秒)',
    interlock_enabled TINYINT DEFAULT 1 COMMENT '联锁保护 0-关闭 1-开启',
    priority INT DEFAULT 0 COMMENT '优先级',
    enabled TINYINT DEFAULT 1 COMMENT '是否启用 0-禁用 1-启用',
    cron_expression VARCHAR(100) COMMENT '定时表达式',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_greenhouse_id (greenhouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='控制策略表';

-- =========================================================
-- 5. 告警表
-- =========================================================
DROP TABLE IF EXISTS t_alarm;
CREATE TABLE t_alarm (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    greenhouse_id BIGINT NOT NULL COMMENT '大棚ID',
    device_code VARCHAR(50) COMMENT '设备编号',
    alarm_code VARCHAR(50) NOT NULL COMMENT '告警编码',
    alarm_name VARCHAR(100) NOT NULL COMMENT '告警名称',
    alarm_level TINYINT NOT NULL COMMENT '告警级别 1-提示 2-警告 3-错误 4-严重',
    alarm_content TEXT NOT NULL COMMENT '告警内容',
    alarm_value VARCHAR(100) COMMENT '告警值',
    threshold_value VARCHAR(100) COMMENT '阈值',
    alarm_time DATETIME NOT NULL COMMENT '告警时间',
    recover_time DATETIME COMMENT '恢复时间',
    status TINYINT DEFAULT 0 COMMENT '状态 0-未处理 1-已处理',
    handle_remark TEXT COMMENT '处理备注',
    handled_by VARCHAR(50) COMMENT '处理人',
    handle_time DATETIME COMMENT '处理时间',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_greenhouse_status (greenhouse_id, status),
    INDEX idx_alarm_time (alarm_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警表';

-- =========================================================
-- 6. 控制日志表
-- =========================================================
DROP TABLE IF EXISTS t_control_log;
CREATE TABLE t_control_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    greenhouse_id BIGINT COMMENT '大棚ID',
    device_code VARCHAR(50) NOT NULL COMMENT '设备编号',
    device_name VARCHAR(100) COMMENT '设备名称',
    action_type TINYINT NOT NULL COMMENT '操作类型 0-关闭 1-开启',
    action_content TEXT COMMENT '操作内容',
    trigger_source VARCHAR(50) COMMENT '触发来源 MANUAL-手动 AUTO-自动 TIMED-定时',
    strategy_name VARCHAR(100) COMMENT '策略名称',
    command_status TINYINT DEFAULT 0 COMMENT '指令状态 0-成功 1-发送中 2-设备离线 3-失败 4-超时',
    ack_content TEXT COMMENT '回执内容',
    command_time DATETIME NOT NULL COMMENT '指令发送时间',
    ack_time DATETIME COMMENT '回执时间',
    retry_count INT DEFAULT 0 COMMENT '重试次数',
    operator VARCHAR(50) COMMENT '操作人',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_greenhouse_time (greenhouse_id, command_time),
    INDEX idx_device_code (device_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='控制日志表';

-- =========================================================
-- 初始化数据
-- =========================================================

-- 大棚数据
INSERT INTO t_greenhouse (name, code, location, area, crop_type, description, status, create_time, update_time) VALUES
('1号大棚', 'GH001', 'A区-东1栋', 1200.00, '番茄', '冬春茬番茄种植区', 1, NOW(), NOW()),
('2号大棚', 'GH002', 'A区-东2栋', 1200.00, '黄瓜', '秋黄瓜种植区', 1, NOW(), NOW()),
('3号大棚', 'GH003', 'B区-西1栋', 1500.00, '草莓', '草莓采摘区', 1, NOW(), NOW());

-- 设备数据 - 1号大棚
INSERT INTO t_device (greenhouse_id, device_code, device_name, device_type, device_status, gateway_code, zone, running_status, create_time, update_time) VALUES
(1, 'GW001', '1号网关', 99, 1, 'GW001', '整体', 0, NOW(), NOW()),
(1, 'TS001', '1号温度传感器', 10, 1, 'GW001', '东区', 0, NOW(), NOW()),
(1, 'HS001', '1号湿度传感器', 11, 1, 'GW001', '东区', 0, NOW(), NOW()),
(1, 'FAN001', '1号风机', 1, 1, 'GW001', '东区', 0, NOW(), NOW()),
(1, 'FAN002', '2号风机', 1, 1, 'GW001', '西区', 0, NOW(), NOW()),
(1, 'WC001', '1号湿帘', 2, 1, 'GW001', '南侧', 0, NOW(), NOW()),
(1, 'SN001', '1号遮阳网', 3, 1, 'GW001', '顶部', 0, NOW(), NOW());

-- 设备数据 - 2号大棚
INSERT INTO t_device (greenhouse_id, device_code, device_name, device_type, device_status, gateway_code, zone, running_status, create_time, update_time) VALUES
(2, 'GW002', '2号网关', 99, 1, 'GW002', '整体', 0, NOW(), NOW()),
(2, 'TS002', '2号温度传感器', 10, 1, 'GW002', '东区', 0, NOW(), NOW()),
(2, 'HS002', '2号湿度传感器', 11, 1, 'GW002', '东区', 0, NOW(), NOW()),
(2, 'FAN003', '3号风机', 1, 1, 'GW002', '东区', 0, NOW(), NOW()),
(2, 'FAN004', '4号风机', 1, 1, 'GW002', '西区', 0, NOW(), NOW()),
(2, 'WC002', '2号湿帘', 2, 1, 'GW002', '南侧', 0, NOW(), NOW()),
(2, 'SN002', '2号遮阳网', 3, 1, 'GW002', '顶部', 0, NOW(), NOW());

-- 设备数据 - 3号大棚
INSERT INTO t_device (greenhouse_id, device_code, device_name, device_type, device_status, gateway_code, zone, running_status, create_time, update_time) VALUES
(3, 'GW003', '3号网关', 99, 1, 'GW003', '整体', 0, NOW(), NOW()),
(3, 'TS003', '3号温度传感器', 10, 1, 'GW003', '东区', 0, NOW(), NOW()),
(3, 'HS003', '3号湿度传感器', 11, 1, 'GW003', '东区', 0, NOW(), NOW()),
(3, 'FAN005', '5号风机', 1, 1, 'GW003', '东区', 0, NOW(), NOW()),
(3, 'WC003', '3号湿帘', 2, 1, 'GW003', '南侧', 0, NOW(), NOW()),
(3, 'SN003', '3号遮阳网', 3, 1, 'GW003', '顶部', 0, NOW(), NOW());

-- 控制策略数据
INSERT INTO t_control_strategy (greenhouse_id, strategy_name, crop_type, control_mode,
    temp_upper_limit, temp_lower_limit, humidity_upper_limit, humidity_lower_limit,
    fan_temp_threshold, wet_curtain_temp_diff, sunshade_light_threshold,
    debounce_time, interlock_enabled, priority, enabled, create_time, update_time) VALUES
(1, '番茄温控策略', '番茄', 1, 30.00, 15.00, 90.00, 40.00, 28, 3, 50000, 30, 1, 10, 1, NOW(), NOW()),
(2, '黄瓜温控策略', '黄瓜', 1, 32.00, 18.00, 95.00, 50.00, 30, 2, 45000, 20, 1, 10, 1, NOW(), NOW()),
(3, '草莓温控策略', '草莓', 1, 28.00, 10.00, 85.00, 55.00, 26, 4, 40000, 60, 1, 10, 1, NOW(), NOW());

-- 模拟传感器历史数据
INSERT INTO t_sensor_data (greenhouse_id, device_code, temperature, humidity, co2, light_intensity, soil_moisture, soil_temperature, collect_time, create_time, update_time) VALUES
(1, 'TS001', 25.5, 65.0, 800.0, 35000.0, 70.0, 22.0, DATE_SUB(NOW(), INTERVAL 10 MINUTE), NOW(), NOW()),
(1, 'TS001', 26.2, 63.5, 850.0, 40000.0, 69.5, 22.5, DATE_SUB(NOW(), INTERVAL 5 MINUTE), NOW(), NOW()),
(1, 'TS001', 28.5, 60.0, 900.0, 55000.0, 68.0, 23.0, NOW(), NOW(), NOW()),
(2, 'TS002', 29.0, 75.0, 750.0, 38000.0, 75.0, 24.0, NOW(), NOW(), NOW()),
(3, 'TS003', 23.0, 70.0, 700.0, 30000.0, 72.0, 20.0, NOW(), NOW(), NOW());

-- =========================================================
-- 7. 设备运行台账表
-- =========================================================
DROP TABLE IF EXISTS t_device_ledger;
CREATE TABLE t_device_ledger (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    device_code VARCHAR(50) NOT NULL COMMENT '设备编号',
    device_name VARCHAR(100) COMMENT '设备名称',
    device_type TINYINT COMMENT '设备类型 1-风机 2-湿帘 3-遮阳网',
    greenhouse_id BIGINT COMMENT '大棚ID',
    total_run_hours DECIMAL(10,2) DEFAULT 0.00 COMMENT '累计运行时长(小时)',
    start_stop_count INT DEFAULT 0 COMMENT '启停次数',
    current_run_hours DECIMAL(10,2) DEFAULT 0.00 COMMENT '当前运行时长(小时)',
    last_start_time DATETIME COMMENT '最近启动时间',
    last_stop_time DATETIME COMMENT '最近停止时间',
    last_maintenance_hours DECIMAL(10,2) DEFAULT 0.00 COMMENT '上次保养时运行时长',
    next_maintenance_hours DECIMAL(10,2) DEFAULT 0.00 COMMENT '下次保养运行时长',
    maintenance_status TINYINT DEFAULT 0 COMMENT '保养状态 0-正常 1-待保养 2-超期',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    UNIQUE KEY uk_device_code (device_code),
    INDEX idx_greenhouse_id (greenhouse_id),
    INDEX idx_maintenance_status (maintenance_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备运行台账表';

-- =========================================================
-- 8. 保养计划表
-- =========================================================
DROP TABLE IF EXISTS t_maintenance_plan;
CREATE TABLE t_maintenance_plan (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    device_type TINYINT NOT NULL COMMENT '设备类型 1-风机 2-湿帘 3-遮阳网',
    plan_name VARCHAR(100) NOT NULL COMMENT '计划名称',
    maintenance_type VARCHAR(50) COMMENT '保养类型 润滑/清洁/检修/更换',
    cycle_hours INT COMMENT '保养周期(运行小时数)',
    cycle_days INT COMMENT '保养周期(天数)',
    description TEXT COMMENT '保养内容描述',
    required_spare_parts VARCHAR(500) COMMENT '所需备件',
    enabled TINYINT DEFAULT 1 COMMENT '是否启用 0-禁用 1-启用',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_device_type (device_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='保养计划表';

-- =========================================================
-- 9. 保养记录表
-- =========================================================
DROP TABLE IF EXISTS t_maintenance_record;
CREATE TABLE t_maintenance_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    device_code VARCHAR(50) NOT NULL COMMENT '设备编号',
    device_name VARCHAR(100) COMMENT '设备名称',
    greenhouse_id BIGINT COMMENT '大棚ID',
    plan_id BIGINT COMMENT '保养计划ID',
    maintenance_type VARCHAR(50) COMMENT '保养类型',
    maintenance_content TEXT COMMENT '保养内容',
    run_hours_at_maintenance DECIMAL(10,2) COMMENT '保养时运行时长',
    operator VARCHAR(50) COMMENT '操作人',
    maintenance_time DATETIME COMMENT '保养时间',
    spare_parts_used VARCHAR(500) COMMENT '使用备件',
    cost DECIMAL(10,2) COMMENT '费用',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_device_code (device_code),
    INDEX idx_greenhouse_time (greenhouse_id, maintenance_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='保养记录表';

-- =========================================================
-- 10. 故障记录表
-- =========================================================
DROP TABLE IF EXISTS t_fault_record;
CREATE TABLE t_fault_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    device_code VARCHAR(50) NOT NULL COMMENT '设备编号',
    device_name VARCHAR(100) COMMENT '设备名称',
    device_type TINYINT COMMENT '设备类型',
    greenhouse_id BIGINT COMMENT '大棚ID',
    fault_code VARCHAR(50) COMMENT '故障编码',
    fault_type VARCHAR(50) COMMENT '故障类型 电机过载/通讯超时/传感器异常',
    fault_level TINYINT DEFAULT 2 COMMENT '故障级别 1-轻微 2-一般 3-严重',
    fault_content TEXT COMMENT '故障描述',
    fault_time DATETIME NOT NULL COMMENT '故障发生时间',
    recover_time DATETIME COMMENT '恢复时间',
    duration_minutes INT COMMENT '持续时长(分钟)',
    status TINYINT DEFAULT 0 COMMENT '状态 0-未处理 1-处理中 2-已解决',
    handler VARCHAR(50) COMMENT '处理人',
    handle_method TEXT COMMENT '处理方法',
    handle_time DATETIME COMMENT '处理时间',
    spare_parts_used VARCHAR(500) COMMENT '更换备件',
    cost DECIMAL(10,2) COMMENT '维修费用',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_device_code (device_code),
    INDEX idx_greenhouse_time (greenhouse_id, fault_time),
    INDEX idx_fault_time (fault_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='故障记录表';

-- =========================================================
-- 运维模块初始化数据
-- =========================================================

-- 初始化设备台账数据
INSERT INTO t_device_ledger (device_code, device_name, device_type, greenhouse_id, total_run_hours, start_stop_count, next_maintenance_hours, create_time, update_time) VALUES
('FAN001', '1号风机', 1, 1, 1256.5, 156, 1500.00, NOW(), NOW()),
('FAN002', '2号风机', 1, 1, 1189.0, 142, 1500.00, NOW(), NOW()),
('FAN003', '3号风机', 1, 2, 856.0, 98, 1500.00, NOW(), NOW()),
('FAN004', '4号风机', 1, 2, 923.5, 110, 1500.00, NOW(), NOW()),
('FAN005', '5号风机', 1, 3, 678.0, 76, 1500.00, NOW(), NOW()),
('WC001', '1号湿帘', 2, 1, 856.0, 45, 1000.00, NOW(), NOW()),
('WC002', '2号湿帘', 2, 2, 723.0, 38, 1000.00, NOW(), NOW()),
('WC003', '3号湿帘', 2, 3, 567.0, 32, 1000.00, NOW(), NOW()),
('SN001', '1号遮阳网', 3, 1, 2345.0, 89, 3000.00, NOW(), NOW()),
('SN002', '2号遮阳网', 3, 2, 1987.0, 76, 3000.00, NOW(), NOW()),
('SN003', '3号遮阳网', 3, 3, 1567.0, 65, 3000.00, NOW(), NOW());

-- 保养计划数据
INSERT INTO t_maintenance_plan (device_type, plan_name, maintenance_type, cycle_hours, description, required_spare_parts, enabled, create_time, update_time) VALUES
(1, '风机润滑保养', '润滑', 500, '1. 检查轴承润滑情况\n2. 添加高温润滑脂\n3. 检查皮带张紧度\n4. 清理电机散热片', '高温润滑脂、传动皮带', 1, NOW(), NOW()),
(1, '风机季度检修', '检修', 2000, '1. 电机绝缘测试\n2. 风叶动平衡检查\n3. 支架紧固检查\n4. 接线端子检查', '绝缘胶带、接线端子', 1, NOW(), NOW()),
(2, '湿帘清洁保养', '清洁', 300, '1. 清洗湿帘过滤网\n2. 检查水泵运行状态\n3. 清理水槽污垢\n4. 检查浮球阀', '过滤网、密封胶圈', 1, NOW(), NOW()),
(2, '湿帘泵检修', '检修', 1000, '1. 水泵拆解检修\n2. 电机轴承更换\n3. 叶轮清洁\n4. 密封性测试', '水泵轴承、机械密封', 1, NOW(), NOW()),
(3, '遮阳网清洁检查', '清洁', 800, '1. 清洁遮阳网表面\n2. 检查传动机构润滑\n3. 限位开关校准\n4. 钢索张紧度检查', '钢丝绳、限位开关', 1, NOW(), NOW()),
(3, '遮阳网电机保养', '检修', 3000, '1. 电机润滑保养\n2. 减速箱换油\n3. 刹车装置检查\n4. 电气控制检查', '减速箱齿轮油、刹车片', 1, NOW(), NOW());

-- 故障记录数据
INSERT INTO t_fault_record (device_code, device_name, device_type, greenhouse_id, fault_code, fault_type, fault_level, fault_content, fault_time, status, handler, handle_method, handle_time, remark, create_time, update_time) VALUES
('FAN001', '1号风机', 1, 1, 'E001', '电机过载', 2, '风机运行电流过大，超过额定值15%', DATE_SUB(NOW(), INTERVAL 3 DAY), 2, '张工', '清理电机散热片，检查负载情况', DATE_SUB(NOW(), INTERVAL 3 DAY), '夏季高温导致散热不良', NOW(), NOW()),
('FAN002', '2号风机', 1, 1, 'E002', '通讯超时', 1, '设备连续3次无响应', DATE_SUB(NOW(), INTERVAL 5 DAY), 2, '李工', '检查网关连接，重启设备', DATE_SUB(NOW(), INTERVAL 5 DAY), '网络波动导致', NOW(), NOW()),
('WC001', '1号湿帘', 2, 1, 'E003', '传感器异常', 2, '水位传感器读数异常', DATE_SUB(NOW(), INTERVAL 7 DAY), 2, '王工', '更换水位传感器', DATE_SUB(NOW(), INTERVAL 7 DAY), '传感器老化', NOW(), NOW()),
('FAN003', '3号风机', 1, 2, 'E001', '电机过载', 3, '电机过热保护触发，风机停机', DATE_SUB(NOW(), INTERVAL 10 DAY), 2, '张工', '更换电机轴承，清理风道', DATE_SUB(NOW(), INTERVAL 10 DAY), '轴承磨损导致', NOW(), NOW()),
('SN001', '1号遮阳网', 3, 1, 'E004', '限位故障', 2, '遮阳网无法完全收起', DATE_SUB(NOW(), INTERVAL 15 DAY), 2, '李工', '重新校准限位开关', DATE_SUB(NOW(), INTERVAL 15 DAY), '限位开关移位', NOW(), NOW()),
('FAN001', '1号风机', 1, 1, 'E001', '电机过载', 2, '运行电流偏高', DATE_SUB(NOW(), INTERVAL 20 DAY), 2, '张工', '清理维护', DATE_SUB(NOW(), INTERVAL 20 DAY), '定期维护', NOW(), NOW()),
('FAN001', '1号风机', 1, 1, 'E002', '通讯超时', 1, '临时通讯中断', DATE_SUB(NOW(), INTERVAL 25 DAY), 2, '系统', '自动恢复', DATE_SUB(NOW(), INTERVAL 25 DAY), '网络问题', NOW(), NOW());

-- 保养记录数据
INSERT INTO t_maintenance_record (device_code, device_name, greenhouse_id, plan_id, maintenance_type, maintenance_content, run_hours_at_maintenance, operator, maintenance_time, spare_parts_used, cost, remark, create_time, update_time) VALUES
('FAN001', '1号风机', 1, 1, '润滑', '完成轴承润滑，皮带张紧度检查', 1000.0, '张工', DATE_SUB(NOW(), INTERVAL 30 DAY), '高温润滑脂100g', 50.00, '运行状态良好', NOW(), NOW()),
('WC001', '1号湿帘', 1, 3, '清洁', '完成湿帘清洁，水槽清理', 600.0, '李工', DATE_SUB(NOW(), INTERVAL 25 DAY), '过滤网1个', 120.00, '更换新滤网', NOW(), NOW()),
('FAN002', '2号风机', 1, 1, '润滑', '完成常规润滑保养', 950.0, '张工', DATE_SUB(NOW(), INTERVAL 20 DAY), '', 30.00, '', NOW(), NOW()),
('SN001', '1号遮阳网', 1, 5, '清洁', '完成遮阳网清洁和检查', 2000.0, '王工', DATE_SUB(NOW(), INTERVAL 15 DAY), '限位开关1个', 280.00, '更换故障限位', NOW(), NOW()),
('FAN003', '3号风机', 2, 1, '润滑', '首次保养完成', 500.0, '张工', DATE_SUB(NOW(), INTERVAL 45 DAY), '高温润滑脂100g', 50.00, '磨合期保养', NOW(), NOW());

COMMIT;
