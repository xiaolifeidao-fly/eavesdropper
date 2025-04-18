package com.kakrolot.web.model.userPoint;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

@Data
public class UserWithdrawRequestModel extends BaseModel {

    private String username;

    private Long userPointWithdrawRecordId;

    private String description;

}
