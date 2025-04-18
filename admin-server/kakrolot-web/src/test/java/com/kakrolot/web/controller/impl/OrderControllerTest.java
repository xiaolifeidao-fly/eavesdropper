package com.kakrolot.web.controller.impl;

import com.alibaba.fastjson.JSONObject;

/**
* OrderController Tester. 
* 
* @author <Authors name> 
* @since <pre>5月 1, 2020</pre> 
* @version 1.0 
*/ 
public class OrderControllerTest {

    public static void main(String[] args) {
        String jsonStr = "{\n" +
                "    \"code\": 0,\n" +
                "    \"success\": true,\n" +
                "    \"data\": [\n" +
                "        {\n" +
                "            \"track_id\": \"\",\n" +
                "            \"user\": {\n" +
                "                \"id\": \"5e9a1d14000000000100201a\",\n" +
                "                \"name\": \"奇妙的奶啾\",\n" +
                "                \"image\": \"https://sns-avatar-qc.xhscdn.com/avatar/5fdce7998e501f7904cd78f6.jpg?imageView2/2/w/120/format/jpg\",\n" +
                "                \"followed\": false,\n" +
                "                \"red_id\": \"828779271\",\n" +
                "                \"nickname\": \"奇妙的奶啾\",\n" +
                "                \"red_official_verify_type\": 0,\n" +
                "                \"level\": {\n" +
                "                    \"image\": \"\"\n" +
                "                }\n" +
                "            },\n" +
                "            \"note_list\": [\n" +
                "                {\n" +
                "                    \"id\": \"60029c3e000000000101e9f5\",\n" +
                "                    \"type\": \"video\",\n" +
                "                    \"title\": \"✨橘调日常妆｜200%的提气色！\",\n" +
                "                    \"desc\": \"超级日常的妆容，日常通勤足够啦！真的好自然！\\n水：科颜氏高保湿水，水油平衡NO.1！\\n隔离：cpb长管，隐形毛孔平衡肤色超棒！\\n粉底：cpb粉霜#OC00 越夜越美丽名不虚传！\\n眼影：3ce 9宫格#smoother 深棕色哑光，已经铁皮了，哑光的 超级日常\\n口红\uD83D\uDC84：美宝莲#mun09 桔红色，平价显气色 GET！\\n今天我是隐匿在人群中的低调小公主！hhhh\",\n" +
                "                    \"hash_tag\": [],\n" +
                "                    \"ats\": [],\n" +
                "                    \"images_list\": [\n" +
                "                        {\n" +
                "                            \"fileid\": \"91443c84-5217-3ede-b518-9be0794d126b\",\n" +
                "                            \"height\": 1440,\n" +
                "                            \"width\": 1080,\n" +
                "                            \"url\": \"http://sns-img-qc.xhscdn.com/91443c84-5217-3ede-b518-9be0794d126b?imageView2/2/w/1080/format/webp\",\n" +
                "                            \"original\": \"http://sns-img-qc.xhscdn.com/91443c84-5217-3ede-b518-9be0794d126b\",\n" +
                "                            \"trace_id\": \"91443c84-5217-3ede-b518-9be0794d126b\"\n" +
                "                        }\n" +
                "                    ],\n" +
                "                    \"video\": {\n" +
                "                        \"id\": \"\",\n" +
                "                        \"height\": 1280,\n" +
                "                        \"width\": 960,\n" +
                "                        \"url\": \"http://sns-video-qc.xhscdn.com/3a3851d7b2a145402398844a939516c533a9ec90_v1_ln?sign=d2a470f485b1452902a7d30a876aacc6&t=6005af54\",\n" +
                "                        \"url_info_list\": [],\n" +
                "                        \"preload_size\": 1048576,\n" +
                "                        \"played_count\": 0,\n" +
                "                        \"duration\": 211,\n" +
                "                        \"frame_ts\": 0,\n" +
                "                        \"is_user_select\": false,\n" +
                "                        \"is_upload\": false\n" +
                "                    },\n" +
                "                    \"user\": {\n" +
                "                        \"id\": \"5e9a1d14000000000100201a\",\n" +
                "                        \"name\": \"奇妙的奶啾\",\n" +
                "                        \"image\": \"https://sns-avatar-qc.xhscdn.com/avatar/5fdce7998e501f7904cd78f6.jpg?imageView2/2/w/120/format/jpg\",\n" +
                "                        \"followed\": false,\n" +
                "                        \"red_id\": \"828779271\",\n" +
                "                        \"nickname\": \"奇妙的奶啾\",\n" +
                "                        \"red_official_verify_type\": 0,\n" +
                "                        \"level\": {\n" +
                "                            \"image\": \"\"\n" +
                "                        }\n" +
                "                    },\n" +
                "                    \"time\": 1610783806,\n" +
                "                    \"last_update_time\": 0,\n" +
                "                    \"poi\": {},\n" +
                "                    \"liked\": false,\n" +
                "                    \"liked_count\": 22,\n" +
                "                    \"collected\": false,\n" +
                "                    \"collected_count\": 0,\n" +
                "                    \"comments_count\": 0,\n" +
                "                    \"sticky\": false,\n" +
                "                    \"share_info\": {\n" +
                "                        \"content\": \"超级日常的妆容，日常通勤足够啦！真的好自然！ 水：科颜氏高保湿水，水油平衡NO.1！ 隔离：cpb长管，隐形毛孔平衡肤色\",\n" +
                "                        \"image\": \"http://sns-img-qc.xhscdn.com/91443c84-5217-3ede-b518-9be0794d126b?imageView2/2/w/360/format/jpg/q/75\",\n" +
                "                        \"link\": \"https://www.xiaohongshu.com/discovery/item/60029c3e000000000101e9f5\",\n" +
                "                        \"title\": \"✨橘调日常妆｜200%的提气色\",\n" +
                "                        \"is_star\": false,\n" +
                "                        \"function_entries\": [\n" +
                "                            {\n" +
                "                                \"type\": \"generate_image\"\n" +
                "                            },\n" +
                "                            {\n" +
                "                                \"type\": \"copy_link\"\n" +
                "                            },\n" +
                "                            {\n" +
                "                                \"type\": \"dislike\"\n" +
                "                            },\n" +
                "                            {\n" +
                "                                \"type\": \"report\"\n" +
                "                            }\n" +
                "                        ]\n" +
                "                    },\n" +
                "                    \"long_press_share_info\": {\n" +
                "                        \"content\": \"\",\n" +
                "                        \"title\": \"\",\n" +
                "                        \"is_star\": false,\n" +
                "                        \"function_entries\": [\n" +
                "                            {\n" +
                "                                \"type\": \"image_download\"\n" +
                "                            }\n" +
                "                        ]\n" +
                "                    },\n" +
                "                    \"mini_program_info\": {\n" +
                "                        \"user_name\": \"gh_52be748ce5b7\",\n" +
                "                        \"path\": \"pages/main/home/index?redirect_path=%2Fpages%2Fmain%2Fnote%2Findex%3Fid%3D60029c3e000000000101e9f5%26type%3Dvideo\",\n" +
                "                        \"title\": \"@奇妙的奶啾 发了一篇超赞的笔记，快点来看！\",\n" +
                "                        \"desc\": \"超级日常的妆容，日常通勤足够啦！真的好自然！ 水：科颜氏高保湿水，水油平衡NO.1！ 隔离：cpb长管，隐形毛孔平衡肤色\",\n" +
                "                        \"webpage_url\": \"https://www.xiaohongshu.com/discovery/item/60029c3e000000000101e9f5\",\n" +
                "                        \"thumb\": \"http://sns-img-qc.xhscdn.com/91443c84-5217-3ede-b518-9be0794d126b?imageView2/2/w/540/format/jpg/q/75\",\n" +
                "                        \"share_title\": \"@奇妙的奶啾 发了一篇超赞的笔记，快点来看！\"\n" +
                "                    },\n" +
                "                    \"qq_mini_program_info\": {\n" +
                "                        \"user_name\": \"gh_66c53d495417\",\n" +
                "                        \"path\": \"pages/main/note/index?id=60029c3e000000000101e9f5&type=video\",\n" +
                "                        \"title\": \"@奇妙的奶啾 发了一篇超赞的笔记，快点来看！\",\n" +
                "                        \"desc\": \"超级日常的妆容，日常通勤足够啦！真的好自然！ 水：科颜氏高保湿水，水油平衡NO.1！ 隔离：cpb长管，隐形毛孔平衡肤色\",\n" +
                "                        \"webpage_url\": \"https://www.xiaohongshu.com/discovery/item/60029c3e000000000101e9f5\",\n" +
                "                        \"thumb\": \"http://sns-img-qc.xhscdn.com/91443c84-5217-3ede-b518-9be0794d126b?imageView2/2/w/540/format/jpg/q/75\",\n" +
                "                        \"share_title\": \"@奇妙的奶啾 发了一篇超赞的笔记，快点来看！\"\n" +
                "                    },\n" +
                "                    \"shared_count\": 1,\n" +
                "                    \"view_count\": 0,\n" +
                "                    \"has_related_goods\": false,\n" +
                "                    \"enable_fls_bridge_cards\": false,\n" +
                "                    \"enable_fls_related_cards\": false,\n" +
                "                    \"enable_brand_lottery\": false,\n" +
                "                    \"cooperate_binds\": [],\n" +
                "                    \"topics\": [],\n" +
                "                    \"may_have_red_packet\": false,\n" +
                "                    \"has_music\": false,\n" +
                "                    \"head_tags\": [],\n" +
                "                    \"foot_tags\": [],\n" +
                "                    \"liked_users\": [],\n" +
                "                    \"goods_info\": {},\n" +
                "                    \"debug_info\": \"\",\n" +
                "                    \"use_water_color\": false\n" +
                "                }\n" +
                "            ],\n" +
                "            \"comment_list\": [],\n" +
                "            \"model_type\": \"note\"\n" +
                "        }\n" +
                "    ]\n" +
                "}";
        JSONObject jsonObject = JSONObject.parseObject(jsonStr);
        System.out.println(jsonObject);
    }

//    public static void main(String[] args) throws Exception {
//        List<String> secUids = Arrays.asList("");
//        int i=0;
//        for(String secUid:secUids) {
//            String url = "https://www.iesdouyin.com/web/api/v2/user/info/?sec_uid="+secUid;
//            Response response = OkHttpUtils.doGet(url, null);
//            String result = response.body().string();
//            JSONObject jsonObject = JSONObject.parseObject(result);
//            String nickName = jsonObject.getJSONObject("user_info").getString("nickname");
//            String shortId = jsonObject.getJSONObject("user_info").getString("short_id");
//            if(!nickName.contains("GL")) {
//                System.out.println(++i+"不是的:"+nickName);
//            } else {
//                System.out.println(++i+"是!:"+nickName);
//                System.out.println(secUid);
//            }
//            if(shortId.contains("GL")) {
//                System.out.println(++i+"是!:"+nickName);
//                System.out.println(secUid);
//            }
//        }
//    }

/*    public static void main(String[] args) {
//        String digist = MD5.digist("飞天舞小姐姐来南阳西郭啦，快来打卡吧！#西郭之城  https://v.douyin.com/JMS4ebj/ 复制此链接，打开【抖音短视频】，直接观看视频！" + System.currentTimeMillis());
//        System.out.println(digist);
        String url = "https://www.xiaohongshu.com/discovery/item/5f8959fd000000000101caa4?xhsshare=CopyLink";
        String regex = "[0-9a-z]{24}";
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(url);
        if (matcher.find()) {
            String group = matcher.group(0);
            System.out.println(group);
        }
        System.out.println("nu");
//        String itemId = TranslateUtils.convertTinyUrl(url);
//        System.out.println(itemId);
    }*/


} 
