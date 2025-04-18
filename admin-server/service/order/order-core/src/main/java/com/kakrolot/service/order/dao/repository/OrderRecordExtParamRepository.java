package com.kakrolot.service.order.dao.repository;

import com.kakrolot.service.order.dao.po.OrderRecordExtParam;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRecordExtParamRepository extends JpaRepository<OrderRecordExtParam, Long> {

    OrderRecordExtParam getById(Long id);

    OrderRecordExtParam findByOrderRecordId(Long orderRecordId);

}
