package com.kakrolot.service.user.convert;

import com.kakrolot.service.common.convert.CommonConvert;
import com.kakrolot.service.user.api.dto.ResourceDTO;
import com.kakrolot.service.user.dao.po.Resource;
import org.springframework.stereotype.Component;

@Component
public class ResourceConverter extends CommonConvert<ResourceDTO, Resource> {

}
