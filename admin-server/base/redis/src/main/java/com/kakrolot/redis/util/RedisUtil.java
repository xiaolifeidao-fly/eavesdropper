package com.kakrolot.redis.util;

import com.alibaba.fastjson.JSON;
import com.dyuproject.protostuff.LinkedBuffer;
import com.dyuproject.protostuff.ProtostuffIOUtil;
import com.dyuproject.protostuff.runtime.RuntimeSchema;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import redis.clients.jedis.*;
import redis.clients.jedis.exceptions.JedisDataException;
import redis.clients.jedis.params.geo.GeoRadiusParam;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

/**
 * @author caoti
 * @date 2018/9/14
 */
@Component
@Slf4j
public class RedisUtil {

    @Autowired
    private JedisPool jedisPool;

    // setex的默认时间
    private static final int DEFAULT_SETEX_TIMEOUT = 60 * 60;

    public Jedis getJedis() {
        try {
            return jedisPool.getResource();
        } catch (Exception e) {
            log.error("getJedis() throws : {}" + e.getMessage());
        }
        return null;
    }

    public void closeJedis(Jedis jedis) {
        if (jedis != null) {
            jedis.close();
        }
    }

    public void lpush(String key, String value) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            jedis.lpush(key, value);
        } finally {
            closeJedis(jedis);
        }
    }

    public Long zadd(String key, long time, String value) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.zadd(key, time, value);
        } finally {
            closeJedis(jedis);
        }
    }

    public String rpop(String key) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.rpop(key);
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 添加一个字符串值,成功返回1,失败返回0
     *
     * @param key
     * @param value
     * @return
     */
    public int set(String key, String value, String nxxx, String expx, long time) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            if ("ok".equalsIgnoreCase(jedis.set(key, value, nxxx, expx, time))) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 添加一个字符串值,成功返回1,失败返回0
     *
     * @param key
     * @param value
     * @return
     */
    public int set(String key, String value) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            if (jedis.set(key, value).equalsIgnoreCase("ok")) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 缓存一个字符串值,成功返回1,失败返回0,默认缓存时间为1小时,以本类的常量DEFAULT_SETEX_TIMEOUT为准
     *
     * @param key
     * @param value
     * @return
     */
    public int setEx(String key, String value) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            if (jedis.setex(key, DEFAULT_SETEX_TIMEOUT, value).equalsIgnoreCase("ok")) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 缓存一个字符串值,成功返回1,失败返回0,缓存时间以timeout为准,单位秒
     *
     * @param key
     * @param value
     * @param timeout
     * @return
     */
    public int setEx(String key, String value, int timeout) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            if (jedis.setex(key, timeout, value).equalsIgnoreCase("ok")) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 添加一个指定类型的对象,成功返回1,失败返回0
     *
     * @param key
     * @param value
     * @return
     */
    public <T> int set(String key, T value) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            byte[] data = enSeri(value);
            if (jedis.set(key.getBytes(), data).equalsIgnoreCase("ok")) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 缓存一个指定类型的对象,成功返回1,失败返回0,默认缓存时间为1小时,以本类的常量DEFAULT_SETEX_TIMEOUT为准
     *
     * @param key
     * @param value
     * @return
     */
    public <T> int setEx(String key, T value) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            byte[] data = enSeri(value);
            if (jedis.setex(key.getBytes(), DEFAULT_SETEX_TIMEOUT, data).equalsIgnoreCase("ok")) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 缓存一个指定类型的对象,成功返回1,失败返回0,缓存时间以timeout为准,单位秒
     *
     * @param key
     * @param value
     * @param timeout
     * @return
     */
    public <T> int setEx(String key, T value, int timeout) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            byte[] data = enSeri(value);
            if (jedis.setex(key.getBytes(), timeout, data).equalsIgnoreCase("ok")) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    public Long expire(String key, int timeout) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.expire(key, timeout);
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 将一个数值+1,成功返回+后的结果,失败返回null
     *
     * @param key
     * @return
     * @throws JedisDataException
     */
    public Long incr(String key) throws JedisDataException {
        if (isValueNull(key)) {
            return null;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.incr(key);
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 将一个数值+n,成功返回+后的结果,失败返回null
     *
     * @param key
     * @return
     * @throws JedisDataException
     */
    public Long incrBy(String key, long integer) throws JedisDataException {
        if (isValueNull(key)) {
            return null;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.incrBy(key, integer);
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 将一个数值-1,成功返回-后的结果,失败返回null
     *
     * @param key
     * @return
     * @throws JedisDataException
     */
    public Long decr(String key) throws JedisDataException {
        if (isValueNull(key)) {
            return null;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.decr(key);
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 将一个数值-1,成功返回-后的结果,失败返回null
     *
     * @param key
     * @return
     * @throws JedisDataException
     */
    public Long decrBy(String key, long i) throws JedisDataException {
        if (isValueNull(key)) {
            return null;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.decrBy(key, i);
        } finally {
            closeJedis(jedis);
        }
    }


    /**
     * 添加一个字符串值到list中,,成功返回1,失败返回0
     *
     * @param key
     * @param value
     * @return
     */
    public int setList(String key, String... value) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            Long result = jedis.rpush(key, value);
            if (result != null && result != 0) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 缓存一个字符串值到list中,全部list的key默认缓存时间为1小时,成功返回1,失败返回0
     *
     * @param key
     * @param value
     * @return
     */
    public int setExList(String key, String... value) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            Long result = jedis.rpush(key, value);
            jedis.expire(key, DEFAULT_SETEX_TIMEOUT);
            if (result != null && result != 0) {
                return 1;
            } else {
                return 0;
            }

        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 缓存一个字符串值到list中,全部list的key缓存时间为timeOut,单位为秒,成功返回1,失败返回0
     *
     * @param key
     * @param value
     * @return
     */
    public int setExList(String key, int timeOut, String... value) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            Long result = jedis.rpush(key, value);
            jedis.expire(key, timeOut);
            if (result != null && result != 0) {
                return 1;
            } else {
                return 0;
            }

        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 添加一个<T>类型对象值到list中,成功返回1,失败返回0
     *
     * @param key
     * @param value
     * @return
     */
    public <T> int setList(String key, T... value) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            int res = 0;
            for (T t : value) {
                byte[] data = enSeri(t);
                Long result = jedis.rpush(key.getBytes(), data);
                if (result != null && result != 0) {
                    res++;
                }
            }
            if (res != 0) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 缓存一个<T>类型对象值到list中,全部list的key默认缓存时间为1小时,成功返回1,失败返回0
     *
     * @param key
     * @param value
     * @return
     */
    public <T> int setExList(String key, T... value) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            int res = 0;
            for (T t : value) {
                byte[] data = enSeri(t);
                Long result = jedis.rpush(key.getBytes(), data);
                if (result != null && result != 0) {
                    res++;
                }
            }
            jedis.expire(key, DEFAULT_SETEX_TIMEOUT);
            if (res != 0) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 缓存一个<T>类型对象值到list中,全部list的key缓存时间为timeOut,单位秒,成功返回1,失败返回0
     *
     * @param key
     * @param value
     * @return
     */

    public <T> int setExList(String key, int timeOut, T... value) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            int res = 0;
            for (T t : value) {
                byte[] data = enSeri(t);
                Long result = jedis.rpush(key.getBytes(), data);
                if (result != null && result != 0) {
                    res++;
                }
            }
            jedis.expire(key, timeOut);
            if (res != 0) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 添加一个List集合成功返回1,失败返回0
     *
     * @param key
     * @param value
     * @return
     * @throws IOException
     * @throws RuntimeException
     */
    public <T> int setList(String key, List<T> value) throws RuntimeException, IOException {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            byte[] data = enSeriList(value);
            if (jedis.set(key.getBytes(), data).equalsIgnoreCase("ok")) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 缓存一个List<T>集合,成功返回1,失败返回0,默认缓存时间为1小时,以本类的常量DEFAULT_SETEX_TIMEOUT为准
     *
     * @param key
     * @param value
     * @return
     * @throws IOException
     * @throws RuntimeException
     */

    public <T> int setExList(String key, List<T> value) throws RuntimeException, IOException {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            byte[] data = enSeriList(value);
            if (jedis.setex(key.getBytes(), DEFAULT_SETEX_TIMEOUT, data).equalsIgnoreCase("ok")) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 缓存一个List<T>集合,成功返回1,失败返回0,缓存时间以timeout为准,单位秒
     *
     * @param key
     * @param value
     * @param timeout
     * @return
     * @throws IOException
     * @throws RuntimeException
     */
    public <T> int setExList(String key, List<T> value, int timeout) throws RuntimeException, IOException {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            byte[] data = enSeriList(value);
            if (jedis.setex(key.getBytes(), timeout, data).equalsIgnoreCase("ok")) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 添加一个字符串到set,如果key存在就在就最追加,如果key不存在就创建,成功返回1,失败或者没有受影响返回0
     *
     * @param key
     * @param value
     * @return
     */
    public int setSet(String key, String... value) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            Long result = jedis.sadd(key, value);
            if (result != null && result != 0) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 添加一个字符串set,如果key存在就在就最追加,整个set的key默认一小时后过期,如果key存在就在可以种继续添加,如果key不存在就创建,成功返回1,失败或者没有受影响返回0
     *
     * @param key
     * @param value
     * @return
     */
    public int setExSet(String key, String... value) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            Long result = jedis.sadd(key, value);
            jedis.expire(key, DEFAULT_SETEX_TIMEOUT);
            if (result != null && result != 0) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 添加一个字符串set,如果key存在就在就最追加,整个set的key有效时间为timeOut时间,单位秒,如果key存在就在可以种继续添加,如果key不存在就创建,,成功返回1,失败或者没有受影响返回0
     *
     * @param key
     * @param value
     * @return
     */
    public int setExSet(String key, int timeOut, String... value) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            Long result = jedis.sadd(key, value);
            jedis.expire(key, timeOut);
            if (result != null && result != 0) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 添加一个<T>类型到set集合,如果key存在就在就最追加,成功返回1,失败或者没有受影响返回0
     *
     * @param key
     * @param value
     * @return
     */

    public <T> int setSet(String key, T... value) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            int res = 0;
            for (T t : value) {
                byte[] data = enSeri(t);
                Long result = jedis.sadd(key.getBytes(), data);
                if (result != null && result != 0) {
                    res++;
                }
            }
            if (res != 0) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 缓存一个<T>类型到set集合,如果key存在就在就最追加,整个set的key默认有效时间为1小时,成功返回1,失败或者没有受影响返回0
     *
     * @param key
     * @param value
     * @return
     */

    public <T> int setExSet(String key, T... value) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            int res = 0;
            for (T t : value) {
                byte[] data = enSeri(t);
                Long result = jedis.sadd(key.getBytes(), data);
                if (result != null && result != 0) {
                    res++;
                }
            }
            jedis.expire(key, DEFAULT_SETEX_TIMEOUT);
            if (res != 0) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 缓存一个<T>类型到set集合,如果key存在就在就最追加,整个set的key有效时间为timeOut,单位秒,成功返回1,失败或者没有受影响返回0
     *
     * @param key
     * @param value
     * @return
     */

    public <T> int setExSet(String key, int timeOut, T... value) {
        if (isValueNull(key, value)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            int res = 0;
            for (T t : value) {
                byte[] data = enSeri(t);
                Long result = jedis.sadd(key.getBytes(), data);
                if (result != null && result != 0) {
                    res++;
                }
            }
            jedis.expire(key, timeOut);
            if (res != 0) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 添加一个Map<K, V>集合,成功返回1,失败返回0
     *
     * @param key
     * @param value
     * @return
     */
    public <K, V> int setMap(String key, Map<K, V> value) {
        if (value == null || key == null || "".equals(key)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            String data = JSON.toJSONString(value);
            if (jedis.set(key, data).equalsIgnoreCase("ok")) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 缓存一个Map<K, V>集合,成功返回1,失败返回0,默认缓存时间为1小时,以本类的常量DEFAULT_SETEX_TIMEOUT为准
     *
     * @param key
     * @param value
     * @return
     */
    public <K, V> int setExMap(String key, Map<K, V> value) {
        if (value == null || key == null || "".equals(key)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            String data = JSON.toJSONString(value);
            if (jedis.setex(key, DEFAULT_SETEX_TIMEOUT, data).equalsIgnoreCase("ok")) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 缓存一个Map<K, V>集合,成功返回1,失败返回0,缓存时间以timeout为准,单位秒
     *
     * @param key
     * @param value
     * @param timeout
     * @return
     */
    public <K, V> int setExMap(String key, Map<K, V> value, int timeout) {
        if (value == null || key == null || "".equals(key)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            String data = JSON.toJSONString(value);
            if (jedis.setex(key, timeout, data).equalsIgnoreCase("ok")) {
                return 1;
            } else {
                return 0;
            }
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 获取一个字符串值
     *
     * @param key
     * @return
     */
    public String get(String key) {
        if (isValueNull(key)) {
            return null;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.get(key);
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 获得一个指定类型的对象
     *
     * @param key
     * @param clazz
     * @return
     */
    public <T> T get(String key, Class<T> clazz) {
        if (isValueNull(key)) {
            return null;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();

            byte[] data = jedis.get(key.getBytes());
            T result = deSeri(data, clazz);
            return result;
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 获得一个字符串集合,区间以偏移量 START 和 END 指定。 其中 0 表示列表的第一个元素， 1
     * 表示列表的第二个元素，以此类推。 你也可以使用负数下标，以 -1 表示列表的最后一个元素， -2 表示列表的倒数第二个元素，以此类推。
     *
     * @param key
     * @param start
     * @param end
     * @return
     */
    public List<String> getList(String key, long start, long end) {
        if (isValueNull(key)) {
            return null;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            List<String> result = jedis.lrange(key, start, end);
            return result;
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 获得一个<T>类型的对象集合,区间以偏移量 START 和 END 指定。 其中 0 表示列表的第一个元素， 1 表示列表的第二个元素，以此类推。
     * 你也可以使用负数下标，以 -1 表示列表的最后一个元素， -2 表示列表的倒数第二个元素，以此类推。
     *
     * @param key
     * @param start
     * @param end
     * @return
     */
    public <T> List<T> getList(String key, long start, long end, Class<T> clazz) {
        if (isValueNull(key)) {
            return null;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            List<byte[]> lrange = jedis.lrange(key.getBytes(), start, end);
            List<T> result = null;
            if (lrange != null) {
                for (byte[] data : lrange) {
                    if (result == null) {
                        result = new ArrayList<>();
                    }
                    result.add(deSeri(data, clazz));
                }
            }
            return result;
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 获得list中存了多少个值
     *
     * @return
     */
    public long getListCount(String key) {
        if (isValueNull(key)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.llen(key);
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 获得一个List<T>的集合,
     *
     * @param key   键
     * @param clazz 返回集合的类型
     * @return
     * @throws IOException
     */
    public <T> List<T> getList(String key, Class<T> clazz) throws IOException {
        if (isValueNull(key)) {
            return null;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            byte[] data = jedis.get(key.getBytes());
            List<T> result = deSeriList(data, clazz);
            return result;
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 获得一个字符串set集合
     *
     * @param key
     * @return
     */
    public Set<String> getSet(String key) {
        if (isValueNull(key)) {
            return null;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            Set<String> result = jedis.smembers(key);
            return result;
        } finally {
            closeJedis(jedis);
        }
    }


    public Set<String> zRangeByScore(String queueKey, int i, long l, int i1, int i2) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            Set<String> result = jedis.zrangeByScore(queueKey, i, l, i1, i2);
            return result;
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 获得一个字符串set集合
     *
     * @param key
     * @return
     */
    public <T> Set<T> getSet(String key, Class<T> clazz) {
        if (isValueNull(key)) {
            return null;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            Set<byte[]> smembers = jedis.smembers(key.getBytes());
            Set<T> result = null;
            if (smembers != null) {
                for (byte[] data : smembers) {
                    if (result == null) {
                        result = new HashSet<>();
                    }
                    result.add(deSeri(data, clazz));
                }
            }
            return result;
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 获得集合中存在多少个值
     *
     * @param key
     * @return
     */
    public long getSetCount(String key) {
        if (isValueNull(key)) {
            return 0;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.scard(key);
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 获得一个Map<v,k>的集合
     *
     * @param key
     * @param v
     * @param k
     * @return
     */
    public <K, V> Map<K, V> getMap(String key, Class<K> k, Class<V> v) {
        if (key == null || "".equals(key)) {
            return null;
        }
        Jedis jedis = null;
        try {
            jedis = getJedis();
            String data = jedis.get(key);
            @SuppressWarnings("unchecked")
            Map<K, V> result = (Map<K, V>) JSON.parseObject(data);
            return result;
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 判斷key是否存在
     *
     * @param key
     * @return
     */
    public boolean exists(String key) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.exists(key);
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 判斷key是否存在
     *
     * @param keys
     * @return
     */
    public Long exists(String... keys) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.exists(keys);
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 删除一个值
     *
     * @param key
     */
    public void del(String... key) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            for (int i = 0; i < key.length; i++) {
                jedis.del(key);
            }
        } finally {
            closeJedis(jedis);
        }
    }

    // --------------------------公用方法区------------------------------------

    /**
     * 检查值是否为null,如果为null返回true,不为null返回false
     *
     * @param obj
     * @return
     */
    private boolean isValueNull(Object... obj) {
        for (int i = 0; i < obj.length; i++) {
            if (obj[i] == null || "".equals(obj[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * 序列化一个对象
     *
     * @param value
     * @return
     */
    private <T> byte[] enSeri(T value) {
        @SuppressWarnings("unchecked")
        RuntimeSchema<T> schema = (RuntimeSchema<T>) RuntimeSchema.createFrom(value.getClass());
        byte[] data = ProtostuffIOUtil.toByteArray(value, schema,
                LinkedBuffer.allocate(LinkedBuffer.DEFAULT_BUFFER_SIZE));
        return data;
    }

    /**
     * 反序列化一个对象
     *
     * @param data
     * @param clazz
     * @return
     */
    private <T> T deSeri(byte[] data, Class<T> clazz) {
        if (data == null || data.length == 0) {
            return null;
        }
        RuntimeSchema<T> schema = RuntimeSchema.createFrom(clazz);
        T result = schema.newMessage();
        ProtostuffIOUtil.mergeFrom(data, result, schema);
        return result;
    }

    /**
     * 序列化List集合
     *
     * @param list
     * @return
     * @throws IOException
     */
    private <T> byte[] enSeriList(List<T> list) throws RuntimeException, IOException {
        if (list == null || list.size() == 0) {
            throw new RuntimeException("集合不能为空!");
        }
        @SuppressWarnings("unchecked")
        RuntimeSchema<T> schema = (RuntimeSchema<T>) RuntimeSchema.getSchema(list.get(0).getClass());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ProtostuffIOUtil.writeListTo(out, list, schema, LinkedBuffer.allocate(LinkedBuffer.DEFAULT_BUFFER_SIZE));
        byte[] byteArray = out.toByteArray();
        return byteArray;
    }

    /**
     * 反序列化List集合
     *
     * @param data
     * @param clazz
     * @return
     * @throws IOException
     */
    private <T> List<T> deSeriList(byte[] data, Class<T> clazz) throws IOException {
        if (data == null || data.length == 0) {
            return null;
        }
        RuntimeSchema<T> schema = RuntimeSchema.createFrom(clazz);
        List<T> result = ProtostuffIOUtil.parseListFrom(new ByteArrayInputStream(data), schema);
        return result;
    }

    //----------------------geo start------------------------------------------

    /**
     * 增加地理位置的坐标
     *
     * @param key
     * @param coordinate
     * @param member
     * @return Long
     */
    public Long geoadd(String key, GeoCoordinate coordinate, String member) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.geoadd(key, coordinate.getLongitude(), coordinate.getLatitude(), member);
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 批量添加地理位置
     *
     * @param key
     * @param memberCoordinateMap
     * @return Long
     */
    public Long geoadd(String key, Map<String, GeoCoordinate> memberCoordinateMap) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.geoadd(key, memberCoordinateMap);
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 根据给定地理位置坐标获取指定范围内的地理位置集合（返回匹配位置的经纬度 + 匹配位置与给定地理位置的距离 + 从近到远排序，）
     *
     * @param key
     * @param coordinate
     * @param radius
     * @return List<GeoRadiusResponse>
     */
    public List<GeoRadiusResponse> geoRadius(String key, GeoCoordinate coordinate, double radius) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.georadius(key, coordinate.getLongitude(), coordinate.getLatitude(), radius, GeoUnit.KM, GeoRadiusParam.geoRadiusParam().withDist().withCoord().sortAscending());
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 根据给定地理位置获取指定范围内的地理位置集合（返回匹配位置的经纬度 + 匹配位置与给定地理位置的距离 + 从近到远排序，）
     *
     * @param key
     * @param member
     * @param radius
     * @return List<GeoRadiusResponse>
     */
    public List<GeoRadiusResponse> georadiusByMember(String key, String member, double radius) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.georadiusByMember(key, member, radius, GeoUnit.KM, GeoRadiusParam.geoRadiusParam().withDist().withCoord().sortAscending());
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 查询2位置距离
     *
     * @param key
     * @param member1
     * @param member2
     * @param unit
     * @return Double
     */
    public Double geoDist(String key, String member1, String member2, GeoUnit unit) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            Double dist = jedis.geodist(key, member1, member2, unit);
            return dist;
        } finally {
            closeJedis(jedis);
        }
    }

    /**
     * 查询位置的geohash
     *
     * @param key
     * @param members
     * @return List<String>
     */
    public List<String> geoHash(String key, String... members) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            List<String> resultList = jedis.geohash(key, members);
            return resultList;
        } finally {
            closeJedis(jedis);
        }
    }


    public Long getLLen(String key) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.llen(key);
        } finally {
            closeJedis(jedis);
        }
    }

    public Long zrem(String queueKey, String s) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.zrem(queueKey, s);
        } finally {
            closeJedis(jedis);
        }
    }

    public Set<String> zrange(String key, int i, int i1) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.zrange(key, i, i1);
        } finally {
            closeJedis(jedis);
        }
    }

    public Double zincrby(String key, int i, String str) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.zincrby(key, i, str);
        } finally {
            closeJedis(jedis);
        }
    }

    public Double zscore(String key, String str) {
        Jedis jedis = null;
        try {
            jedis = getJedis();
            return jedis.zscore(key, str);
        } finally {
            closeJedis(jedis);
        }
    }
}
