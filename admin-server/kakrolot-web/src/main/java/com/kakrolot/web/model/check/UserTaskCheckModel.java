package com.kakrolot.web.model.check;

import com.kakrolot.web.model.BaseModel;
import lombok.*;

import java.util.List;

/**
 * 上传的审核结果
 */
@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTaskCheckModel extends BaseModel {

    /**
     * blade平台的任务id task_instance_id
     */
    private List<Long> userTaskIds;

    /**
     * 审核结果:  DONE 成功 ERROR 失败
     */
    private String result;

}
