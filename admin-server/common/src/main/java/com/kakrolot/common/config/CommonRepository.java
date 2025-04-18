package com.kakrolot.common.config;

import org.springframework.data.jpa.repository.JpaRepository;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * Created by xianglong on 2017/9/21.
 */
public interface CommonRepository<T,ID extends Serializable> extends JpaRepository<T,ID> {

    List<T> findByCondition(String sql, int startIndex, int pageSize, Map<String, Object> params);

    <Z> List<Z> findByCondition(String sql, Map<String, Object> params, Class<Z> clazz);

    <Z> List<Z> findByCondition(String sql, int startIndex, int pageSize, Map<String, Object> params, Class<Z> clazz);

    long countByCondition(String sql, Map<String, Object> params);
}
