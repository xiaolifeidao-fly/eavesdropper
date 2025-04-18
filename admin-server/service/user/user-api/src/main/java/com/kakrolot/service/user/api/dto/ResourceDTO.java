package com.kakrolot.service.user.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

@Data
public class ResourceDTO extends BaseDTO {

    private String name;

    private String code;

    private Long parentId;

    private String resourceType;

    private String resourceUrl;

    private String pageUrl;

    private String component;

    private String redirect;

    private String menuName;

    private String meta;

    private Integer sortId;
}
