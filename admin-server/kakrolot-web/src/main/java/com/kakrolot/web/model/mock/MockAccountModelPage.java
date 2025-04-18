package com.kakrolot.web.model.mock;

import com.kakrolot.web.model.BaseModel;
import lombok.*;

import java.util.List;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
    public class MockAccountModelPage extends BaseModel {

    private Integer total;

    private List<MockAccountModel> items;

}
