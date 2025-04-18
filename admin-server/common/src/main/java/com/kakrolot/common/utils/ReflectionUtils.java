package com.kakrolot.common.utils;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

/**
 *
 * @author xiaofeidao
 * @date 2019/4/27
 */
public class ReflectionUtils {

    /**
     * 循环向上转型, 获取对象的 DeclaredFields
     * @return 父类中的属性对象
     */
    public static Map<String,Field> getDeclaredFields(Class<?> clazz) {
        Map<String,Field> map = new HashMap<String,Field>();
        for(; clazz != Object.class; clazz = clazz.getSuperclass()) {
            try {
                Field[] fields = clazz.getDeclaredFields();
                for(Field f : fields){
                    f.setAccessible(true);
                    map.put(f.getName(),f);
                }
            } catch (Exception e) {
                //这里甚么都不要做！并且这里的异常必须这样写，不能抛出去。
                //如果这里的异常打印或者往外抛，则就不会执行clazz = clazz.getSuperclass(),最后就不会进入到父类中了
            }
        }
        return map;
    }

    /**
     * 循环向上转型, 获取对象的 DeclaredField
     * @return 父类中的属性对象
     */
    public static Field getDeclaredField(Class<?> clazz,String filedName) {
        for(; clazz != Object.class; clazz = clazz.getSuperclass()) {
            try {
                Field field = clazz.getDeclaredField(filedName);
                field.setAccessible(true);
                return field;
            } catch (Exception e) {
                //这里甚么都不要做！并且这里的异常必须这样写，不能抛出去。
                //如果这里的异常打印或者往外抛，则就不会执行clazz = clazz.getSuperclass(),最后就不会进入到父类中了
            }
        }
        return null;
    }
}
