package com.kakrolot.service.shop;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.common.utils.Constant;
import com.kakrolot.service.shop.api.ShopGroupService;
import com.kakrolot.service.shop.api.ShopService;
import com.kakrolot.service.shop.api.dto.ShopDTO;
import com.kakrolot.service.shop.api.dto.ShopGroupDTO;
import com.kakrolot.service.shop.convert.ShopConverter;
import com.kakrolot.service.shop.dao.po.Shop;
import com.kakrolot.service.shop.dao.repository.ShopRepository;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ShopServiceImpl implements ShopService {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ShopConverter shopConverter;

    @Autowired
    private ShopGroupService shopGroupService;

    @Value("${barry.url.inner.prefix:http://127.0.0.1:9999}")
    private String barryInnerPrefix;

    @Value("${barry.url.inner.shop.suffix:/shops/shopTypes}")
    private String barryInnerShopSuffix;

    @Override
    public ShopDTO findByCode(String code) {
        Shop shop = shopRepository.findByCode(code);
        return shopConverter.toDTO(shop);
    }

    @Override
    public void save(ShopDTO shopDTO) {
        Shop shop = shopConverter.toPo(shopDTO);
        shopRepository.save(shop);
    }

    @Override
    public ShopDTO findById(Long shopId) {
        Shop shop = shopRepository.getById(shopId);
        return shopConverter.toDTO(shop);
    }

    @Override
    public List<ShopDTO> getAll() {
        List<Shop> shops = shopRepository.findAll();
        return shopConverter.toDTOs(shops);
    }

    @Override
    public List<ShopDTO> getAllActive() {
        List<Shop> allByActive = shopRepository.findAllByActive(Constant.ACTIVE);
        return shopConverter.toDTOs(allByActive);
    }

    @Override
    public List<ShopDTO> getAllActiveFromBarry() {
        String url = barryInnerPrefix + barryInnerShopSuffix;
        Response response = null;
        List<ShopDTO> shopDTOList = new ArrayList<>();
        try {
            response = OkHttpUtils.doGetLongTimeout(url, new JSONObject());
            String result = response.body().string();
            JSONObject jsonObject = JSONObject.parseObject(result);
            JSONArray types = jsonObject.getJSONArray("data");
            for(int i=0;i<types.size();i++) {
                JSONObject type = types.getJSONObject(i);
                ShopDTO shopDTO = new ShopDTO();
                shopDTO.setId(type.getLong("id"));
                shopDTO.setName(type.getString("name"));
                shopDTO.setCode(type.getString("code"));
                shopDTO.setShopGroupId(type.getLong("shopGroupId"));
                shopDTOList.add(shopDTO);
            }
        }catch (Exception e) {
            log.error("getAllActiveFromBarry-error,e is {}", e.toString());
        }
        return shopDTOList;
    }

    @Override
    public List<ShopDTO> findByIdsAndActive(List<Long> ids) {
        List<Shop> byIdInAndActive = shopRepository.findByIdInAndActive(ids, Constant.ACTIVE);
        return shopConverter.toDTOs(byIdInAndActive);
    }

    @Override
    public List<ShopDTO> findAllByShopGroupId(Long shopGroupId) {
        List<Shop> allByShopGroupId = shopRepository.findAllByShopGroupId(shopGroupId);
        return shopConverter.toDTOs(allByShopGroupId);
    }

    @Override
    public List<ShopDTO> findAllByBusinessType(String businessType) {
        ShopGroupDTO shopGroupDTO = shopGroupService.findByBusinessType(businessType);
        if(shopGroupDTO == null) {
            return Collections.emptyList();
        }
        return findAllByShopGroupId(shopGroupDTO.getId());
    }

    @Override
    public List<ShopDTO> findAllByBusinessCode(String businessCode) {
        List<ShopGroupDTO> shopGroupDTOList = shopGroupService.findAllByBusinessCode(businessCode);
        return shopGroupDTOList.stream().flatMap(shopGroupDTO -> {
            return findAllByBusinessType(shopGroupDTO.getBusinessType()).stream();
        }).collect(Collectors.toList());
    }
}
