package com.kakrolot.web.model.tenant;

import com.kakrolot.web.model.BaseModel;
import lombok.*;

import java.util.List;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantModelResponse extends BaseModel {

    private Integer total;

    private List<TenantModel> items;
}
