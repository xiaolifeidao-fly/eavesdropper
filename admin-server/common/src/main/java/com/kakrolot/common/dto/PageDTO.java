package com.kakrolot.common.dto;

import lombok.Data;

import java.util.List;

/**
 * @author xiaofeidao
 * @date 2019/7/16
 */
@Data
public class PageDTO<T> {

    private List<T> data;

    private Long total;
}
