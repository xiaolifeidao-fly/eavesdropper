package com.kakrolot.service.dictionary.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

/**
 * @author xiaofeidao
 * @date 2019/5/29
 */
@Table(name = "dictionary")
@Entity
@Data
public class Dictionary extends BasePO {

    private String code;

    private String value;

    private String description;

    private String type;

}
