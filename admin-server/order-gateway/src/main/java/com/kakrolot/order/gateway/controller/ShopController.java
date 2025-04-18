package com.kakrolot.order.gateway.controller;

import com.kakrolot.order.gateway.model.ShopModel;
import com.kakrolot.order.gateway.model.WebResponse;
import com.kakrolot.service.shop.api.ShopCategoryService;
import com.kakrolot.service.shop.api.dto.ShopCategoryDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/shops")
@Slf4j
public class ShopController extends BaseController {

    @Autowired
    private ShopCategoryService shopCategoryService;

  /*  @RequestMapping(value = "/{shopCategoryId}", method = RequestMethod.GET)
    @ResponseBody*/
    public WebResponse<ShopModel> getById(@PathVariable("shopCategoryId") Long shopCategoryId) {
        ShopCategoryDTO shopCategoryDTO = shopCategoryService.findById(shopCategoryId);
        if (shopCategoryDTO == null) {
            return WebResponse.error("未找到商品");
        }
        ShopModel shopModel = new ShopModel();
        shopModel.setPrice(shopCategoryDTO.getPrice());
        shopModel.setName(shopCategoryDTO.getName());
        shopModel.setLowerLimit(shopCategoryDTO.getLowerLimit());
        shopModel.setUpperLimit(shopCategoryDTO.getUpperLimit());
        return WebResponse.success(shopModel);
    }


}
