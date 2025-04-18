package com.kakrolot.web.model.userPoint;

import com.kakrolot.web.model.BaseModel;
import lombok.Data;

/**
 * Created by caoti on 2021/8/5.
 */
@Data
public class AccountAndFinishModel extends BaseModel {

    private String channel;

    private String startTime;

    private String endTime;

}
