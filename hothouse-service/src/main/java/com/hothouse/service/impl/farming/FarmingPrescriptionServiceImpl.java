package com.hothouse.service.impl.farming;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hothouse.common.dto.farming.PrescriptionCopyDTO;
import com.hothouse.common.dto.farming.PrescriptionDTO;
import com.hothouse.common.entity.farming.FarmingPrescription;
import com.hothouse.common.entity.farming.PrescriptionEnvTarget;
import com.hothouse.common.entity.farming.PrescriptionFertigation;
import com.hothouse.common.entity.farming.PrescriptionOperation;
import com.hothouse.common.enums.farming.PrescriptionStatus;
import com.hothouse.mapper.farming.FarmingPrescriptionMapper;
import com.hothouse.mapper.farming.PrescriptionEnvTargetMapper;
import com.hothouse.mapper.farming.PrescriptionFertigationMapper;
import com.hothouse.mapper.farming.PrescriptionOperationMapper;
import com.hothouse.service.farming.FarmingPrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FarmingPrescriptionServiceImpl extends ServiceImpl<FarmingPrescriptionMapper, FarmingPrescription>
        implements FarmingPrescriptionService {

    private final FarmingPrescriptionMapper prescriptionMapper;
    private final PrescriptionEnvTargetMapper envTargetMapper;
    private final PrescriptionFertigationMapper fertigationMapper;
    private final PrescriptionOperationMapper operationMapper;

    @Override
    public List<FarmingPrescription> listActiveByGreenhouseId(Long greenhouseId) {
        return prescriptionMapper.selectActiveByGreenhouseId(greenhouseId);
    }

    @Override
    public FarmingPrescription getLatestByVarietyAndStage(Long varietyId, Long stageId) {
        return prescriptionMapper.selectLatestByVarietyAndStage(varietyId, stageId);
    }

    @Override
    public PrescriptionDTO getDetailById(Long id) {
        FarmingPrescription prescription = getById(id);
        if (prescription == null) {
            return null;
        }

        PrescriptionDTO dto = new PrescriptionDTO();
        dto.setId(prescription.getId());
        dto.setPrescriptionCode(prescription.getPrescriptionCode());
        dto.setPrescriptionName(prescription.getPrescriptionName());
        dto.setVarietyId(prescription.getVarietyId());
        dto.setStageId(prescription.getStageId());
        dto.setGreenhouseId(prescription.getGreenhouseId());
        dto.setDescription(prescription.getDescription());
        dto.setRemark(prescription.getRemark());
        dto.setCreator(prescription.getCreator());

        List<PrescriptionEnvTarget> envTargets = envTargetMapper.selectByPrescriptionId(id);
        List<PrescriptionFertigation> fertigations = fertigationMapper.selectByPrescriptionId(id);
        List<PrescriptionOperation> operations = operationMapper.selectByPrescriptionId(id);

        dto.setEnvTargets(envTargets);
        dto.setFertigations(fertigations);
        dto.setOperations(operations);

        return dto;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean savePrescription(PrescriptionDTO dto) {
        FarmingPrescription prescription = new FarmingPrescription();
        prescription.setPrescriptionCode(generatePrescriptionCode());
        prescription.setPrescriptionName(dto.getPrescriptionName());
        prescription.setVarietyId(dto.getVarietyId());
        prescription.setStageId(dto.getStageId());
        prescription.setGreenhouseId(dto.getGreenhouseId());
        prescription.setDescription(dto.getDescription());
        prescription.setRemark(dto.getRemark());
        prescription.setCreator(dto.getCreator());
        prescription.setVersion(1);
        prescription.setStatus(PrescriptionStatus.DRAFT);
        prescription.setCreateTime(LocalDateTime.now());
        prescription.setUpdateTime(LocalDateTime.now());

        boolean saved = save(prescription);
        if (!saved) {
            return false;
        }

        saveChildEntities(prescription.getId(), dto);

        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updatePrescription(PrescriptionDTO dto) {
        FarmingPrescription prescription = getById(dto.getId());
        if (prescription == null) {
            return false;
        }

        prescription.setPrescriptionName(dto.getPrescriptionName());
        prescription.setVarietyId(dto.getVarietyId());
        prescription.setStageId(dto.getStageId());
        prescription.setGreenhouseId(dto.getGreenhouseId());
        prescription.setDescription(dto.getDescription());
        prescription.setRemark(dto.getRemark());
        prescription.setUpdateTime(LocalDateTime.now());

        boolean updated = updateById(prescription);
        if (!updated) {
            return false;
        }

        deleteChildEntities(dto.getId());
        saveChildEntities(dto.getId(), dto);

        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long copyPrescription(PrescriptionCopyDTO dto) {
        FarmingPrescription source = getById(dto.getSourcePrescriptionId());
        if (source == null) {
            return null;
        }

        PrescriptionDTO sourceDetail = getDetailById(dto.getSourcePrescriptionId());
        if (sourceDetail == null) {
            return null;
        }

        FarmingPrescription newPrescription = new FarmingPrescription();
        newPrescription.setPrescriptionCode(generatePrescriptionCode());
        newPrescription.setPrescriptionName(dto.getNewPrescriptionName() != null ?
                dto.getNewPrescriptionName() : source.getPrescriptionName() + "_副本");
        newPrescription.setVarietyId(source.getVarietyId());
        newPrescription.setStageId(source.getStageId());
        newPrescription.setGreenhouseId(dto.getTargetGreenhouseId() != null ?
                dto.getTargetGreenhouseId() : source.getGreenhouseId());
        newPrescription.setDescription(source.getDescription());
        newPrescription.setRemark(source.getRemark());
        newPrescription.setCreator(dto.getCreator());
        newPrescription.setParentId(source.getId());
        newPrescription.setVersion(1);
        newPrescription.setStatus(PrescriptionStatus.DRAFT);
        newPrescription.setCreateTime(LocalDateTime.now());
        newPrescription.setUpdateTime(LocalDateTime.now());

        boolean saved = save(newPrescription);
        if (!saved) {
            return null;
        }

        PrescriptionDTO newDto = new PrescriptionDTO();
        newDto.setEnvTargets(sourceDetail.getEnvTargets());
        newDto.setFertigations(sourceDetail.getFertigations());
        newDto.setOperations(sourceDetail.getOperations());
        saveChildEntities(newPrescription.getId(), newDto);

        return newPrescription.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean publish(Long id) {
        FarmingPrescription prescription = getById(id);
        if (prescription == null) {
            return false;
        }

        prescription.setStatus(PrescriptionStatus.PUBLISHED);
        prescription.setUpdateTime(LocalDateTime.now());
        return updateById(prescription);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean archive(Long id) {
        FarmingPrescription prescription = getById(id);
        if (prescription == null) {
            return false;
        }

        prescription.setStatus(PrescriptionStatus.ARCHIVED);
        prescription.setUpdateTime(LocalDateTime.now());
        return updateById(prescription);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createNewVersion(Long id, String creator) {
        FarmingPrescription oldVersion = getById(id);
        if (oldVersion == null) {
            return null;
        }

        PrescriptionDTO oldDetail = getDetailById(id);
        if (oldDetail == null) {
            return null;
        }

        Integer maxVersion = prescriptionMapper.selectMaxVersion(oldVersion.getPrescriptionCode());
        int newVersion = maxVersion != null ? maxVersion + 1 : 1;

        FarmingPrescription newPrescription = new FarmingPrescription();
        newPrescription.setPrescriptionCode(oldVersion.getPrescriptionCode());
        newPrescription.setPrescriptionName(oldVersion.getPrescriptionName() + "_v" + newVersion);
        newPrescription.setVarietyId(oldVersion.getVarietyId());
        newPrescription.setStageId(oldVersion.getStageId());
        newPrescription.setGreenhouseId(oldVersion.getGreenhouseId());
        newPrescription.setDescription(oldVersion.getDescription());
        newPrescription.setRemark(oldVersion.getRemark());
        newPrescription.setCreator(creator);
        newPrescription.setParentId(oldVersion.getId());
        newPrescription.setVersion(newVersion);
        newPrescription.setStatus(PrescriptionStatus.DRAFT);
        newPrescription.setCreateTime(LocalDateTime.now());
        newPrescription.setUpdateTime(LocalDateTime.now());

        boolean saved = save(newPrescription);
        if (!saved) {
            return null;
        }

        PrescriptionDTO newDto = new PrescriptionDTO();
        newDto.setEnvTargets(oldDetail.getEnvTargets());
        newDto.setFertigations(oldDetail.getFertigations());
        newDto.setOperations(oldDetail.getOperations());
        saveChildEntities(newPrescription.getId(), newDto);

        return newPrescription.getId();
    }

    private String generatePrescriptionCode() {
        return "PRE" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    private void saveChildEntities(Long prescriptionId, PrescriptionDTO dto) {
        if (dto.getEnvTargets() != null) {
            for (PrescriptionEnvTarget target : dto.getEnvTargets()) {
                target.setId(null);
                target.setPrescriptionId(prescriptionId);
                target.setCreateTime(LocalDateTime.now());
                target.setUpdateTime(LocalDateTime.now());
                envTargetMapper.insert(target);
            }
        }

        if (dto.getFertigations() != null) {
            for (PrescriptionFertigation fertigation : dto.getFertigations()) {
                fertigation.setId(null);
                fertigation.setPrescriptionId(prescriptionId);
                fertigation.setCreateTime(LocalDateTime.now());
                fertigation.setUpdateTime(LocalDateTime.now());
                fertigationMapper.insert(fertigation);
            }
        }

        if (dto.getOperations() != null) {
            for (PrescriptionOperation operation : dto.getOperations()) {
                operation.setId(null);
                operation.setPrescriptionId(prescriptionId);
                operation.setCreateTime(LocalDateTime.now());
                operation.setUpdateTime(LocalDateTime.now());
                operationMapper.insert(operation);
            }
        }
    }

    private void deleteChildEntities(Long prescriptionId) {
        envTargetMapper.delete(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<PrescriptionEnvTarget>()
                .eq(PrescriptionEnvTarget::getPrescriptionId, prescriptionId));
        fertigationMapper.delete(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<PrescriptionFertigation>()
                .eq(PrescriptionFertigation::getPrescriptionId, prescriptionId));
        operationMapper.delete(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<PrescriptionOperation>()
                .eq(PrescriptionOperation::getPrescriptionId, prescriptionId));
    }
}
