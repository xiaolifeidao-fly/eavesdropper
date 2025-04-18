package com.kakrolot.web.controller.impl;

import com.kakrolot.business.service.user.UserTenantService;
import com.kakrolot.common.utils.Constant;
import com.kakrolot.common.utils.MD5;
import com.kakrolot.service.shop.api.*;
import com.kakrolot.service.shop.api.dto.*;
import com.kakrolot.service.user.api.dto.UserDTO;
import com.kakrolot.web.controller.BaseController;
import com.kakrolot.web.convert.shop.ShopCategoryWebConvert;
import com.kakrolot.web.convert.shop.ShopExtParamWebConvert;
import com.kakrolot.web.convert.shop.ShopWebConvert;
import com.kakrolot.web.model.PageModel;
import com.kakrolot.web.model.WebResponse;
import com.kakrolot.web.model.shop.ShopCategoryModel;
import com.kakrolot.web.model.shop.ShopExtParamModel;
import com.kakrolot.web.model.shop.ShopModel;
import com.kakrolot.web.model.shop.ShopModelResponse;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/shops")
@Slf4j
public class ShopController extends BaseController {

    @Autowired
    private ShopExtParamService shopExtParamService;

    @Autowired
    private ShopService shopService;

    @Autowired
    private ShopWebConvert shopWebConvert;

    @Autowired
    private ShopCategoryWebConvert shopCategoryWebConvert;

    @Autowired
    private TenantShopCategoryService tenantShopCategoryService;

    @Autowired
    private ShopCategoryService shopCategoryService;

    @Autowired
    private UserTenantService userTenantService;

    @Autowired
    private ShopExtParamWebConvert shopExtParamWebConvert;

    @Autowired
    private ShopCategoryChangeService shopCategoryChangeService;

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "添加商品", httpMethod = "POST")
    public WebResponse<String> save(@RequestBody ShopModel shopModel) {
        String code = shopModel.getCode();
        ShopDTO dbShopDTO = shopService.findByCode(code);
        if (dbShopDTO != null) {
            return WebResponse.error("商品[" + code + "]已存在");
        }
        ShopDTO shopDTO = shopWebConvert.toDTO(shopModel);
        shopService.save(shopDTO);
        return WebResponse.success("添加成功");
    }

    @RequestMapping(value = "/{id}/update", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "修改商品", httpMethod = "POST")
    public WebResponse<String> update(@PathVariable(name = "id") Long shopId, @RequestBody ShopModel shopModel) {
        ShopDTO shopDTO = shopService.findById(shopId);
        String code = shopModel.getCode();
        if (!shopModel.getCode().equals(code)) {
            ShopDTO dbShopDTO = shopService.findByCode(code);
            if (dbShopDTO != null) {
                return WebResponse.error("商品[" + code + "]已存在");
            }
        }
        ShopDTO newShop = shopWebConvert.toDTO(shopModel);
        newShop.setId(shopDTO.getId());
        shopService.save(newShop);
        return WebResponse.success("添加成功");
    }

    @RequestMapping(value = "/{id}/delete", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "删除商品", httpMethod = "POST")
    public WebResponse<String> delete(@PathVariable(name = "id") Long shopId, @RequestBody ShopModel shopModel) {
        ShopDTO shopDTO = shopService.findById(shopId);
        shopDTO.setActive(Constant.UNACTIVE);
        shopService.save(shopDTO);
        return WebResponse.success("删除成功");
    }

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "商品列表", httpMethod = "GET")
    public WebResponse<ShopModelResponse> list() {
        List<ShopDTO> shopDTOs = shopService.getAllActiveFromBarry();
        ShopModelResponse shopModelResponse = ShopModelResponse.builder()
                .items(shopWebConvert.toModels(shopDTOs)).total(shopDTOs.size()).build();
        return WebResponse.success(shopModelResponse);
    }

    @RequestMapping(value = "/currentList", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "当前登录用户的商品列表", httpMethod = "GET")
    public WebResponse<List<ShopModel>> currentList() {
//        UserDTO userDTO = getCurrentUser();
//        List<Long> tenantIdsByUserId = userTenantService.getTenantIdsByUserId(userDTO.getId());
//        List<TenantShopDTO> byTenantIds = tenantShopService.findByTenantIds(tenantIdsByUserId);
//        List<Long> shopIds = byTenantIds.stream().map(TenantShopDTO::getShopId).collect(Collectors.toList());
//        List<ShopDTO> shopDTOList = shopService.findByIdsAndActive(shopIds);
//        return WebResponse.success(shopWebConvert.toShopModels(shopDTOList));
        return WebResponse.success(new ArrayList<>());
    }

    @RequestMapping(value = "/shopCategory/currentList", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "当前登录用户的商品列表", httpMethod = "GET")
    public WebResponse<List<ShopCategoryModel>> shopCategoryCurrentList() {
        UserDTO userDTO = getCurrentUser();
        List<Long> tenantIdsByUserId = userTenantService.getTenantIdsByUserId(userDTO.getId());
        List<TenantShopCategoryDTO> tenantShopCategoryDTOList = tenantShopCategoryService.findByTenantIds(tenantIdsByUserId);
        List<Long> shopCategoryIds = tenantShopCategoryDTOList.stream().map(TenantShopCategoryDTO::getShopCategoryId).collect(Collectors.toList());
        List<ShopCategoryDTO> shopCategoryDTOList = shopCategoryService.findByIdsAndActive(shopCategoryIds);
        return WebResponse.success(shopCategoryWebConvert.toModels(shopCategoryDTOList));
    }

    @RequestMapping(value = "/shopCategoryList", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "商品分类列表", httpMethod = "GET")
    public WebResponse<PageModel<ShopCategoryModel>> shopCategoryList(ShopCategoryModel tenantShop,
                                                                    @RequestParam("page") int startIndex,
                                                                    @RequestParam("limit") int pageSize,
                                                                    @RequestParam("sort") String sort) {
        QueryShopCategoryDTO queryShopCategoryDTO = shopCategoryWebConvert.toQueryDTO(tenantShop, startIndex, pageSize);
        Long count = shopCategoryService.countByCondition(queryShopCategoryDTO);
        List<ShopCategoryModel> shopCategoryModelList = null;
        if (count > 0) {
            List<ShopCategoryDTO> shopCategoryDTOS = shopCategoryService.findByCondition(queryShopCategoryDTO);
            shopCategoryModelList = shopCategoryWebConvert.translateTenantShopDTOToTenantShopModelResponse(shopCategoryDTOS);
        }
        return WebResponse.success(shopCategoryWebConvert.toPageModel(count, shopCategoryModelList));
    }

    @RequestMapping(value = "/{shopId}/categories", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "某商品子类列表", httpMethod = "GET")
    public WebResponse<List<ShopCategoryModel>> shopCategoryList(@PathVariable(name = "shopId") Long shopId) {
        List<ShopCategoryDTO> shopCategoryDTOS = shopCategoryService.findByShopId(shopId);
        return WebResponse.success(shopCategoryWebConvert.translateTenantShopDTOToTenantShopModelResponse(shopCategoryDTOS));
    }

    /*@RequestMapping(value = "/{shopCategoryId}/category", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "某商品子类列表", httpMethod = "GET")
    public WebResponse<List<ShopCategoryModel>> shopCategoryList(@PathVariable(name = "shopCategoryId") Long shopCategoryId) {
        List<ShopCategoryDTO> shopCategoryDTOS = shopCategoryService.findByShopId(shopId);
        return WebResponse.success(shopCategoryWebConvert.translateTenantShopDTOToTenantShopModelResponse(shopCategoryDTOS));
    }*/

    @RequestMapping(value = "/{shopId}/categories/add", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "添加", httpMethod = "POST")
    public WebResponse<String> addCategory(@PathVariable(name = "shopId") Long shopId, @RequestBody ShopCategoryModel shopCategoryModel) {
        ShopCategoryDTO dbShopCategoryDTO = new ShopCategoryDTO();
        String secretKey = MD5.toMD5(UUID.randomUUID().toString());
        dbShopCategoryDTO.setSecretKey(secretKey);
        dbShopCategoryDTO.setShopId(shopId);
        dbShopCategoryDTO.setStatus(TenantShopStatus.ACTIVE.name());
        dbShopCategoryDTO.setPrice(shopCategoryModel.getPrice());
        dbShopCategoryDTO.setName(shopCategoryModel.getName());
        dbShopCategoryDTO.setLowerLimit(shopCategoryModel.getLowerLimit());
        dbShopCategoryDTO.setUpperLimit(shopCategoryModel.getUpperLimit());
        dbShopCategoryDTO.setBarryShopCategoryCode(shopCategoryModel.getBarryShopCategoryCode());
        shopCategoryService.save(dbShopCategoryDTO);
        return WebResponse.success("上架成功");
    }

    @RequestMapping(value = "/categories/{shopCategoryId}/expire", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "下架", httpMethod = "POST")
    public WebResponse<String> unBindTenant(@PathVariable(name = "shopCategoryId") Long shopCategoryId) {
        ShopCategoryDTO dbShopCategoryDTO = shopCategoryService.findById(shopCategoryId);
        if (dbShopCategoryDTO == null) {
            return WebResponse.success("窗口不存在");
        }
        dbShopCategoryDTO.setStatus(TenantShopStatus.EXPIRE.name());
        shopCategoryService.save(dbShopCategoryDTO);
        return WebResponse.success("下架成功");
    }

    @RequestMapping(value = "/categories/{shopCategoryId}/active", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "上架", httpMethod = "POST")
    public WebResponse<String> bindTenant(@PathVariable(name = "shopCategoryId") Long shopCategoryId) {
        ShopCategoryDTO dbShopCategoryDTO = shopCategoryService.findById(shopCategoryId);
        if (dbShopCategoryDTO == null) {
            return WebResponse.success("窗口不存在");
        }
        dbShopCategoryDTO.setStatus(TenantShopStatus.ACTIVE.name());
        shopCategoryService.save(dbShopCategoryDTO);
        return WebResponse.success("下架成功");
    }

    @RequestMapping(value = "/categories/{shopCategoryId}/update", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "编辑窗口", httpMethod = "POST")
    public WebResponse<String> updateTenantShop(@PathVariable(name = "shopCategoryId") Long shopCategoryId, @RequestBody ShopCategoryModel shopCategoryModel) {
        ShopCategoryDTO dbShopCategoryDTO = shopCategoryService.findById(shopCategoryId);
        if (dbShopCategoryDTO == null) {
            return WebResponse.success("窗口不存在");
        }
        ShopCategoryDTO oldShopCategoryDTO = shopCategoryService.findById(shopCategoryId);
        UserDTO currentUser = getCurrentUser();
        dbShopCategoryDTO.setPrice(shopCategoryModel.getPrice());
        dbShopCategoryDTO.setName(shopCategoryModel.getName());
        dbShopCategoryDTO.setLowerLimit(shopCategoryModel.getLowerLimit());
        dbShopCategoryDTO.setUpperLimit(shopCategoryModel.getUpperLimit());
        dbShopCategoryDTO.setBarryShopCategoryCode(shopCategoryModel.getBarryShopCategoryCode());
        shopCategoryService.save(dbShopCategoryDTO);
        saveShopCategoryChange(currentUser,oldShopCategoryDTO,dbShopCategoryDTO);
        return WebResponse.success("编辑成功");
    }

    /**
     * 保存租户商品变更记录
     * @param currentUser
     * @param oldShopCategoryDTO
     * @param newShopCategoryDTO
     */
    private void saveShopCategoryChange(UserDTO currentUser,ShopCategoryDTO oldShopCategoryDTO,ShopCategoryDTO newShopCategoryDTO){
        ShopCategoryChangeDTO shopCategoryChangeDTO = new ShopCategoryChangeDTO();
        shopCategoryChangeDTO.setCreateBy(currentUser.getUsername());
        shopCategoryChangeDTO.setUpdateBy(currentUser.getUsername());
        shopCategoryChangeDTO.setCreateTime(new Date());
        shopCategoryChangeDTO.setUpdateTime(new Date());
        shopCategoryChangeDTO.setUserId(currentUser.getId());
        shopCategoryChangeDTO.setShopId(oldShopCategoryDTO.getShopId());
        shopCategoryChangeDTO.setShopCategoryId(oldShopCategoryDTO.getId());
        shopCategoryChangeDTO.setShopCategoryName(oldShopCategoryDTO.getName());
        shopCategoryChangeDTO.setOldPrice(oldShopCategoryDTO.getPrice());
        shopCategoryChangeDTO.setNewPrice(newShopCategoryDTO.getPrice());
        shopCategoryChangeDTO.setOldLowerLimit(oldShopCategoryDTO.getLowerLimit());
        shopCategoryChangeDTO.setNewLowerLimit(newShopCategoryDTO.getLowerLimit());
        shopCategoryChangeDTO.setOldUpperLimit(oldShopCategoryDTO.getUpperLimit());
        shopCategoryChangeDTO.setNewUpperLimit(newShopCategoryDTO.getUpperLimit());
        shopCategoryChangeService.save(shopCategoryChangeDTO);
    }

    @RequestMapping(value = "/{shopId}/shopExtParam", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "某商品附加属性列表", httpMethod = "GET")
    public WebResponse<List<ShopExtParamModel>> shopExtParamList(@PathVariable(name = "shopId") Long shopId) {
        List<ShopExtParamDTO> shopExtParamList = shopExtParamService.findByShopId(shopId);
        return WebResponse.success(shopExtParamWebConvert.toShopExtParamModels(shopExtParamList));
    }

}
