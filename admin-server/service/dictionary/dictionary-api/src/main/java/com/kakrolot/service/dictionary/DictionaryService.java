package com.kakrolot.service.dictionary;

import com.kakrolot.service.dictionary.dto.DictionaryDTO;

import java.util.List;

/**
 * @author xiaofeidao
 * @date 2019/5/29
 */
public interface DictionaryService {

    /**
     * 保存
     * @param dictionaryDTO
     */
    void save(DictionaryDTO dictionaryDTO);

    /**
     * @param code
     * @return
     */
    DictionaryDTO getByCode(String code);


    List<DictionaryDTO> getByType(String name);
}
