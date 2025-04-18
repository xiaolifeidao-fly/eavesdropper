### 订单创建
```
要在OrderController 增加 创建订单的接口 + 鉴权
要加用户映射回到接口表
订单添加外部订单ID
```

### 订单创建时，把订单的单价和金额存下来
```
在order_record增加 ext_price 和 ext_amount 字段
只有外部订单 这两个字段会有值
在OrderService 的submit更改

submit 中 
```

