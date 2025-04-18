package com.kakrolot.service.shop.dao.repository;

import com.kakrolot.service.shop.dao.po.Shop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShopRepository extends JpaRepository<Shop, Long> {

    Shop findByCode(String code);

    Shop getById(Long shopId);

    List<Shop> findAllByShopGroupId(Long shopGroupId);

    List<Shop> findAllByActive(Boolean active);

    List<Shop> findByIdInAndActive(List<Long> ids, Boolean active);
}
