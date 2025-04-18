package com.kakrolot.common.utils;

import com.alibaba.fastjson.JSONObject;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class XGorgon {

    public XGorgon(int[] debug){
        this.length = 0x14;
        this.debug = debug;
        this.hex_510 = new int[]{0x55, 0x00, 0x50, choice(0, 0xFF), 0x32, 0xFA, 0x00, 8 * choice(0, 0x1F)};
        //this.hex_510 = new int[]{0x55, 0x00, 0x50, 0, 0x32, 0xFA, 0x00, 8 * 1};
    }

    private int length = 0x14;

    private int[] debug;

    private int[] hex_510;

    private int[] addr_3F4(){

        int[] hex_3F4 = range(0x0, 0x100);
        Integer tmp = null;
        for(int index=0x0;index<0x100;index++){
            int A;
            int B;
            int C;
            int D;
            if(index == 0){
                A = 0;
            }else if( tmp !=null ){
                A = tmp;
            }else{
                A = hex_3F4[index-1];
            }
            B = this.hex_510[index % 0x8];
            if(Integer.compare(A,0x55)  == 0 ){
                if(index !=1){
                    if(!Objects.equals(tmp,0x55)){
                        A = 0;
                    }
                }
            }
            C =  A + index + B;
            while (C >= 0x100){
                C =  C - 0x100;
            }
            if(C < index){
                tmp = C;
            }else{
                tmp = null;
            }
            D = hex_3F4[C];
            hex_3F4[index] =  D;
        }
        return hex_3F4;
    }

    private int[] initial(int[] debug,int[] hex_3F4){
        List<Integer> tmp_add = new ArrayList<Integer>();
        int[] tmp_hex = new int[hex_3F4.length];
        System.arraycopy(hex_3F4,0,tmp_hex,0,hex_3F4.length);
        for(int index=0;index<this.length;index++){
            int A = debug[index];
            int B;
            int C;
            int D;
            int E;
            int F;
            int G;
            if(tmp_add.isEmpty()){
                B = 0;
            }else{
                B = tmp_add.get(tmp_add.size() - 1);
            }
            C = hex_3F4[index + 1] + B;
            while (C >=0x100){
                C =  C - 0x100;
            }
            tmp_add.add(C);
            D = tmp_hex[C];
            tmp_hex[index+1] = D;
            E = D + D;
            while (E >=0x100){
                E =  E - 0x100;
            }
            F = tmp_hex[E];
            G = A ^ F;
            debug[index] =  G;
        }
        return  debug;
    }

    public int[] calculate(int[] debug){
        for(int index=0;index<this.length;index++){
            int A = debug[index];
            int B = reverse(A);
            int C = debug[(index+1) % this.length];
            int D = B ^ C;
            int E = RBIT(D);
            int F = E ^ this.length;
            int G = ~F;
            String ss = "";
            if(G < 0 ){
                ss = Long.toHexString(0x100000000L + G);
            }
            int start = ss.length() -2;
            int end = ss.length();
            String sss = ss.substring(start,end);
            int H = Integer.parseInt(sss,16);
            debug[index] = H;
        }
        return debug;
    }

    public int reverse(int num){
        String tmp_string = Integer.toHexString(num);
        if(tmp_string.length() < 2){
            tmp_string = "0"+tmp_string;
        }
        String a = tmp_string.substring(1);
        char b =  tmp_string.charAt(0);
        String reult = a + b;
        return Integer.valueOf(reult,16);
    }

    public String main(){
        String result = "";
        int[] initial = this.initial(this.debug, this.addr_3F4());
        int[] calculate = this.calculate(initial);
        for(int index=0;index< calculate.length;index++){
            int item = calculate[index];
            String itemStr = StringUtils.leftPad(Integer.toHexString(item),2,"0");
            result = result + itemStr;
        }
        String format = "0300%s%s0000%s";
        String a = StringUtils.leftPad(Integer.toHexString(this.hex_510[7]),2,"0");
        String b = StringUtils.leftPad(Integer.toHexString(this.hex_510[3]),2,"0");
        result = String.format(format,a,b,result);
        return result;
    }






    public int RBIT(int num){
        String result = "";
        //String tmp_string = Integer.toBinaryString(num).substring(2);
        String tmp_string = Integer.toBinaryString(num);

        while (tmp_string.length() < 8){
            tmp_string = "0" + tmp_string;
        }
        for(int index=0;index<8;index++){
            result = result + tmp_string.charAt(7-index);
        }
        return Integer.valueOf(result,2);
    }




    private static int[] range(int start , int end){
        int[] result = new int[end-start];
        for(int index=start;index<end;index++){
            result[index-start] = index;
        }
        return result;
    }


    private static int choice(int start , int end){
        int a=(int)(Math.random()*(end-start)+start);
        return a;
    }

    public static void X_Gorgon(String url, String data, String cookie, JSONObject header){
        List<Integer> gorgon = new ArrayList<Integer>();
        Long time = System.currentTimeMillis()/1000;
        //Long time = 1580633106L;
        String Khronos = Long.toHexString(time);
        String url_md5 = MD5Utils.getMD5(url,32);
        for(int index=0;index<4;index++){
            String um =url_md5.substring(2*index , 2 * index+2);
            gorgon.add(Integer.valueOf(um,16));
        }
        if(StringUtils.isNotEmpty(data)){
            String data_md5 = MD5Utils.getMD5(data,32);
            for(int index=0;index<4;index++){
                String um =data_md5.substring(2*index , 2 * index+2);
                gorgon.add(Integer.valueOf(um,16));
            }
        }else{
            for(int index=0;index<4;index++){
                gorgon.add(0x0);
            }
        }

        if(StringUtils.isNotEmpty(cookie)){
            String cookie_md5 = MD5Utils.getMD5(cookie,32);
            for(int index=0;index<4;index++){
                String um = cookie_md5.substring(2*index , 2 * index+2);
                gorgon.add(Integer.valueOf(um,16));
            }
        }else{
            for(int index=0;index<4;index++){
                gorgon.add(0x0);
            }
        }

        for(int index=0;index<4;index++){
            gorgon.add(0x0);
        }

        for(int index=0;index<4;index++){
            String um = Khronos.substring(2*index , 2 * index+2);
            gorgon.add(Integer.valueOf(um,16));
        }


        int[] array = gorgon.stream().mapToInt(Integer::valueOf).toArray();

        String xg = new XGorgon(array).main();
        String xh = time + "";
        header.put("X-Gorgon",xg);
        header.put("X-Khronos",xh);
    }

}
