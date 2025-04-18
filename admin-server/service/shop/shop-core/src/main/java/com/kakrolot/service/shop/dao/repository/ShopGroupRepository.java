package com.kakrolot.service.shop.dao.repository;

import com.kakrolot.service.shop.dao.po.ShopGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShopGroupRepository extends JpaRepository<ShopGroup, Long> {

    ShopGroup findByCode(String code);

    ShopGroup getById(Long shopGroupId);

    ShopGroup findByBusinessType(String businessType);

    List<ShopGroup> findAllByBusinessCode(String businessCode);

    List<ShopGroup> findBySettleFlag(boolean settleFlag);

    List<ShopGroup> findByDashboardActive(boolean dashboardActive);
}
