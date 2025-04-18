package com.kakrolot.service.dictionary;

import com.kakrolot.service.dictionary.convert.DictionaryConvert;
import com.kakrolot.service.dictionary.dao.po.Dictionary;
import com.kakrolot.service.dictionary.dao.repository.DictionaryRepository;
import com.kakrolot.service.dictionary.dto.DictionaryDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author xiaofeidao
 * @date 2019/5/29
 */
@Service
@Slf4j
public class DictionaryServiceImpl implements DictionaryService {

    @Autowired
    private DictionaryRepository dictionaryRepository;

    @Autowired
    private DictionaryConvert dictionaryConvert;

    @Override
    public void save(DictionaryDTO dictionaryDTO) {
        Dictionary dictionary = dictionaryConvert.toPO(dictionaryDTO);
        dictionaryRepository.save(dictionary);
    }

    @Override
    public DictionaryDTO getByCode(String code) {
        Dictionary dictionary = dictionaryRepository.getByCode(code);
        if (dictionary == null) {
            return null;
        }
        return dictionaryConvert.toDTO(dictionary);
    }

    @Override
    public List<DictionaryDTO> getByType(String type) {
        List<Dictionary> dictionaries = dictionaryRepository.findByType(type);
        return dictionaryConvert.toDTOs(dictionaries);
    }
}
