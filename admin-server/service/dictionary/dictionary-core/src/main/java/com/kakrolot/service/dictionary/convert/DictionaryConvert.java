package com.kakrolot.service.dictionary.convert;

import com.kakrolot.service.dictionary.dao.po.Dictionary;
import com.kakrolot.service.dictionary.dto.DictionaryDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author xiaofeidao
 * @date 2019/5/29
 */
@Component
public class DictionaryConvert {

    public Dictionary toPO(DictionaryDTO dictionaryDTO) {
        Dictionary dictionary = new Dictionary();
        BeanUtils.copyProperties(dictionaryDTO, dictionary);
        return dictionary;
    }

    public List<DictionaryDTO> toDTOs(List<Dictionary> dictionaries) {
        if (dictionaries == null) {
            return Collections.emptyList();
        }
        return dictionaries.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public DictionaryDTO toDTO(Dictionary dictionary) {
        DictionaryDTO dictionaryDTO = new DictionaryDTO();
        BeanUtils.copyProperties(dictionary, dictionaryDTO);
        return dictionaryDTO;
    }
}
