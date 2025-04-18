package com.kakrolot.web.model.mock;

import com.kakrolot.web.model.BaseModel;
import lombok.*;

import java.util.List;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockShopModelPage extends BaseModel {

    private Integer total;

    private List<MockShopModel> items;


}
