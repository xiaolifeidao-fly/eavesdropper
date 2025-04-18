package com.kakrolot.lock;

/**
 * Created by xianglong on 2018/10/18.
 */
public interface KakrolotLock {

    boolean lock(String lockType, Object key);

    boolean lock(String lockType, Object key, int timeOut);

    void unLock(String lockType, Object key);

}
