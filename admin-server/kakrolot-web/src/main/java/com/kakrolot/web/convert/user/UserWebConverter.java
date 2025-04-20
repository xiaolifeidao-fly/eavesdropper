package com.kakrolot.web.convert.user;

import com.alibaba.fastjson.JSON;
import com.kakrolot.common.utils.AmountUtils;
import com.kakrolot.service.account.api.AccountService;
import com.kakrolot.service.account.api.dto.AccountDTO;
import com.kakrolot.service.user.api.dto.QueryUserDTO;
import com.kakrolot.service.user.api.dto.ResourceDTO;
import com.kakrolot.service.user.api.dto.ResourceType;
import com.kakrolot.service.user.api.dto.UserDTO;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.PageModel;
import com.kakrolot.web.model.user.QueryUserModel;
import com.kakrolot.web.model.user.UserModel;
import com.kakrolot.web.model.user.UserResourceModel;
import com.kakrolot.web.model.user.UserResourceModelResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserWebConverter extends WebConvert<UserDTO, UserModel> {

    @Autowired
    private AccountService accountService;

    public List<UserResourceModel> toUserResourceModels(List<ResourceDTO> resourceDTOs) {
        if (resourceDTOs == null) {
            return Collections.emptyList();
        }
        List<UserResourceModel> list = new ArrayList<>();
        fillRootMenu(list, resourceDTOs);
        if (list.size() == 0) {
            return Collections.emptyList();
        }
        List<ResourceDTO> pageList = buildResourceList(resourceDTOs, ResourceType.PAGE);
//        List<ResourceDTO> buttonList = buildResourceList(resourceDTOs, ResourceType.BUTTON);
        fillPage(list, pageList);
        return list;
    }

    public List<String> getButtonCodeList(List<ResourceDTO> resourceDTOs) {
        return resourceDTOs.stream().filter(resourceDTO -> ResourceType.BUTTON.name().equals(resourceDTO.getResourceType()))
                .map(ResourceDTO :: getCode).collect(Collectors.toList());
    }

    private void fillPage(List<UserResourceModel> list, List<ResourceDTO> pageList) {
        for (UserResourceModel userResourceModel : list) {
            List<UserResourceModel> pageResourceList = toResourceModels(userResourceModel, pageList);
            userResourceModel.setChildren(pageResourceList);
        }
    }

    private List<UserResourceModel> toResourceModels(UserResourceModel userResourceModel, List<ResourceDTO> pageList) {
        List<UserResourceModel> pageResourceList = new ArrayList<>();
        for (ResourceDTO resourceDTO : pageList) {
            if (resourceDTO.getParentId().equals(userResourceModel.getId())) {
                UserResourceModel userPageModel = buildPageResourceModel(resourceDTO);
                pageResourceList.add(userPageModel);
            }
        }
        return pageResourceList;
    }

    private UserResourceModel buildPageResourceModel(ResourceDTO resourceDTO) {
        UserResourceModel userResourceModel = new UserResourceModel();
        userResourceModel.setId(resourceDTO.getId());
        userResourceModel.setParentId(resourceDTO.getParentId());
        userResourceModel.setPath(resourceDTO.getPageUrl());
        userResourceModel.setComponent(resourceDTO.getComponent());
        userResourceModel.setRedirect(resourceDTO.getRedirect());
        userResourceModel.setAlwaysShow(false);
        userResourceModel.setHidden(false);
        userResourceModel.setName(resourceDTO.getMenuName());
        userResourceModel.setMeta(JSON.parseObject(resourceDTO.getMeta()));
        return userResourceModel;
    }

    private List<ResourceDTO> buildResourceList(List<ResourceDTO> resourceDTOs, ResourceType resourceType) {
        List<ResourceDTO> list = new ArrayList<>();
        for (ResourceDTO resourceDTO : resourceDTOs) {
            if (resourceDTO.getResourceType().equals(resourceType.name())) {
                list.add(resourceDTO);
            }
        }
        return list.stream().sorted(Comparator.comparing(ResourceDTO :: getSortId)).collect(Collectors.toList());
    }

    private void fillRootMenu(List<UserResourceModel> list, List<ResourceDTO> resourceDTOs) {
        List<ResourceDTO> menuList = buildResourceList(resourceDTOs, ResourceType.MENU);
        for (ResourceDTO resourceDTO : menuList) {
            UserResourceModel userResourceModel = toUserResourceMenuModel(resourceDTO);
            list.add(userResourceModel);
        }
    }

    private UserResourceModel toUserResourceMenuModel(ResourceDTO resourceDTO) {
        UserResourceModel userResourceModel = new UserResourceModel();
        userResourceModel.setId(resourceDTO.getId());
        userResourceModel.setParentId(resourceDTO.getParentId());
        userResourceModel.setPath(resourceDTO.getPageUrl());
        userResourceModel.setComponent(resourceDTO.getComponent());
        userResourceModel.setRedirect(resourceDTO.getRedirect());
        userResourceModel.setAlwaysShow(true);
        userResourceModel.setHidden(false);
        userResourceModel.setName(resourceDTO.getMenuName());
        userResourceModel.setMeta(JSON.parseObject(resourceDTO.getMeta()));
        return userResourceModel;
    }

    public QueryUserDTO toQueryUserDTO(UserModel userModel, int startIndex, int pageSize) {
        QueryUserDTO queryUserDTO = new QueryUserDTO();
        queryUserDTO.setUsername(userModel.getUsername());
        queryUserDTO.setPageSize(pageSize);
        queryUserDTO.setStartIndex(startIndex);
        return queryUserDTO;
    }

    public PageModel<QueryUserModel> toPageModel(List<QueryUserModel> queryUserModelList, Long count) {
        PageModel<QueryUserModel> pageModel = new PageModel<>();
        pageModel.setTotal(count);
        if (queryUserModelList == null) {
            queryUserModelList = Collections.emptyList();
        }
        pageModel.setItems(queryUserModelList);
        return pageModel;
    }

    public UserResourceModelResponse buildUserResourceModelResponse(UserDTO userDTO,List<ResourceDTO> resourceDTOList){
        AccountDTO accountDTO = accountService.findByUserId(userDTO.getId());
        List<UserResourceModel> userResourceModels = this.toUserResourceModels(resourceDTOList);
        List<String> buttonCodeList = this.getButtonCodeList(resourceDTOList);
        UserResourceModelResponse userResourceModelResponse = UserResourceModelResponse.builder().name(userDTO.getUsername())
                .menuList(userResourceModels).buttonList(buttonCodeList).roles(Collections.emptyList())
//                .avatar("https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif")
                .avatar("https://p1.ssl.cdn.btime.com/t01f37ecd3e0593fee7.gif")
                .introduction("无敌卡卡帮").amount(accountDTO.getBalanceAmount().stripTrailingZeros().toPlainString()).build();
        return userResourceModelResponse;
    }
}
