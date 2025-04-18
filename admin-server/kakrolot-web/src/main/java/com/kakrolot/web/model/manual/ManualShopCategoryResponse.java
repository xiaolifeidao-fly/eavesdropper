package com.kakrolot.web.model.manual;

import com.kakrolot.web.model.BaseModel;
import lombok.*;

import java.util.List;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManualShopCategoryResponse extends BaseModel {

    private Integer total;

    private List<ManualShopCategoryModel> items;
}
