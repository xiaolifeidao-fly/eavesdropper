package com.kakrolot.common.utils;

import org.springframework.beans.BeanUtils;
import org.springframework.lang.Nullable;
import org.springframework.util.CollectionUtils;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author caoti
 * @date 2019/3/12
 */

public interface BladeConverter<SOURCE,TARGET> {

    @Nullable
    default SOURCE toSource(TARGET target){
        if(target == null) {
            return null;
        }
        SOURCE source = null;
        try {
            Type type = this.getClass().getGenericInterfaces()[0];
            ParameterizedType pt = (ParameterizedType)type;
            Class modelClass = (Class)pt.getActualTypeArguments()[0];
            source = (SOURCE) modelClass.getConstructor().newInstance();
        } catch (Exception e) {
            e.printStackTrace();
        }
        BeanUtils.copyProperties(target,source);
        return source;
    }

    @Nullable
    default TARGET toTarget(SOURCE source) {
        if(source == null) {
            return null;
        }
        TARGET target = null;
        try {
            Type type = this.getClass().getGenericInterfaces()[0];
            ParameterizedType pt = (ParameterizedType)type;
            Class modelClass = (Class)pt.getActualTypeArguments()[1];
            target = (TARGET) modelClass.getConstructor().newInstance();
        } catch (Exception e) {
            e.printStackTrace();
        }
        BeanUtils.copyProperties(source,target);
        return target;
    }

    @Nullable
    default List<SOURCE> toSourceList(List<TARGET> targetList){
        if(CollectionUtils.isEmpty(targetList)){
            return Collections.emptyList();
        }
        return targetList.stream().map(this::toSource).collect(Collectors.toList());
    }

    @Nullable
    default List<TARGET> toTargetList(List<SOURCE> sourceList){
        if(CollectionUtils.isEmpty(sourceList)){
            return Collections.emptyList();
        }
        return sourceList.stream().map(this::toTarget).collect(Collectors.toList());
    }

}
