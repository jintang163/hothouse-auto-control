# 温室大棚智能环控系统

## 项目概述

面向设施农业的温室大棚智能环控系统，实现**感知采集 → 规则调控 → 设备联动 → 告警追溯**闭环。

## 技术架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  现场设备层      │────▶│  Netty接入层    │────▶│  Spring Boot    │
│  传感器/PLC     │     │  (端口8888)     │     │  业务后端        │
│  风机/湿帘/遮阳网│     │  协议解析       │     │  REST API       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
                                               ┌─────────────────┐
                                               │  数据存储        │
                                               │  MySQL + 时序库  │
                                               └─────────────────┘
                                                          │
                                                          ▼
                                               ┌─────────────────┐     ┌─────────────────┐
                                               │  管理端(React)  │     │  移动端(UniApp)  │
                                               │  实时监控大屏    │     │  现场控制        │
                                               │  策略配置        │     │  告警接收        │
                                               └─────────────────┘     └─────────────────┘
```

## 项目结构

```
hothouse-auto-control/
├── hothouse-common/          # 公共模块
│   ├── entity/               # 实体类
│   ├── enums/                # 枚举类
│   ├── dto/                  # 数据传输对象
│   ├── protocol/             # 协议消息
│   ├── event/                # 事件定义
│   ├── result/               # 统一返回结果
│   └── util/                 # 工具类
├── hothouse-netty/           # IoT接入层
│   ├── codec/                # 编解码器
│   ├── handler/              # 处理器链
│   ├── session/              # 会话管理
│   ├── processor/            # 数据处理器
│   ├── command/              # 指令服务
│   └── server/               # Netty服务器
├── hothouse-service/         # 业务服务层
│   ├── mapper/               # MyBatis Mapper
│   ├── service/              # 业务服务
│   ├── rule/                 # 规则引擎
│   └── listener/             # 事件监听器
├── hothouse-admin/           # 管理端
│   ├── controller/           # REST API
│   ├── config/               # 配置类
│   ├── websocket/            # WebSocket推送
│   └── resources/            # 配置文件
├── sql/                      # 数据库脚本
├── hothouse-web/             # React管理端
└── hothouse-app/             # UniApp移动端
```

## 核心功能

### 1. 自动调控要点

- **分区策略**：每个大棚独立配置控制策略，支持多优先级
- **采集—判定—执行链路**：传感器数据上报 → 规则引擎判定 → 设备指令下发
- **指令回执与失败重试**：设备控制指令需回执确认，失败自动重试3次
- **离线缓存**：设备离线时指令缓存，上线后自动补发
- **联锁保护**：湿帘未开启禁止启动强通风模式，防止设备损坏

### 2. 三设备联动逻辑

| 设备 | 触发条件 | 动作 |
|------|----------|------|
| 风机 | 温度 > 风机阈值(默认28℃) | 开启风机通风降温 |
| 湿帘 | 温度 > 风机阈值 + 温差(默认3℃) | 开启湿帘蒸发降温 |
| 遮阳网 | 光照 > 阈值(默认50000lux) | 展开遮阳网遮光 |

### 3. 控制模式

- **手动模式**：用户通过管理端/移动端直接控制设备
- **自动模式**：系统根据策略自动调控（默认）
- **定时模式**：基于Cron表达式定时执行

### 4. 告警规则

- 温度 > 40℃ / < 5℃ → 严重告警
- 温度 > 35℃ / < 10℃ → 警告
- 湿度 > 90% / < 20% → 警告
- CO2 > 5000ppm → 严重告警

## 快速开始

### 1. 数据库初始化

```bash
mysql -u root -p < sql/hothouse_init.sql
```

### 2. 修改配置

编辑 `hothouse-admin/src/main/resources/application.yml`，修改数据库连接信息。

### 3. 编译运行

```bash
mvn clean package -DskipTests
java -jar hothouse-admin/target/hothouse-admin-1.0.0.jar
```

### 4. 访问地址

- 管理端API：http://localhost:8080/api
- WebSocket实时数据：ws://localhost:8080/api/ws/realtime
- Netty设备端口：8888

## 通信协议

### 消息帧格式

```
┌────────┬────────┬────────┬────────────┬────────────┬────────┬────────┬──────────┬────────┐
│  Magic │ Version│  Type  │ DeviceCode │ GatewayCode│  Time  │  Seq   │ Payload  │ Check  │
│ (4B)   │  (2B)  │  (2B)  │   (20B)    │   (20B)    │  (8B)  │  (4B)  │ (Length) │ (2B)   │
└────────┴────────┴────────┴────────────┴────────────┴────────┴────────┴──────────┴────────┘
```

### 消息类型

| 类型码 | 名称 | 说明 |
|--------|------|------|
| 0x01 | 心跳 | 设备定时上报保活 |
| 0x02 | 认证 | 设备连接后认证 |
| 0x03 | 数据上报 | 传感器数据上报 |
| 0x04 | 控制指令 | 服务端下发控制 |
| 0x05 | 控制回执 | 设备执行结果 |
| 0x06 | 告警上报 | 设备异常告警 |

## API接口

### 大棚管理
- `GET /api/greenhouse` - 获取大棚列表
- `POST /api/greenhouse` - 新增大棚
- `PUT /api/greenhouse` - 更新大棚
- `DELETE /api/greenhouse/{id}` - 删除大棚

### 设备管理
- `GET /api/device` - 获取设备列表
- `GET /api/device/greenhouse/{greenhouseId}` - 按大棚获取设备
- `POST /api/device` - 新增设备

### 实时数据
- `GET /api/control/realtime/{greenhouseId}` - 获取实时环境数据
- `GET /api/sensor-data/history/{greenhouseId}` - 获取历史数据

### 设备控制
- `POST /api/control/manual` - 手动控制设备
- `POST /api/control/mode` - 切换控制模式

### 策略管理
- `GET /api/strategy` - 获取策略列表
- `POST /api/strategy` - 新增策略
- `POST /api/strategy/enable/{id}` - 启用策略
- `POST /api/strategy/disable/{id}` - 禁用策略

### 告警管理
- `GET /api/alarm/active/{greenhouseId}` - 获取活跃告警
- `POST /api/alarm/handle` - 处理告警

### 控制日志
- `GET /api/control-log/history/{greenhouseId}` - 获取控制历史

### 系统概览
- `GET /api/overview` - 获取系统概览数据
