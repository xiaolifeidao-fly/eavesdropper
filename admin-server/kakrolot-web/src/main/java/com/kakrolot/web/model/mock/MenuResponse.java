package com.kakrolot.web.model.mock;

import com.alibaba.fastjson.JSONObject;
import lombok.*;

import java.util.List;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuResponse {

    private String path;

    private String component;

    private String redirect;

    private boolean alwaysShow;

    private boolean hidden;

    private String name;

    private JSONObject meta;

    private List<MenuResponse> children;

}
