package com.kakrolot.service.shop;

import com.kakrolot.common.utils.Constant;
import com.kakrolot.service.shop.api.TenantShopService;
import com.kakrolot.service.shop.api.dto.TenantShopDTO;
import com.kakrolot.service.shop.convert.TenantShopConverter;
import com.kakrolot.service.shop.dao.po.TenantShop;
import com.kakrolot.service.shop.dao.repository.TenantShopRepository;
import com.kakrolot.service.tenant.api.TenantService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class TenantShopServiceImpl implements TenantShopService {

    @Autowired
    private TenantShopConverter tenantShopConverter;

    @Autowired
    private TenantShopRepository tenantShopRepository;

    @Autowired
    private TenantService tenantService;

    @Override
    public List<TenantShopDTO> findByTenantIds(List<Long> tenantIds) {
        List<TenantShop> tenantShops = tenantShopRepository.findByTenantIdIn(tenantIds);
        return tenantShopConverter.toDTOs(tenantShops);
    }

    @Override
    public List<TenantShopDTO> findByTenantIdsAndShopId(List<Long> tenantIds, Long shopId) {
        List<TenantShop> tenantShops = tenantShopRepository.findByTenantIdInAndShopId(tenantIds, shopId);
        return tenantShopConverter.toDTOs(tenantShops);
    }

    @Override
    @Transactional
    public void saveTenantShop(List<Long> shopIds, Long tenantId) {
        tenantShopRepository.deleteAllByTenantId(tenantId);
        if (shopIds == null || shopIds.size() == 0) {
            return;
        }
        for (Long shopId : shopIds) {
            TenantShop tenantShop = new TenantShop();
            tenantShop.setTenantId(tenantId);
            tenantShop.setShopId(shopId);
            tenantShop.setActive(Constant.ACTIVE);
            tenantShopRepository.save(tenantShop);
        }
    }

    @Override
    public TenantShopDTO findById(Long tenantShopId) {
        TenantShop tenantShop = tenantShopRepository.getById(tenantShopId);
        return tenantShopConverter.toDTO(tenantShop);
    }

}
