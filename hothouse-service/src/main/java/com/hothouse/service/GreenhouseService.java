package com.hothouse.service;

import com.hothouse.common.entity.Greenhouse;

import java.util.List;

public interface GreenhouseService {

    List<Greenhouse> list();

    Greenhouse getById(Long id);

    boolean save(Greenhouse greenhouse);

    boolean update(Greenhouse greenhouse);

    boolean delete(Long id);
}
