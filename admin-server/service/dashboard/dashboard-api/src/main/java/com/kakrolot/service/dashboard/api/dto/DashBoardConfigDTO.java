package com.kakrolot.service.dashboard.api.dto;

import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

/**
 * Created by roc_peng on 2020/5/14.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */
@Data
public class DashBoardConfigDTO extends BaseDTO {

    private String title;

    private String businessType;

}
