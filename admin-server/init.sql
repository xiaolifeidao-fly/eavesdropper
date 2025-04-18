INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '获取充值明细列表', 'rechargeList', null, 'RESOURCE', '/accounts/recharge/list', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '获取某账户明细列表', 'accountDetailList', null, 'RESOURCE', '/accounts/{accountId}/list', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '获取当前登录用户账户明细列表', 'currentUserAccountDetailList', null, 'RESOURCE', '/accounts/currentAccount/list', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '获取当前登录用户账户信息', 'currentUserAccountInfo', null, 'RESOURCE', '/accounts/currentAccount', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '充值', 'payAmount', null, 'RESOURCE', '/accounts/{accountId}/payAmount', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '冻结账户', 'blockAccount', null, 'RESOURCE', '/accounts/{accountId}/blockAccount', null, null, null, null, null, null);


-- For /currentTaskCategoryList endpoint
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '获取任务类目列表', 'currentTaskCategoryList', null, 'RESOURCE', '/check/currentTaskCategoryList', null, null, null, null, null, null);

-- For /taskList endpoint
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '获取任务列表', 'taskList', null, 'RESOURCE', '/check/taskList', null, null, null, null, null, null);

-- For /userTaskList endpoint
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '获取用户任务情况', 'userTaskList', null, 'RESOURCE', '/check/userTaskList', null, null, null, null, null, null);

-- For /result endpoint
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '审核结果上传', 'saveCheckResult', null, 'RESOURCE', '/check/result', null, null, null, null, null, null);

-- For /{assignmentId}/finish endpoint
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '完结', 'finishAssignment', null, 'RESOURCE', '/check/{assignmentId}/finish', null, null, null, null, null, null);


INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '今日任务汇总情况:任务条数等信息', 'todayOrderRecordSummary', null, 'RESOURCE', '/dashboard/today/orderRecordSummary', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '今日任务汇总情况:任务条数-businessType  第一列', 'orderRecordCountSummaryByBusinessType', null, 'RESOURCE', '/dashboard/today/orderRecordCountSummaryByBusinessType', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '今日任务汇总情况:任务条数-businessCode', 'orderRecordCountSummaryByBusinessCode', null, 'RESOURCE', '/dashboard/today/orderRecordCountSummaryByBusinessCode', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '今日任务汇总情况:任务具体数量等信息-businessType', 'todayOrderRecordNumSummaryByBusinessType', null, 'RESOURCE', '/dashboard/today/orderRecordNumSummaryByBusinessType', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '今日任务汇总情况:任务具体数量等信息-businessCode', 'todayOrderRecordNumSummaryByBusinessCode', null, 'RESOURCE', '/dashboard/today/orderRecordNumSummaryByBusinessCode', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '今日人工完成量', 'todayUserTaskSummary', null, 'RESOURCE', '/dashboard/today/userTaskSummary', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '今日人工完成量-BusinessType  第二列', 'todayUserTaskSummaryByBusinessType', null, 'RESOURCE', '/dashboard/today/userTaskSummaryByBusinessType', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '今日人工完成量-BusinessCode', 'todayUserTaskSummaryByBusinessCode', null, 'RESOURCE', '/dashboard/today/userTaskSummaryByBusinessCode', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '今日实际完成量-businessType 第三列', 'todayActualTaskSummaryByBusinessType', null, 'RESOURCE', '/dashboard/today/actualTaskSummaryByBusinessType', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '今日实际完成量-businessCode', 'todayActualTaskSummaryByBusinessCode', null, 'RESOURCE', '/dashboard/today/actualTaskSummaryByBusinessCode', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '剩余完成量,昨日未跑量-businessType 第四列', 'todayRemainTaskSummaryByBusinessType', null, 'RESOURCE', '/dashboard/today/remainTaskSummaryByBusinessType', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '剩余完成量,昨日未跑量-businessCode', 'todayRemainTaskSummaryByBusinessCode', null, 'RESOURCE', '/dashboard/today/remainTaskSummaryByBusinessCode', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '剩余总未跑量', 'todayRemainTotalTaskSummary', null, 'RESOURCE', '/dashboard/today/remainTotalTaskSummary', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '今日消费情况', 'todayConsumeSummary', null, 'RESOURCE', '/dashboard/today/consumeSummary', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '今日充值情况', 'todayRechargeSummary', null, 'RESOURCE', '/dashboard/today/rechargeSummary', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '所有用户账户情况,今日余额', 'todayUserAccountSummary', null, 'RESOURCE', '/dashboard/today/userAccountSummary', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '历史任务汇总情况', 'historyOrderRecordSummary', null, 'RESOURCE', '/dashboard/history/orderRecordSummary', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '历史人工完成量', 'historyUserTaskSummary', null, 'RESOURCE', '/dashboard/history/userTaskSummary', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '历史实际完成量', 'historyActualTaskSummary', null, 'RESOURCE', '/dashboard/history/actualTaskSummary', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '历史消费情况', 'historyConsumeSummary', null, 'RESOURCE', '/dashboard/history/consumeSummary', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, 'DashBoard配置', 'dashBoardConfig', null, 'RESOURCE', '/dashboard/config', null, null, null, null, null, null);


-- Save Manual Shop Category
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '添加人工商品', 'saveManualShopCategory', null, 'RESOURCE', '/shops/manual/save', null, null, null, null, null, null);

-- List Manual Shop Categories
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '人工商品列表', 'listManualShopCategories', null, 'RESOURCE', '/shops/manual/list', null, null, null, null, null, null);

-- Delete Manual Shop Category
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '删除人工商品', 'deleteManualShopCategory', null, 'RESOURCE', '/shops/manual/delete', null, null, null, null, null, null);

-- Expire Manual Shop Category
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '失效人工商品', 'expireManualShopCategory', null, 'RESOURCE', '/shops/manual/expire', null, null, null, null, null, null);

-- Activate Manual Shop Category
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '启用人工商品', 'activeManualShopCategory', null, 'RESOURCE', '/shops/manual/active', null, null, null, null, null, null);

-- List Endpoint
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '通告列表', 'noticeList', null, 'RESOURCE', '/notice/list', null, null, null, null, null, null);

-- Save Endpoint
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '新增通告', 'noticeSave', null, 'RESOURCE', '/notice/save', null, null, null, null, null, null);

-- Update Endpoint
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '更新通告', 'noticeUpdate', null, 'RESOURCE', '/notice/update', null, null, null, null, null, null);

-- Delete Endpoint
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '删除通告', 'noticeDelete', null, 'RESOURCE', '/notice/{id}/delete', null, null, null, null, null, null);


INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '下单', 'saveOrder', null, 'RESOURCE', '/orders/save', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '获取订单详情', 'getOrderReal', null, 'RESOURCE', '/orders/{id}/real', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '批量退款', 'batchRefund', null, 'RESOURCE', '/orders/batchRefund', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '订单退款', 'refundOrder', null, 'RESOURCE', '/orders/{id}/refund', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '订单补款', 'payAmount', null, 'RESOURCE', '/orders/{id}/bk', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '强制退款', 'forceRefund', null, 'RESOURCE', '/orders/{id}/refund/force', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '订单列表', 'listOrders', null, 'RESOURCE', '/orders/list', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '管理员订单列表', 'managerListOrders', null, 'RESOURCE', '/orders/manager/list', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '外部人员订单列表', 'externalListOrders', null, 'RESOURCE', '/orders/external/list', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '订单汇总', 'orderSummaryList', null, 'RESOURCE', '/orders/summary', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '当前用户的商品组', 'currentShopGroup', null, 'RESOURCE', '/orders/currentShopGroup', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '订单明细', 'getOrderAmountDetail', null, 'RESOURCE', '/orders/{orderId}/detail', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '获取角色列表', 'getUserResources', null, 'RESOURCE', '/roles/list', null, null, null, null, null, null);



-- Save Shop
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '添加商品', 'saveShop', null, 'RESOURCE', '/shops/save', null, null, null, null, null, null);

-- Update Shop
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '修改商品', 'updateShop', null, 'RESOURCE', '/shops/{id}/update', null, null, null, null, null, null);

-- Delete Shop
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '删除商品', 'deleteShop', null, 'RESOURCE', '/shops/{id}/delete', null, null, null, null, null, null);

-- List Shops
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '商品列表', 'listShops', null, 'RESOURCE', '/shops/list', null, null, null, null, null, null);

-- Current User's Shop List
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '当前登录用户的商品列表', 'currentUserShopList', null, 'RESOURCE', '/shops/currentList', null, null, null, null, null, null);

-- Current User's Shop Category List
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '当前登录用户的商品分类列表', 'currentUserShopCategoryList', null, 'RESOURCE', '/shops/shopCategory/currentList', null, null, null, null, null, null);

-- Shop Category List
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '商品分类列表', 'shopCategoryList', null, 'RESOURCE', '/shops/shopCategoryList', null, null, null, null, null, null);

-- Shop Category by Shop ID
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '某商品子类列表', 'shopCategoryByShopId', null, 'RESOURCE', '/shops/{shopId}/categories', null, null, null, null, null, null);

-- Add Shop Category
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '添加商品分类', 'addShopCategory', null, 'RESOURCE', '/shops/{shopId}/categories/add', null, null, null, null, null, null);

-- Expire Shop Category
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '下架商品分类', 'expireShopCategory', null, 'RESOURCE', '/shops/categories/{shopCategoryId}/expire', null, null, null, null, null, null);

-- Activate Shop Category
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '上架商品分类', 'activateShopCategory', null, 'RESOURCE', '/shops/categories/{shopCategoryId}/active', null, null, null, null, null, null);

-- Update Shop Category
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '编辑商品分类', 'updateShopCategory', null, 'RESOURCE', '/shops/categories/{shopCategoryId}/update', null, null, null, null, null, null);

-- Shop Ext Param List
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '商品附加属性列表', 'shopExtParamList', null, 'RESOURCE', '/shops/{shopId}/shopExtParam', null, null, null, null, null, null);


-- Save Tenant
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '添加租户', 'saveTenant', null, 'RESOURCE', '/tenants/save', null, null, null, null, null, null);

-- Update Tenant
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '修改租户', 'updateTenant', null, 'RESOURCE', '/tenants/{id}/update', null, null, null, null, null, null);

-- Delete Tenant
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '删除租户', 'deleteTenant', null, 'RESOURCE', '/tenants/{id}/delete', null, null, null, null, null, null);

-- List Tenants
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '租户列表', 'listTenants', null, 'RESOURCE', '/tenants/list', null, null, null, null, null, null);

-- Current User's Tenants
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '当前登录用户的租户列表', 'currentUserTenants', null, 'RESOURCE', '/tenants/currentList', null, null, null, null, null, null);

-- Update Tenant Shop
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '给租户添加商品', 'updateTenantShop', null, 'RESOURCE', '/tenants/{tenantId}/shop/update', null, null, null, null, null, null);

-- Update Tenant Shop Category
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '给租户添加商品', 'updateTenantShopCategory', null, 'RESOURCE', '/tenants/{tenantId}/shopCategory/update', null, null, null, null, null, null);

-- Tenant Shop List
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '某租户的商品列表', 'tenantShopList', null, 'RESOURCE', '/tenants/{tenantId}/shopList', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '渠道详情列表', 'channelDetailList', null, 'RESOURCE', '/channelDetail/list', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '添加渠道', 'saveChannelDetail', null, 'RESOURCE', '/channelDetail/save', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '更新渠道', 'updateChannelDetail', null, 'RESOURCE', '/channelDetail/update', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '获取用户列表', 'getUserList', null, 'RESOURCE', '/users/list', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '添加用户', 'save', null, 'RESOURCE', '/users/save', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '获取用户资源菜单', 'getUserResources', null, 'RESOURCE', '/users/currentResources', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '修改某用户密码', 'modifyPass', null, 'RESOURCE', '/users/{userId}/modifyPass', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '修改某用户的备注', 'modifyRemark', null, 'RESOURCE', '/users/{userId}/modifyRemark', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '修改个人密码', 'modifyCurrentUserPass', null, 'RESOURCE', '/users/currentUser/modifyPass', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '添加用户角色', 'saveUserRole', null, 'RESOURCE', '/users/{userId}/role/save', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '添加用户租户', 'saveUserTenant', null, 'RESOURCE', '/users/{userId}/tenant/saveUserTenant', null, null, null, null, null, null);

-- SQL for the /find endpoint
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, 'Find User Detail', 'findUserDetail', null, 'RESOURCE', '/userDetail/find', null, null, null, null, null, null);

-- SQL for the /save endpoint
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, 'Save User Detail', 'saveUserDetail', null, 'RESOURCE', '/userDetail/save', null, null, null, null, null, null);

-- SQL for the /update endpoint
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, 'Update User Detail', 'updateUserDetail', null, 'RESOURCE', '/userDetail/update', null, null, null, null, null, null);

-- Channel related
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, 'Channel List', 'channelList', null, 'RESOURCE', '/point/channel', null, null, null, null, null, null);

-- Withdraw Record
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, 'Withdraw Record', 'withdrawRecord', null, 'RESOURCE', '/point/withdrawRecord', null, null, null, null, null, null);

-- Withdraw Summary
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, 'Withdraw Summary', 'withdrawSummary', null, 'RESOURCE', '/point/withdrawSummary', null, null, null, null, null, null);

-- Withdraw Summary Export
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, 'Withdraw Summary Export', 'withdrawSummaryExport', null, 'RESOURCE', '/point/withdrawSummary/export', null, null, null, null, null, null);

-- Withdraw Summary Account
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, 'Withdraw Summary Account', 'withdrawSummaryAccount', null, 'RESOURCE', '/point/withdrawSummary/account', null, null, null, null, null, null);

-- Withdraw Summary Finish
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, 'Withdraw Summary Finish', 'withdrawSummaryFinish', null, 'RESOURCE', '/point/withdrawSummary/finish', null, null, null, null, null, null);

-- User Withdraw Record
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, 'User Withdraw Record', 'userWithdrawRecord', null, 'RESOURCE', '/point/user/withdrawRecord', null, null, null, null, null, null);

-- User Withdraw Account
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, 'User Withdraw Account', 'userWithdrawAccount', null, 'RESOURCE', '/point/user/withdraw/account', null, null, null, null, null, null);

-- User Withdraw Finish
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, 'User Withdraw Finish', 'userWithdrawFinish', null, 'RESOURCE', '/point/user/withdraw/finish', null, null, null, null, null, null);

-- User Withdraw Cancel
INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, 'User Withdraw Cancel', 'userWithdrawCancel', null, 'RESOURCE', '/point/user/withdraw/cancel', null, null, null, null, null, null);

INSERT INTO resource (create_time, create_by, update_time, update_by, active, name, code, parent_id, resource_type, resource_url, page_url, component, redirect, menu_name, meta, sort_id) 
VALUES ('2024-10-12 14:28:21', null, '2024-10-12 14:28:58', null, true, '任务执行图:所有图片数据', 'picList', null, 'RESOURCE', '/userTask/picList', null, null, null, null, null, null);