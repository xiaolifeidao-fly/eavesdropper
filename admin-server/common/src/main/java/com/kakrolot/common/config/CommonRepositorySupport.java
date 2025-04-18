package com.kakrolot.common.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.io.Serializable;
import java.math.BigInteger;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Created by xianglong on 2017/9/21.
 */
@Slf4j
public class CommonRepositorySupport<T, ID extends Serializable> extends SimpleJpaRepository<T, ID>
        implements CommonRepository<T, ID> {

    private EntityManager entityManager;

    private Class<T> domainClass;

    public CommonRepositorySupport(Class<T> domainClass, EntityManager entityManager) {
        super(domainClass, entityManager);
        this.domainClass = domainClass;
        this.entityManager = entityManager;
    }

    @Override
    public List<T> findByCondition(String sql, int startIndex, int pageSize, Map<String, Object> params) {
        sql = sql + " LIMIT :startIndex,:pageSize";
        javax.persistence.Query query = entityManager.createNativeQuery(sql, domainClass);
        startIndex = (startIndex - 1) * pageSize;
        query.setParameter("startIndex", startIndex);
        query.setParameter("pageSize", pageSize);
        fillParams(params, query);
        return query.getResultList();
    }

    @Override
    public <Z> List<Z> findByCondition(String sql, Map<String, Object> params, Class<Z> clazz) {
        javax.persistence.Query query = entityManager.createNativeQuery(sql, clazz);
        fillParams(params, query);
        return query.getResultList();
    }

    @Override
    public <Z> List<Z> findByCondition(String sql, int startIndex, int pageSize, Map<String, Object> params, Class<Z> clazz) {
        sql = sql + " LIMIT :startIndex,:pageSize";
        javax.persistence.Query query = entityManager.createNativeQuery(sql, clazz);
        startIndex = (startIndex - 1) * pageSize;
        query.setParameter("startIndex", startIndex);
        query.setParameter("pageSize", pageSize);
        fillParams(params, query);
        return query.getResultList();
    }

    @Override
    public long countByCondition(String sql, Map<String, Object> params) {
        javax.persistence.Query query = entityManager.createNativeQuery(sql);
        fillParams(params, query);
        BigInteger bigInteger = (BigInteger) query.getSingleResult();
        if (bigInteger != null) {
            return bigInteger.longValue();
        }
        return 0;
    }

    private void fillParams(Map<String, Object> params, Query query) {
        Set<Map.Entry<String, Object>> set = params.entrySet();
        for (Map.Entry<String, Object> entry : set) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
    }

}
