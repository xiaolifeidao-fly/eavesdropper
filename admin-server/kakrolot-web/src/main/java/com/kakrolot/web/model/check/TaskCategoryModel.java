package com.kakrolot.web.model.check;

import com.kakrolot.web.model.BaseModel;
import lombok.*;

/**
 * 任务种类
 */
@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskCategoryModel extends BaseModel {

    private Long shopId;

    private String code;

    private String name;

}
