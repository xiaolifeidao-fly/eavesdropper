package com.kakrolot.web.model.mock;

import com.kakrolot.web.model.BaseModel;
import lombok.*;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockUserModel extends BaseModel {

    private String username;

    private String tenant;

    private String role;

}
