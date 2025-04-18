package com.kakrolot.web.model.user;

import com.alibaba.fastjson.JSONObject;
import lombok.*;

import java.util.List;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuResponse {

    //路由路径
    private String path;

    //组件实例
    private String component;

    //root层的链接重定向的子链接
    private String redirect;

    //root第一层为true 其他false
    private boolean alwaysShow;

    //默认false
    private boolean hidden;

    //唯一标志
    private String name;

    //title icon等配置数据
    private JSONObject meta;

    private List<MenuResponse> children;

}
