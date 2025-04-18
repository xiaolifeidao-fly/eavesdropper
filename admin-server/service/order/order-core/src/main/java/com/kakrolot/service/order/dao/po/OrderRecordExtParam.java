package com.kakrolot.service.order.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "order_record_ext_param")
public class OrderRecordExtParam extends BasePO {

    private Long orderRecordId;

    private String innerParams;

    private String params;

}
