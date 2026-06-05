package com.hothouse.service.farming;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hothouse.common.dto.farming.PestIdentifyDTO;
import com.hothouse.common.entity.farming.PestDisease;
import com.hothouse.common.entity.farming.PestIdentification;

import java.util.List;

public interface PestDiseaseService extends IService<PestDisease> {

    List<PestDisease> listByPestType(String pestType);

    List<PestDisease> listByCropName(String cropName);

    List<PestDisease> listAllActive();

    PestIdentification identifyPest(PestIdentifyDTO dto);

    boolean handlePestIdentification(Long id, String handler, String handleResult);

    String generateIdentifyCode();
}
