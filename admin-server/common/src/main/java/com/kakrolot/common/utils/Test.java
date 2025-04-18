package com.kakrolot.common.utils;

import java.io.IOException;

/**
 * @author xianglong
 * @date 2019/11/7
 */
public class Test {
    public static void main(String[] args) throws IOException {
//        BASE64Decoder decoder = new BASE64Decoder();
//        //byte[] bytes = decoder.decodeBuffer("AcaGARExpWt7sGaj2FMwrHT/9CbPwj+CHvKMqUqXJ8QgVgSy80D5ID5UbH6x6xcSHsdjXqljImqg/LxoSbAeyqYZ67ZUTE23KmeyzHjTOeTtGogSEQY2/D8UWmY7Xt815Ch96RiLEgmzqnzCGZ0/N2AAaS5FynrMMfNv9jPlZgcZBjlWv5Ept44wrLJ+G1rJ7CzjL567O2ClTXKGTbHDTZsh91lWXmcNKzsh9PReifo2kf9f2MvJnJ9mN80soe7hw+/96olR5tTH6yVpsbuJt0NjxXI+y5yKp+GLueKCeYbG4QIqqI4buMEsjnPQCOm1bVUo/GVBALx5HwL9LoizEPH2alZg3FittP/HxfLCYHB3bo3ZU8Ff6oyJvvC/U696KF4NlNVMb2bW8bajZ3ncyMDX+ghLy5Q9bzGNzYYnLFPW1Yk33ygWKAfu3dTbh+hlLD2ZAsu9XH+RcSFyd9cjjKCTYQu5elzPD+WdxPakFqmMxIjY0FEpSSxdLyIRuNjRUtPsdvxJCVsuQQJDlLAJ5XUu5sFptrCBNAxBQHDc+uTuEf/xCW3MA5jSBc5BjaiwTZYNRERdCU9WqtflarVMxbuPwWz2YzbvljyOoY3nfy5QdNUDyvqGEI1LRwKTfrIiW2g3wt9WWwR56nXZwY2sSHvDDApS124y63PJYWKyMHOOvkQ=");
//        //byte[] bytes = decoder.decodeBuffer("AcaGARExpWt7sGaj2FMwrHT/9CbPwj+CHvKMqUqXJ8QgVgSy80D5ID5UbH6x6xcSHsdjXqljImqg/LxoSbAeyqYZ67ZUTE23KmeyzHjTOeTtGogSEQY2/D8UWmY7Xt815Ch96RiLEgmzqnzCGZ0/N2AAaS5FynrMMfNv9jPlZgcZBjlWv5Ept44wrLJ+G1rJ7CzjL567O2ClTXKGTbHDTZsh91lWXmcNKzsh9PReifo2kf9f2MvJnJ9mN80soe7hw+/96olR5tTH6yVpsbuJt0NjxXI+y5yKp+GLueKCeYbG4QIqqI4buMEsjnPQCOm1bVUo/GVBALx5HwL9LoizEPH2alZg3FittP/HxfLCYHB3bo3ZU8Ff6oyJvvC/U696KF4NlNVMb2bW8bajZ3ncyMDX+ghLy5Q9bzGNzYYnLFPW1Yk33ygWKAfu3dTbh+hlLD2ZAsu9XH+RcSFyd9cjjKCTYQu5elzPD+WdxPakFqmMxIjY0FEpSSxdLyIRuNjRUtPsdvxJCVsuQQJDlLAJ5XUu5sFptrCBNAxBQHDc+uTuEf/xCW3MA5jSBc5BjaiwTZYNRERdCU9WqtflarVMxbuPwWz2YzbvljyOoY3nfy5QdNUDyvqGEI1LRwKTfrIiW2g3wt9WWwR56nXZwY2sSHvDDApS124y63PJYWKyMHOOvkQ=");
//        //byte[] bytes = decoder.decodeBuffer("AabQEB0V8RKOK2rVCvLsCQfXayD6NZ3yc8KZQhpc8jjByzhxxup4zejPQBqhO3aEA1z4GCysh6Dv2x9qxit3tppPh2FCCkjYQmKAvdGmOfpqMYEpuPTi5HzmGJBkFL0MPEeeffhRNU61hhJxewdzTkKVhlI3XGjRV4INOUcuoIUvz+w+kIQO1PHXscbw9vXBNtEPujMNgg2r+Op/R+7elTmPH8c8yMoq9vLYFgqiJ/07MLT7G3y54pqZebbVVaHf7sTj4xFRvZig153oVb+i/JZDCtjyPQX/GImeHZmYk2dK5FjKYLgQ2eBNdy58DzuDsj7FyuyNbI4rYIdyKMQ9GLpKy26SXBk9diap6IyvwPMfwfCbz7laW8Q0ILB4wqzEFwKwgIwUNeFqEA8mB3YhFzpfAQgsPzo6lQQ37H/+nKDT40+315WK9ahxnoIkbSJWGSdKFsDtDMr1YsL+SkZ5NAUKG1eYKA3EqynDg4iYfggTZlyNZxucxp+cXs26hmY03KUuiPBLekIUjzdtOPtE2oMYY5LjMVm/5ny7Uhmg/P6nvkQuHqYudvbCLs6mro4=");
//        byte[] bytes = "{\"m_phone_number\":\"ea58365d55a6fbf6cb3e5717283f1f7fec1e96b4e167bfb6edc2e4542c5b48c5\",\"raw_phone_number\":\"13702874288\",\"sim_serial\":\"353522263538745\",\"subscribe_id\":\"353522263538745\",\"sim_op\":\"46003\",\"phone_type\":1,\"net_type\":0,\"third_part_account\":{},\"wifi_bssid\":\"20:a6:cd:41:6f:b0\"}".getBytes();
//        //String result = Base64Utils.encodeWithUrl(bytes);
//        String result = new String(Base64Utils.decodeWithUrl("5r_x8v786fTy88L7-Pj5__z-9r-n5r_-8Pm_p62xv_H87unC9PPp-O_r_PG_p6yoqqmurKStrKqxv_Hy_sL0-b-nv7-xv_Ltwunk7fi_p62xv_Ltwun08Pi_p62xv_H87unC6fTw-L-nreCxv_Hy_vzp9PLzwu746en08_q_p6yxv_Hy_vzp9PLzwvDy-fi_p6ixv-r0-_TC9PP78r-nxsCxv__pwvTz-_K_p8bA4A=="));
//        System.out.println(result);
    }

    public static String ByteToStr(byte[] bArr) {

        int i = 0;

        char[] toCharArray = "0123456789abcdef".toCharArray();
        char[] cArr = new char[(bArr.length * 2)];
        while (i < bArr.length) {
            int i2 = bArr[i] & 255;
            int i3 = i * 2;
            cArr[i3] = toCharArray[i2 >>> 4];
            cArr[i3 + 1] = toCharArray[i2 & 15];
            i++;
        }
        return new String(cArr);

    }

}
