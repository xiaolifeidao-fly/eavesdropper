package com.kakrolot.web.model.order;

import com.kakrolot.web.model.BaseModel;
import lombok.*;

import java.util.List;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRecordModelResponse extends BaseModel {

    private Integer total;

    private List<OrderRecordModel> items;

}
