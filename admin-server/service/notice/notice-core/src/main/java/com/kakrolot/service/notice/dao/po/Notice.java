package com.kakrolot.service.notice.dao.po;

import com.kakrolot.common.po.BasePO;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "notice")
public class Notice extends BasePO {

    private String title;

    private String content;

}
