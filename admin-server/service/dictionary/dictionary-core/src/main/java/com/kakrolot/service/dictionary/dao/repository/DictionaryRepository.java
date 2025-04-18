package com.kakrolot.service.dictionary.dao.repository;

import com.kakrolot.service.dictionary.dao.po.Dictionary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author xiaofeidao
 * @date 2019/5/29
 */
public interface DictionaryRepository extends JpaRepository<Dictionary, Long> {

    Dictionary getById(Long id);

    Dictionary getByCode(String code);

    List<Dictionary> findByType(String type);
}
