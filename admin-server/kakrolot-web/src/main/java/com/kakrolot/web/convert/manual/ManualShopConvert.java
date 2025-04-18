package com.kakrolot.web.convert.manual;

import com.kakrolot.common.dto.DataStatus;
import com.kakrolot.service.shop.api.dto.ManualShopCategoryDTO;
import com.kakrolot.service.shop.api.dto.ManualShopTypeDTO;
import com.kakrolot.service.shop.api.dto.ShopDTO;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.manual.ManualShopCategoryModel;
import com.kakrolot.web.model.manual.ManualShopTypeModel;
import com.kakrolot.web.model.shop.ShopModel;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ManualShopConvert extends WebConvert<ShopDTO, ShopModel> {

    public List<ManualShopTypeModel> toManualShopTypeModels(List<ManualShopTypeDTO> manualShopTypeDTOList) {
        if(CollectionUtils.isEmpty(manualShopTypeDTOList)) {
            return Collections.emptyList();
        }
        return manualShopTypeDTOList.stream().map(this :: toManualShopTypeModel).collect(Collectors.toList());
    }

    public ManualShopTypeModel toManualShopTypeModel(ManualShopTypeDTO manualShopTypeDTO) {
        ManualShopTypeModel manualShopTypeModel = new ManualShopTypeModel();
        BeanUtils.copyProperties(manualShopTypeDTO,manualShopTypeModel);
        return manualShopTypeModel;
    }

    public List<ManualShopTypeDTO> toManualShopTypeDTOs(List<ManualShopTypeModel> manualShopTypeModelList) {
        if(CollectionUtils.isEmpty(manualShopTypeModelList)) {
            return Collections.emptyList();
        }
        return manualShopTypeModelList.stream().map(this :: toManualShopTypeDTO).collect(Collectors.toList());
    }

    public ManualShopTypeDTO toManualShopTypeDTO(ManualShopTypeModel manualShopTypeModel) {
        ManualShopTypeDTO manualShopTypeDTO = new ManualShopTypeDTO();
        BeanUtils.copyProperties(manualShopTypeModel,manualShopTypeDTO);
        return manualShopTypeDTO;
    }

    public List<ManualShopCategoryModel> toManualShopCategoryModels(List<ManualShopCategoryDTO> manualShopCategoryDTOList) {
        if(CollectionUtils.isEmpty(manualShopCategoryDTOList)) {
            return Collections.emptyList();
        }
        List<ManualShopCategoryModel> collect = manualShopCategoryDTOList.stream().map(this::toManualShopCategoryModel).collect(Collectors.toList());
        List<ManualShopCategoryModel> activeList = collect.stream().filter(manualShopCategoryModel -> DataStatus.ACTIVE.equals(manualShopCategoryModel.getStatus())).collect(Collectors.toList());
        List<ManualShopCategoryModel> expireList = collect.stream().filter(manualShopCategoryModel -> DataStatus.EXPIRE.equals(manualShopCategoryModel.getStatus())).collect(Collectors.toList());
        activeList.addAll(expireList);
        return activeList;
    }

    public ManualShopCategoryModel toManualShopCategoryModel(ManualShopCategoryDTO manualShopCategoryDTO) {
        ManualShopCategoryModel manualShopCategoryModel = new ManualShopCategoryModel();
        BeanUtils.copyProperties(manualShopCategoryDTO,manualShopCategoryModel);
        manualShopCategoryModel.setShopTypeModelList(toManualShopTypeModels(manualShopCategoryDTO.getShopTypeModelList()));
        return manualShopCategoryModel;
    }

    public List<ManualShopCategoryDTO> toManualShopCategoryDTOs(List<ManualShopCategoryModel> manualShopCategoryModelList) {
        if(CollectionUtils.isEmpty(manualShopCategoryModelList)) {
            return Collections.emptyList();
        }
        return manualShopCategoryModelList.stream().map(this :: toManualShopCategoryDTO).collect(Collectors.toList());
    }

    public ManualShopCategoryDTO toManualShopCategoryDTO(ManualShopCategoryModel manualShopCategoryModel) {
        ManualShopCategoryDTO manualShopCategoryDTO = new ManualShopCategoryDTO();
        BeanUtils.copyProperties(manualShopCategoryModel,manualShopCategoryDTO);
        manualShopCategoryDTO.setShopTypeModelList(toManualShopTypeDTOs(manualShopCategoryModel.getShopTypeModelList()));
        return manualShopCategoryDTO;
    }


}
