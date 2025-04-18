package com.kakrolot.service.shop.dao.repository;

import com.kakrolot.service.shop.dao.po.ShopExtParam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShopExtParamRepository extends JpaRepository<ShopExtParam, Long> {

    ShopExtParam getById(Long id);

    List<ShopExtParam> findByShopId(Long shopId);

}
