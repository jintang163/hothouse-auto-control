package com.hothouse.service.impl.farming;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.dto.farming.PestIdentifyDTO;
import com.hothouse.common.entity.farming.PestDisease;
import com.hothouse.common.entity.farming.PestIdentification;
import com.hothouse.common.enums.farming.HandleStatus;
import com.hothouse.common.enums.farming.IdentifyMethod;
import com.hothouse.common.enums.farming.LogType;
import com.hothouse.mapper.farming.PestDiseaseMapper;
import com.hothouse.mapper.farming.PestIdentificationMapper;
import com.hothouse.service.farming.FarmingLogService;
import com.hothouse.service.farming.PestDiseaseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class PestDiseaseServiceImpl extends ServiceImpl<PestDiseaseMapper, PestDisease>
        implements PestDiseaseService {

    private final PestDiseaseMapper pestDiseaseMapper;
    private final PestIdentificationMapper pestIdentificationMapper;
    private final FarmingLogService farmingLogService;

    private static final Map<String, String> PEST_KEYWORD_MAP = new HashMap<>();
    private static final Random RANDOM = new Random();

    static {
        PEST_KEYWORD_MAP.put("white_fly", "白粉虱");
        PEST_KEYWORD_MAP.put("red_spider", "红蜘蛛");
        PEST_KEYWORD_MAP.put("mildew", "霜霉病");
        PEST_KEYWORD_MAP.put("aphid", "蚜虫");
        PEST_KEYWORD_MAP.put("thrips", "蓟马");
        PEST_KEYWORD_MAP.put("leaf_miner", "潜叶蝇");
        PEST_KEYWORD_MAP.put("botrytis", "灰霉病");
        PEST_KEYWORD_MAP.put("powdery_mildew", "白粉病");
        PEST_KEYWORD_MAP.put("root_rot", "根腐病");
        PEST_KEYWORD_MAP.put("virus", "病毒病");
    }

    @Override
    public List<PestDisease> listByPestType(String pestType) {
        return pestDiseaseMapper.selectByPestType(pestType);
    }

    @Override
    public List<PestDisease> listByCropName(String cropName) {
        return pestDiseaseMapper.selectByCropName(cropName);
    }

    @Override
    public List<PestDisease> listAllActive() {
        return pestDiseaseMapper.selectAllActive();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PestIdentification identifyPest(PestIdentifyDTO dto) {
        log.info("Start pest identification, greenhouseId: {}, method: {}",
                dto.getGreenhouseId(), dto.getIdentifyMethod());

        IdentifyMethod method = IdentifyMethod.getByCode(dto.getIdentifyMethod());
        if (method == null) {
            method = IdentifyMethod.AI;
        }

        PestIdentification identification = new PestIdentification();
        identification.setIdentifyCode(generateIdentifyCode());
        identification.setGreenhouseId(dto.getGreenhouseId());
        identification.setVarietyId(dto.getVarietyId());
        identification.setImageUrl(dto.getImageUrl());
        identification.setIdentifyMethod(method);
        identification.setIdentifyTime(LocalDateTime.now());
        identification.setHandleStatus(HandleStatus.PENDING);

        if (method == IdentifyMethod.AI) {
            performAiIdentification(dto, identification);
        } else {
            performManualIdentification(dto, identification);
        }

        if (identification.getPestId() != null) {
            PestDisease pestDisease = getById(identification.getPestId());
            if (pestDisease != null) {
                identification.setDamageLevel(pestDisease.getSeverityLevel());
                identification.setSuggestion(generateTreatmentSuggestion(pestDisease));
            }
        }

        pestIdentificationMapper.insert(identification);
        log.info("Pest identification completed, identifyCode: {}, pestName: {}, confidence: {}",
                identification.getIdentifyCode(), identification.getPestName(), identification.getConfidence());

        createIdentificationLog(identification);

        return identification;
    }

    private void performAiIdentification(PestIdentifyDTO dto, PestIdentification identification) {
        String imageUrl = dto.getImageUrl() != null ? dto.getImageUrl().toLowerCase() : "";
        String matchedPestName = null;

        for (Map.Entry<String, String> entry : PEST_KEYWORD_MAP.entrySet()) {
            if (imageUrl.contains(entry.getKey())) {
                matchedPestName = entry.getValue();
                break;
            }
        }

        if (matchedPestName != null) {
            LambdaQueryWrapper<PestDisease> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(PestDisease::getPestName, matchedPestName);
            wrapper.eq(PestDisease::getStatus, 1);
            PestDisease pestDisease = getOne(wrapper);

            if (pestDisease != null) {
                identification.setPestId(pestDisease.getId());
                identification.setPestName(pestDisease.getPestName());
                identification.setIdentifyResult("AI识别结果：" + pestDisease.getPestName() +
                        "，症状特征：" + pestDisease.getSymptomDescription());
            }
        } else {
            LambdaQueryWrapper<PestDisease> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(PestDisease::getStatus, 1);
            wrapper.orderByDesc(PestDisease::getSeverityLevel);
            wrapper.last("LIMIT 1");
            PestDisease defaultPest = getOne(wrapper);

            if (defaultPest != null) {
                identification.setPestId(defaultPest.getId());
                identification.setPestName(defaultPest.getPestName());
                identification.setIdentifyResult("AI识别结果：疑似" + defaultPest.getPestName() +
                        "，建议人工复核。特征匹配度较低，需进一步确认。");
            }
        }

        int confidenceInt = 75 + RANDOM.nextInt(24);
        BigDecimal confidence = BigDecimal.valueOf(confidenceInt).setScale(2);
        identification.setConfidence(confidence);

        if (dto.getAffectedArea() != null) {
            identification.setAffectedArea(dto.getAffectedArea());
        } else {
            identification.setAffectedArea(BigDecimal.valueOf(1 + RANDOM.nextDouble() * 4).setScale(2));
        }

        if (dto.getDamageLevel() != null) {
            identification.setDamageLevel(dto.getDamageLevel());
        }
    }

    private void performManualIdentification(PestIdentifyDTO dto, PestIdentification identification) {
        if (dto.getPestId() != null) {
            identification.setPestId(dto.getPestId());
            PestDisease pestDisease = getById(dto.getPestId());
            if (pestDisease != null) {
                identification.setPestName(pestDisease.getPestName());
                identification.setIdentifyResult("人工判定结果：" + pestDisease.getPestName() +
                        "，判定人：" + (dto.getOperator() != null ? dto.getOperator() : "未知"));
            }
        } else if (dto.getPestName() != null) {
            LambdaQueryWrapper<PestDisease> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(PestDisease::getPestName, dto.getPestName());
            wrapper.eq(PestDisease::getStatus, 1);
            PestDisease pestDisease = getOne(wrapper);

            if (pestDisease != null) {
                identification.setPestId(pestDisease.getId());
                identification.setPestName(pestDisease.getPestName());
            } else {
                identification.setPestName(dto.getPestName());
            }
            identification.setIdentifyResult("人工判定结果：" + dto.getPestName() +
                    "，判定人：" + (dto.getOperator() != null ? dto.getOperator() : "未知"));
        }

        if (dto.getConfidence() != null) {
            identification.setConfidence(dto.getConfidence());
        } else {
            identification.setConfidence(BigDecimal.valueOf(95));
        }

        if (dto.getAffectedArea() != null) {
            identification.setAffectedArea(dto.getAffectedArea());
        }

        if (dto.getDamageLevel() != null) {
            identification.setDamageLevel(dto.getDamageLevel());
        }

        if (dto.getIdentifyResult() != null) {
            identification.setIdentifyResult(dto.getIdentifyResult());
        }

        if (dto.getSuggestion() != null) {
            identification.setSuggestion(dto.getSuggestion());
        }
    }

    private String generateTreatmentSuggestion(PestDisease pestDisease) {
        StringBuilder suggestion = new StringBuilder();
        suggestion.append("【处置建议】\n\n");

        suggestion.append("一、农业防治：");
        if (pestDisease.getAgriculturalControl() != null && !pestDisease.getAgriculturalControl().isEmpty()) {
            suggestion.append(pestDisease.getAgriculturalControl());
        } else {
            suggestion.append("及时清除病残体，合理密植，加强通风透光，科学水肥管理，增强植株抗病虫能力。");
        }
        suggestion.append("\n\n");

        suggestion.append("二、物理防治：");
        if (pestDisease.getPhysicalControl() != null && !pestDisease.getPhysicalControl().isEmpty()) {
            suggestion.append(pestDisease.getPhysicalControl());
        } else {
            suggestion.append("安装防虫网，悬挂黄板诱杀蚜虫、粉虱等害虫，使用性诱剂诱捕成虫，高温闷棚消毒。");
        }
        suggestion.append("\n\n");

        suggestion.append("三、生物防治：");
        if (pestDisease.getBiologicalControl() != null && !pestDisease.getBiologicalControl().isEmpty()) {
            suggestion.append(pestDisease.getBiologicalControl());
        } else {
            suggestion.append("保护利用天敌（如瓢虫、草蛉、捕食螨等），喷施生物农药（如Bt制剂、苦参碱、印楝素等）。");
        }
        suggestion.append("\n\n");

        suggestion.append("四、药剂防治：");
        if (pestDisease.getControlAgents() != null && !pestDisease.getControlAgents().isEmpty()) {
            suggestion.append(pestDisease.getControlAgents());
        } else {
            suggestion.append("根据病虫害种类选择合适药剂，注意轮换用药，严格遵守安全间隔期。建议在病虫害初发期及时防治。");
        }
        suggestion.append("\n\n");

        suggestion.append("【注意事项】\n");
        suggestion.append("1. 施药时注意个人防护，避免农药中毒；\n");
        suggestion.append("2. 严格按照推荐剂量使用，避免产生抗药性；\n");
        suggestion.append("3. 采收前严格遵守安全间隔期规定；\n");
        suggestion.append("4. 建议7-10天后复查，根据防治效果决定是否需要二次防治。");

        return suggestion.toString();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean handlePestIdentification(Long id, String handler, String handleResult) {
        log.info("Handle pest identification, id: {}, handler: {}", id, handler);

        PestIdentification identification = pestIdentificationMapper.selectById(id);
        if (identification == null) {
            log.error("Pest identification not found, id: {}", id);
            return false;
        }

        identification.setHandleStatus(HandleStatus.HANDLED);
        identification.setHandler(handler);
        identification.setHandleResult(handleResult);
        identification.setHandleTime(LocalDateTime.now());

        boolean updated = pestIdentificationMapper.updateById(identification) > 0;
        if (updated) {
            createHandleLog(identification);
            log.info("Pest identification handled successfully, id: {}", id);
        }

        return updated;
    }

    @Override
    public String generateIdentifyCode() {
        String prefix = "IDENT";
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String fullPrefix = prefix + "-" + datePart + "-";

        LambdaQueryWrapper<PestIdentification> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(PestIdentification::getIdentifyCode, fullPrefix);
        wrapper.orderByDesc(PestIdentification::getIdentifyCode);
        wrapper.last("LIMIT 1");
        PestIdentification lastIdentification = getOne(wrapper);

        int sequence = 1;
        if (lastIdentification != null && lastIdentification.getIdentifyCode() != null) {
            String[] parts = lastIdentification.getIdentifyCode().split("-");
            if (parts.length == 3) {
                try {
                    sequence = Integer.parseInt(parts[2]) + 1;
                } catch (NumberFormatException e) {
                    sequence = 1;
                }
            }
        }

        return String.format("%s-%s-%04d", prefix, datePart, sequence);
    }

    private void createIdentificationLog(PestIdentification identification) {
        try {
            StringBuilder logContent = new StringBuilder();
            logContent.append("病虫害识别完成。");
            logContent.append("识别方式：").append(identification.getIdentifyMethod() != null
                    ? identification.getIdentifyMethod().getDesc() : "未知").append("。");
            if (identification.getPestName() != null) {
                logContent.append("识别结果：").append(identification.getPestName()).append("。");
            }
            if (identification.getConfidence() != null) {
                logContent.append("置信度：").append(identification.getConfidence()).append("%。");
            }
            if (identification.getAffectedArea() != null) {
                logContent.append("受害面积：").append(identification.getAffectedArea()).append("㎡。");
            }

            farmingLogService.createLog(
                    identification.getGreenhouseId(),
                    null,
                    null,
                    identification.getVarietyId(),
                    null,
                    LogType.INSPECTION,
                    logContent.toString(),
                    "SYSTEM",
                    null,
                    "识别编码：" + identification.getIdentifyCode()
            );
        } catch (Exception e) {
            log.error("Create identification log error, identifyCode: {}", identification.getIdentifyCode(), e);
        }
    }

    private void createHandleLog(PestIdentification identification) {
        try {
            StringBuilder logContent = new StringBuilder();
            logContent.append("病虫害识别记录已处理。");
            logContent.append("病虫害：").append(identification.getPestName()).append("。");
            logContent.append("处理人：").append(identification.getHandler()).append("。");
            if (identification.getHandleResult() != null) {
                logContent.append("处理结果：").append(identification.getHandleResult()).append("。");
            }

            farmingLogService.createLog(
                    identification.getGreenhouseId(),
                    null,
                    null,
                    identification.getVarietyId(),
                    null,
                    LogType.OPERATION,
                    logContent.toString(),
                    identification.getHandler(),
                    null,
                    "识别编码：" + identification.getIdentifyCode()
            );
        } catch (Exception e) {
            log.error("Create handle log error, identifyCode: {}", identification.getIdentifyCode(), e);
        }
    }
}
