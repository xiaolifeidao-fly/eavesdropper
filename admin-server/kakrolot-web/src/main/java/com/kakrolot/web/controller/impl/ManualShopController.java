package com.kakrolot.web.controller.impl;

import com.kakrolot.service.shop.api.ManualShopService;
import com.kakrolot.service.shop.api.dto.ManualShopCategoryDTO;
import com.kakrolot.web.controller.BaseController;
import com.kakrolot.web.convert.manual.ManualShopConvert;
import com.kakrolot.web.model.WebResponse;
import com.kakrolot.web.model.manual.ManualShopCategoryModel;
import com.kakrolot.web.model.manual.ManualShopCategoryResponse;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shops/manual")
@Slf4j
public class ManualShopController extends BaseController {

    @Autowired
    private ManualShopService manualShopService;

    @Autowired
    private ManualShopConvert manualShopConvert;

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "添加人工商品", httpMethod = "POST")
    public WebResponse<List<Long>> save(@RequestBody ManualShopCategoryModel manualShopCategoryModel) {
        ManualShopCategoryDTO manualShopCategoryDTO = manualShopConvert.toManualShopCategoryDTO(manualShopCategoryModel);
        List<Long> ids = manualShopService.saveManualShopCategory(manualShopCategoryDTO);
        return WebResponse.success(ids);
    }

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "人工商品列表", httpMethod = "GET")
    public WebResponse<ManualShopCategoryResponse> list() {
        List<ManualShopCategoryDTO> manualShopCategories = manualShopService.findManualShopCategories();
        List<ManualShopCategoryModel> manualShopCategoryModelList = manualShopConvert.toManualShopCategoryModels(manualShopCategories);
        ManualShopCategoryResponse manualShopCategoryResponse = new ManualShopCategoryResponse();
        manualShopCategoryResponse.setTotal(manualShopCategoryModelList.size());
        manualShopCategoryResponse.setItems(manualShopCategoryModelList);
        return WebResponse.success(manualShopCategoryResponse);
    }

    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "删除人工商品", httpMethod = "POST")
    public WebResponse<List<Long>> delete(@RequestBody ManualShopCategoryModel manualShopCategoryModel) {
        ManualShopCategoryDTO manualShopCategoryDTO = manualShopConvert.toManualShopCategoryDTO(manualShopCategoryModel);
        List<Long> ids = manualShopService.deleteManualShopCategory(manualShopCategoryDTO);
        return WebResponse.success(ids);
    }

    @RequestMapping(value = "/expire", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "失效人工商品", httpMethod = "POST")
    public WebResponse<Long> expire(@RequestBody ManualShopCategoryModel manualShopCategoryModel) {
        ManualShopCategoryDTO manualShopCategoryDTO = manualShopConvert.toManualShopCategoryDTO(manualShopCategoryModel);
        Long shopCategoryId = manualShopService.expireManualShopCategory(manualShopCategoryDTO);
        return WebResponse.success(shopCategoryId);
    }

    @RequestMapping(value = "/active", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "启用人工商品", httpMethod = "POST")
    public WebResponse<Long> active(@RequestBody ManualShopCategoryModel manualShopCategoryModel) {
        ManualShopCategoryDTO manualShopCategoryDTO = manualShopConvert.toManualShopCategoryDTO(manualShopCategoryModel);
        Long shopCategoryId = manualShopService.activeManualShopCategory(manualShopCategoryDTO);
        return WebResponse.success(shopCategoryId);
    }


}
