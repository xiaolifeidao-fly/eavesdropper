package com.kakrolot.service.common.convert;

import com.kakrolot.common.dto.BaseDTO;
import com.kakrolot.common.po.BasePO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
public abstract class CommonConvert<D extends BaseDTO, P extends BasePO> {

    private Class<D> dModelClazz;

    private Class<P> pModelClazz;

    public CommonConvert() {
        Type type = this.getClass().getGenericSuperclass();
        if (type instanceof ParameterizedType) {
            ParameterizedType pt = (ParameterizedType) type;
            dModelClazz = (Class) pt.getActualTypeArguments()[0];
            pModelClazz = (Class) pt.getActualTypeArguments()[1];
        }
    }

    public List<D> toDTOs(List<P> pos) {
        if (pos == null) {
            return Collections.emptyList();
        }
        return pos.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public D toDTO(P p) {
        try {
            if (p == null) {
                return null;
            }
            D d = dModelClazz.newInstance();
            BeanUtils.copyProperties(p, d);
            return d;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<P> toPos(List<D> dtoList) {
        if (dtoList == null) {
            return Collections.emptyList();
        }
        return dtoList.stream().map(this::toPo).collect(Collectors.toList());
    }

    public P toPo(D d) {
        try {
            P p = pModelClazz.newInstance();
            BeanUtils.copyProperties(d, p);
            if (p.getCreateTime() == null) {
                p.setCreateTime(new Date());
            }
            if (p.getUpdateTime() == null) {
                p.setUpdateTime(new Date());
            }
            return p;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
