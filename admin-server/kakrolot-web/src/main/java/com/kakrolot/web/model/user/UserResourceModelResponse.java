package com.kakrolot.web.model.user;

import lombok.*;

import java.util.List;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResourceModelResponse {

    private String name;

    private String avatar;

    private String introduction;

    private String amount;

    private List<String> roles;

    //菜单配置列表
    private List<UserResourceModel> menuList;

    //按钮权限平铺后的数据
    private List<String> buttonList;

}
