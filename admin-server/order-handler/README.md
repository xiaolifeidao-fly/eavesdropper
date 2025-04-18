### 订单更新
```
UpdateOrderHandler 
根据订单用户ID去查回调地址和回调参数
增加通知对方的接口更新进度

```

### 订单完成
```
FinishOrderHandler
根据订单用户ID去查回调地址和回调参数
增加通知对方的接口 更新订单状态和进度
```

### 订单退款

```
RefundOrderHandler
根据订单用户ID去查回调地址和回调参数
增加通知对方的接口 退款金额

```


### 轮询查退单中的订单 

```
新建一个类，不要定时任务，实现spring的InitializingBean接口，在afterPropertiesSet方法中实现轮询查退单中的订单
直接while 循环，查退单中的订单
退单逻辑参考kakrolot-web中的orderController中的refund方法
OrderController

OrderController
@RequestMapping(value = "/{id}/refund", method = RequestMethod.POST)
    @ResponseBody
    public WebResponse<String> refund(@PathVariable(name = "id") Long orderId) {
        UserDTO userDTO = getCurrentUser();
        OrderRecordDTO orderRecordDTO = orderRecordService.findById(orderId);
        if (orderRecordDTO == null) {
            return WebResponse.error("订单不存在");
        }
        if (!(orderRecordDTO.getUserId().equals(userDTO.getId()))) {
            return WebResponse.error("订单权限不足");
        }
        String orderStatus = orderRecordDTO.getOrderStatus();
        if (!(OrderStatus.PENDING.name().equals(orderStatus) || OrderStatus.INIT.name().equals(orderStatus))) {
            return WebResponse.error("订单不允许退单");
        }
        extPlugin.refundToBarry(orderId);
        Long num = refundOrderService.countByOrderId(orderId);
        if (num > 0) {
            return WebResponse.error("不允许重复退单");
        }
        refundOrderService.save(buildRefundOrderDTO(orderId, orderRecordDTO.getTenantId(), orderRecordDTO.getShopCategoryId()));
        return WebResponse.successMessage("退单请求已发送");
    }
```
