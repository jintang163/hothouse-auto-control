package com.hothouse.service.farming;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hothouse.common.dto.farming.PrescriptionCopyDTO;
import com.hothouse.common.dto.farming.PrescriptionDTO;
import com.hothouse.common.entity.farming.FarmingPrescription;

import java.util.List;

public interface FarmingPrescriptionService extends IService<FarmingPrescription> {

    List<FarmingPrescription> listActiveByGreenhouseId(Long greenhouseId);

    FarmingPrescription getLatestByVarietyAndStage(Long varietyId, Long stageId);

    PrescriptionDTO getDetailById(Long id);

    boolean savePrescription(PrescriptionDTO dto);

    boolean updatePrescription(PrescriptionDTO dto);

    Long copyPrescription(PrescriptionCopyDTO dto);

    boolean publish(Long id);

    boolean archive(Long id);

    Long createNewVersion(Long id, String creator);
}
