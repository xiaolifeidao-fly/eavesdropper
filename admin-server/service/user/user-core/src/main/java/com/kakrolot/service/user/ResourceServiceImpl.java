package com.kakrolot.service.user;

import com.kakrolot.service.user.api.ResourceService;
import com.kakrolot.service.user.api.dto.ResourceDTO;
import com.kakrolot.service.user.convert.ResourceConverter;
import com.kakrolot.service.user.dao.po.Resource;
import com.kakrolot.service.user.dao.repository.ResourceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class ResourceServiceImpl implements ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private ResourceConverter resourceConverter;

    @Override
    public List<ResourceDTO> findByRoleIds(List<Long> roleId) {
        List<Resource> resources = resourceRepository.findByRoleIds(roleId);
        return resourceConverter.toDTOs(resources);
    }

    @Override
    public ResourceDTO findByResourceUrl(String resourceUrl) {
        Resource resource = resourceRepository.findByResourceUrl(resourceUrl);
        return resourceConverter.toDTO(resource);
    }
}
