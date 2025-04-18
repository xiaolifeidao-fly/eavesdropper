package com.kakrolot.web.model;

import lombok.Data;

import java.util.List;

@Data
public class PageModel<T> {

    private Long total;

    private List<T> items;
}
