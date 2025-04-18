package com.kakrolot.web.model.shop;

import com.kakrolot.web.model.BaseModel;
import lombok.*;

import java.util.List;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopModelResponse extends BaseModel {

    private Integer total;

    private List<ShopModel> items;
}
