package com.kakrolot.service.shop;

import com.kakrolot.common.utils.Constant;
import com.kakrolot.service.shop.api.ShopCategoryService;
import com.kakrolot.service.shop.api.dto.QueryShopCategoryDTO;
import com.kakrolot.service.shop.api.dto.ShopCategoryDTO;
import com.kakrolot.service.shop.convert.ShopCategoryConverter;
import com.kakrolot.service.shop.dao.po.ShopCategory;
import com.kakrolot.service.shop.dao.repository.ShopCategoryRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ShopCategoryServiceImpl implements ShopCategoryService {

    @Autowired
    private ShopCategoryConverter shopCategoryConverter;

    @Autowired
    private ShopCategoryRepository shopCategoryRepository;

    @Override
    public void save(ShopCategoryDTO dbShopCategoryDTO) {
        ShopCategory tenantShop = shopCategoryConverter.toPo(dbShopCategoryDTO);
        shopCategoryRepository.save(tenantShop);
    }

    @Override
    public ShopCategoryDTO findById(Long id) {
        ShopCategory tenantShop = shopCategoryRepository.getById(id);
        return shopCategoryConverter.toDTO(tenantShop);
    }

    @Override
    public List<ShopCategoryDTO> findByShopId(Long shopId) {
        List<ShopCategory> shopCategories = shopCategoryRepository.findAllByShopIdAndActive(shopId, true);
        return shopCategoryConverter.toDTOs(shopCategories);
    }

    @Override
    public List<ShopCategoryDTO> findByShopIdsIn(List<Long> shopIds) {
        List<ShopCategory> shopCategories = shopCategoryRepository.findAllByShopIdInAndActive(shopIds, true);
        return shopCategoryConverter.toDTOs(shopCategories);
    }

    @Override
    public List<ShopCategoryDTO> findAllByActive() {
        List<ShopCategory> allByActive = shopCategoryRepository.findAllByActive(Constant.ACTIVE);
        return shopCategoryConverter.toDTOs(allByActive);
    }

    @Override
    public Long countByCondition(QueryShopCategoryDTO queryShopCategoryDTO) {
        StringBuffer sql = new StringBuffer();
        sql.append("select count(1) ")
                .append("from shop_category t ")
                .append("where t.active = 1 ");
        fillWhere(queryShopCategoryDTO, sql);
        Map<String, Object> map = buildParams(queryShopCategoryDTO);
        return shopCategoryRepository.countByCondition(sql.toString(), map);
    }

    private void fillWhere(QueryShopCategoryDTO queryShopCategoryDTO, StringBuffer sql) {
        if (StringUtils.isNotBlank(queryShopCategoryDTO.getStatus())) {
            sql.append(" and t.status = :status");
        }
        if (queryShopCategoryDTO.getShopId() != null) {
            sql.append(" and t.shop_id = :shopId");
        }
    }

    private Map<String, Object> buildParams(QueryShopCategoryDTO queryShopCategoryDTO) {
        Map<String, Object> params = new HashMap<>();
        if (StringUtils.isNotBlank(queryShopCategoryDTO.getStatus())) {
            params.put("status", queryShopCategoryDTO.getStatus());
        }
        if (queryShopCategoryDTO.getShopId() != null) {
            params.put("shopId", queryShopCategoryDTO.getShopId());
        }
        return params;
    }

    @Override
    public List<ShopCategoryDTO> findByCondition(QueryShopCategoryDTO queryShopCategoryDTO) {
        StringBuffer sql = new StringBuffer();
        sql.append("select t.* ")
                .append("from shop_category t ")
                .append("where t.active = 1");
        fillWhere(queryShopCategoryDTO, sql);
        sql.append(" order by t.id desc ");
        Map<String, Object> map = buildParams(queryShopCategoryDTO);
        List<ShopCategory> tenantShops = shopCategoryRepository.findByCondition(sql.toString(), queryShopCategoryDTO.getStartIndex(), queryShopCategoryDTO.getPageSize(), map);
        return shopCategoryConverter.toDTOs(tenantShops);
    }

    @Override
    public ShopCategoryDTO findByShopIdAndSecretKey(Long shopId, String secretKey) {
        ShopCategory tenantShop = shopCategoryRepository.findByShopIdAndSecretKey(shopId, secretKey);
        return shopCategoryConverter.toDTO(tenantShop);
    }

    @Override
    public ShopCategoryDTO findBySecretKey(String secretKey) {
        ShopCategory shopCategory = shopCategoryRepository.findBySecretKey(secretKey);
        return shopCategoryConverter.toDTO(shopCategory);
    }

    @Override
    public List<ShopCategoryDTO> findByIdsAndActive(List<Long> ids) {
        List<ShopCategory> byIdInAndActive = shopCategoryRepository.findByIdInAndActive(ids, Constant.ACTIVE);
        return shopCategoryConverter.toDTOs(byIdInAndActive);
    }
}
