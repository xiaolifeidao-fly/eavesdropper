package com.kakrolot.reader;

import org.apache.commons.lang3.time.DateUtils;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.text.ParseException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * 属性值转换器
 * Created by xianglong on 2017/8/9.
 */
public class ConvertValueUtils {

    private static Map<Class, Method> map = new HashMap<>();

    static {
        try {
            initFieldType(Double.class, "switchDouble");
            initFieldType(double.class, "switchDouble");
            initFieldType(Float.class, "switchFloat");
            initFieldType(float.class, "switchFloat");
            initFieldType(Short.class, "switchShort");
            initFieldType(short.class, "switchShort");
            initFieldType(Boolean.class, "switchBoolean");
            initFieldType(boolean.class, "switchBoolean");
            initFieldType(Integer.class, "switchInt");
            initFieldType(int.class, "switchInt");
            initFieldType(Long.class, "switchLong");
            initFieldType(long.class, "switchLong");
            initFieldType(Date.class, "switchDate");
            initFieldType(BigDecimal.class, "switchBigDecimal");
        } catch (NoSuchMethodException e) {
            throw new RuntimeException(e);
        }
    }

    private static void initFieldType(Class clazz, String methodName) throws NoSuchMethodException {
        Method method = ConvertValueUtils.class.getDeclaredMethod(methodName, String.class);
        map.put(clazz, method);
    }

    public static Object convert(Class type, String value) {
        try {
            Method method = map.get(type);
            if (method == null) {
                return value;
            }
            return method.invoke(null, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static double switchDouble(String value) {
        return Double.parseDouble(value);
    }

    public static int switchInt(String value) {
        return Integer.parseInt(value);
    }

    public static long switchLong(String value) {
        return Long.parseLong(value);
    }

    public static boolean switchBoolean(String value) {
        return Boolean.parseBoolean(value);
    }

    public static short switchShort(String value) {
        return Short.parseShort(value);
    }

    public static float switchFloat(String value) {
        return Float.parseFloat(value);
    }

    public static Date switchDate(String value) throws ParseException {
        if(value.length() == 10){
            return DateUtils.parseDate(value, "yyyy-MM-dd");
        }
        return DateUtils.parseDate(value, "yyyy-MM-dd HH:mm:ss");
    }

    public static BigDecimal switchBigDecimal(String value) {
        return  new BigDecimal(value);
    }

}
