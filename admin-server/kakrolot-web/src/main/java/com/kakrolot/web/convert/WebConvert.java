package com.kakrolot.web.convert;

import com.kakrolot.common.dto.BaseDTO;
import com.kakrolot.web.model.BaseModel;
import org.springframework.beans.BeanUtils;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public abstract class WebConvert<D extends BaseDTO, M extends BaseModel> {

    private Class<D> dModelClazz;

    private Class<M> mModelClazz;

    public WebConvert(){
        Type type = this.getClass().getGenericSuperclass();
        if (type instanceof ParameterizedType) {
            ParameterizedType pt = (ParameterizedType)type;
            dModelClazz = (Class)pt.getActualTypeArguments()[0];
            mModelClazz = (Class)pt.getActualTypeArguments()[1];
        }
    }

    public List<D> toDTOs(List<M> ms) {
        if (ms == null) {
            return Collections.emptyList();
        }
        return ms.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public D toDTO(M m) {
        try {
            D d = dModelClazz.newInstance();
            BeanUtils.copyProperties(m, d);
            return d;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<M> toModels(List<D> dtoList) {
        if (dtoList == null) {
            return Collections.emptyList();
        }
        return dtoList.stream().map(this::toModel).collect(Collectors.toList());
    }

    public M toModel(D d) {
        try {
            M p = mModelClazz.newInstance();
            BeanUtils.copyProperties(d, p);
            return p;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
