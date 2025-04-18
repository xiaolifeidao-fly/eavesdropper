package com.kakrolot.web.model.role;

import com.kakrolot.web.model.BaseModel;
import lombok.*;

import java.util.List;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleModelResponse extends BaseModel {

    private Integer total;

    private List<RoleModel> items;
}
