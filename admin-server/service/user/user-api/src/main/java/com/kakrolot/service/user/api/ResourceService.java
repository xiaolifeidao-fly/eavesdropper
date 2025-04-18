package com.kakrolot.service.user.api;

import com.kakrolot.service.user.api.dto.ResourceDTO;

import java.util.List;

public interface ResourceService {

    List<ResourceDTO> findByRoleIds(List<Long> roleId);

    ResourceDTO findByResourceUrl(String resourceUrl);
}
