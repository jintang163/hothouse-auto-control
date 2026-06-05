package com.hothouse.common.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_greenhouse")
public class Greenhouse extends BaseEntity {

    private String name;

    private String code;

    private String location;

    private Double area;

    private String cropType;

    private String description;

    private Integer status;
}
