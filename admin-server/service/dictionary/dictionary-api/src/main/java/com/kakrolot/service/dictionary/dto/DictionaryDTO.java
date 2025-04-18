package com.kakrolot.service.dictionary.dto;


import com.kakrolot.common.dto.BaseDTO;
import lombok.Data;

/**
 * @author xiaofeidao
 * @date 2019/5/29
 */
@Data
public class DictionaryDTO extends BaseDTO {

    private String code;

    private String value;

    private String description;

    private String type;

}
