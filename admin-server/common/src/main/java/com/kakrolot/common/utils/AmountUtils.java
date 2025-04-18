package com.kakrolot.common.utils;

import java.math.BigDecimal;

/**
 * @author xiaofeidao
 */
public class AmountUtils {

//    public static Long toPoint(BigDecimal amount) {
//        if (amount == null) {
//            return null;
//        }
//        return new BigDecimal(100000000).multiply(amount).longValue();
//    }
//
//    public static BigDecimal toDynasty(Long amount) {
//        if (amount == null) {
//            return null;
//        }
//        if(amount == 0) {
//            return BigDecimal.ZERO;
//        }
//        int zeroIndex = getZeroIndex(amount);
//        int scale = 8 - zeroIndex;
//        if (scale < 2) {
//            scale = 2;
//        }
//        BigDecimal bigDecimal = new BigDecimal(amount);
//        return bigDecimal.divide(new BigDecimal(100000000L), scale, BigDecimal.ROUND_HALF_UP);
//    }

//    private static int getZeroIndex(Long amount) {
//        char[] amountArray = amount.toString().toCharArray();
//        int charSize = amountArray.length;
//        int zeroIndex = 0;
//        for (int i = charSize; i > 0; i--) {
//            char amountChar = amountArray[i - 1];
//            if (amountChar == '0') {
//                zeroIndex++;
//                continue;
//            }
//            return zeroIndex;
//        }
//        return 0;
//    }

}
