package com.kakrolot.web.controller.impl;

import com.kakrolot.business.service.user.UserTenantService;
import com.kakrolot.common.utils.Constant;
import com.kakrolot.service.shop.api.ShopService;
import com.kakrolot.service.shop.api.TenantShopCategoryService;
import com.kakrolot.service.tenant.api.TenantService;
import com.kakrolot.service.tenant.api.dto.TenantDTO;
import com.kakrolot.service.user.api.dto.UserDTO;
import com.kakrolot.web.controller.BaseController;
import com.kakrolot.web.convert.shop.ShopWebConvert;
import com.kakrolot.web.convert.tenant.TenantWebConverter;
import com.kakrolot.web.model.WebResponse;
import com.kakrolot.web.model.shop.ShopModel;
import com.kakrolot.web.model.tenant.TenantModel;
import com.kakrolot.web.model.tenant.TenantModelResponse;
import com.kakrolot.web.model.tenant.TenantShopCategoryModel;
import com.kakrolot.web.model.tenant.TenantShopModel;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/tenants")
@Slf4j
public class TenantController extends BaseController {

    @Autowired
    private TenantService tenantService;

    @Autowired
    private TenantShopCategoryService tenantShopCategoryService;

    @Autowired
    private ShopService shopService;

    @Autowired
    private ShopWebConvert shopWebConvert;

    @Autowired
    private TenantWebConverter tenantWebConverter;

    @Autowired
    private UserTenantService userTenantService;

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "添加租户", httpMethod = "POST")
    public WebResponse<String> save(@RequestBody TenantModel tenantModel) {
        String code = tenantModel.getCode();
        TenantDTO dbTenantDTO = tenantService.findByCode(code);
        if (dbTenantDTO != null) {
            return WebResponse.error("租户[" + code + "]已存在");
        }
        TenantDTO tenantDTO = tenantWebConverter.toDTO(tenantModel);
        tenantService.save(tenantDTO);
        return WebResponse.success("添加成功");
    }

    @RequestMapping(value = "/{id}/update", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "修改租户", httpMethod = "POST")
    public WebResponse<String> update(@PathVariable(name = "id") Long tenantId, @RequestBody TenantModel tenantModel) {
        TenantDTO tenantDTO = tenantService.findById(tenantId);
        String code = tenantModel.getCode();
        if (!tenantDTO.getCode().equals(code)) {
            TenantDTO dbTenantDTO = tenantService.findByCode(code);
            if (dbTenantDTO != null) {
                return WebResponse.error("租户[" + code + "]已存在");
            }
        }
        TenantDTO newTenant = tenantWebConverter.toDTO(tenantModel);
        newTenant.setId(tenantDTO.getId());
        tenantService.save(newTenant);
        return WebResponse.success("添加成功");
    }

    @RequestMapping(value = "/{id}/delete", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "删除租户", httpMethod = "POST")
    public WebResponse<String> delete(@PathVariable(name = "id") Long tenantId, @RequestBody TenantModel tenantModel) {
        TenantDTO tenantDTO = tenantService.findById(tenantId);
        tenantDTO.setActive(Constant.UNACTIVE);
        tenantService.save(tenantDTO);
        return WebResponse.success("删除成功");
    }

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "租户列表", httpMethod = "GET")
    public WebResponse<TenantModelResponse> list(@RequestParam("tenantName") String tenantName,
                                                 @RequestParam("page") Integer page,
                                                 @RequestParam("limit") Integer limit,
                                                 @RequestParam("sort") String sort) {
        List<TenantDTO> tenantDTOs = tenantService.getAllActive();
        return WebResponse.success(tenantWebConverter.translateDTOToModel(tenantDTOs));
    }

    @RequestMapping(value = "/currentList", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "当前登录用户的租户列表", httpMethod = "GET")
    public WebResponse<TenantModelResponse> currentList() {
        UserDTO userDTO = getCurrentUser();
        List<Long> tenantIdsByUserId = userTenantService.getTenantIdsByUserId(userDTO.getId());
        List<TenantDTO> tenantDTOs = tenantService.getAllActiveByIds(tenantIdsByUserId);
        return WebResponse.success(tenantWebConverter.translateDTOToModel(tenantDTOs));
    }

    @RequestMapping(value = "/{tenantId}/shop/update", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "给租户添加商品", httpMethod = "POST")
    public WebResponse<String> updateTenantShop(@PathVariable(name = "tenantId") Long tenantId, @RequestBody TenantShopModel tenantShopModel) {
//        List<Long> shopIds = tenantShopModel.getShopIds();
//        tenantShopService.saveTenantShop(shopIds, tenantId);
        return WebResponse.success("给租户添加商品成功");
    }

    @RequestMapping(value = "/{tenantId}/shopCategory/update", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "给租户添加商品", httpMethod = "POST")
    public WebResponse<String> updateTenantShopCategory(@PathVariable(name = "tenantId") Long tenantId, @RequestBody TenantShopCategoryModel tenantShopCategoryModel) {
        List<Long> shopCategoryIds = tenantShopCategoryModel.getShopCategoryIds();
        tenantShopCategoryService.saveTenantShopCategory(shopCategoryIds, tenantId);
        return WebResponse.success("给租户添加商品成功");
    }

    @RequestMapping(value = "/{tenantId}/shopList", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "某租户的商品列表", httpMethod = "GET")
    public WebResponse<List<ShopModel>> shopList(@PathVariable(name = "tenantId") Long tenantId) {
//        List<TenantShopDTO> byTenantIds = tenantShopService.findByTenantIds(Arrays.asList(tenantId));
//        List<Long> shopIds = byTenantIds.stream().map(TenantShopDTO::getShopId).collect(Collectors.toList());
//        List<ShopDTO> shopDTOList = shopService.findByIdsAndActive(shopIds);
//        return WebResponse.success(shopWebConvert.toModels(shopDTOList));
        return WebResponse.success(new ArrayList<>());
    }

}
