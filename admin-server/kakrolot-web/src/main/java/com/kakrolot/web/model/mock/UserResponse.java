package com.kakrolot.web.model.mock;

import lombok.*;

import java.util.List;

@Data
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private String name;

    private List<String> roles;

    private String introduction;

    private String avatar;

    private List<MenuResponse> menuList;

}
