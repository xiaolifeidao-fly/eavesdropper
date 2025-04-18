package com.kakrolot.common.utils;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by roc_peng on 2020/2/20.
 * Description 这个世界每天都有太多遗憾,所以你好,再见!
 */

public class ScaleUtil {

    /**
     * 命中比例工具类
     *
     * @param scale 命中比例
     * @param total 总比例
     * @return
     */
    public static Boolean hitScale(Integer scale, Integer total) {
        double ramdomDouble = Math.random();
        final int ramdomInt = (int) (ramdomDouble * 100);
        int scaleFact = ramdomInt % total;
        return scaleFact < scale;
    }

    public static void main(String[] args) {
        List<Boolean> success = new ArrayList<>();
        List<Boolean> fail = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            if(hitScale(10,10)){
                success.add(true);
            } else {
                fail.add(true);
            }
        }
        System.out.println(success);
    }


}
