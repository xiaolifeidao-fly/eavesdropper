package com.kakrolot.service.order.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.order.dao.po.OrderRecord;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigInteger;
import java.util.Date;
import java.util.List;

public interface OrderRecordRepository extends CommonRepository<OrderRecord, Long> {

    OrderRecord getById(Long id);

    @Query(nativeQuery = true, value = "update order_record set order_status=:orderStatus, init_num = :initNum, end_num = :endNum where id =:orderId")
    @Modifying
    void updateOrderStatusAndInitNumAndEndNumById(@Param("orderStatus") String orderStatus, @Param("initNum") Long initNum, @Param("endNum") Long endNum, @Param("orderId") Long orderId);

    @Query(nativeQuery = true, value = "select tenant_name,shop_name,shop_category_name,shop_id,count(1) from order_record where order_status = 'PENDING' group by tenant_id,shop_id,shop_category_id")
    List getOrderRecordSummary();

    @Query(nativeQuery = true, value = "select sum(IFNULL(amount,0)/100000000) from account_detail where " +
            "type in( :types ) and " +
            "create_time >=:startTime and create_time <=:endTime ")
    Double getConsumeSummary(@Param("types") List<String> types, @Param("startTime") Date startTime, @Param("endTime") Date endTime);

    @Query(nativeQuery = true, value = "select sum(IFNULL(amount,0)/100000000) from account_detail where " +
            "type in( :types ) and " +
            "create_time >=:startTime and create_time <=:endTime and account_id = :accountId")
    Double getConsumeSummaryByAccountId(@Param("types") List<String> types, @Param("startTime") Date startTime, @Param("endTime") Date endTime, @Param("accountId") Long accountId);

    @Query(nativeQuery = true, value = "select u.username,u.remark,sum(IFNULL(amount,0)/100000000),account.account_id from account_detail account left join account acc on " +
            "account.account_id = acc.id left join user u on acc.user_id = u.id " +
            "where account.type in( :types ) and account.create_time >=:startTime and account.create_time <=:endTime group by account.account_id")
    List getConsumeSummaryByUserName(@Param("types") List<String> types, @Param("startTime") Date startTime, @Param("endTime") Date endTime);

    @Query(nativeQuery = true, value = "select sum(IF(IFNULL(order_num,0)<IFNULL(end_num,0) - IFNULL(init_num,0),IFNULL(order_num,0),IFNULL(end_num,0) - IFNULL(init_num,0))) from order_record " +
            "where create_time >=:startTime and create_time <=:endTime ")
    Long getActualDoneSummary(@Param("startTime") Date startTime, @Param("endTime") Date endTime);

    @Query(nativeQuery = true, value = "select sum(IF(IFNULL(order_num,0)<IFNULL(end_num,0) - IFNULL(init_num,0),IFNULL(order_num,0),IFNULL(end_num,0) - IFNULL(init_num,0))) from order_record " +
            "where shop_id in (:shopIds) and create_time >=:startTime and create_time <=:endTime ")
    Long getActualDoneSummary(@Param("shopIds") List<Long> shopIds, @Param("startTime") Date startTime, @Param("endTime") Date endTime);

    @Query(nativeQuery = true, value = "select tenant_name,shop_name,sum(IFNULL(order_num,0) - (IFNULL(end_num,0) - IFNULL(init_num,0)) ) from order_record " +
            "where  create_time <=:endTime and order_status = 'PENDING' " +
            "group by shop_name;")
    List getRemainTaskSummary(@Param("endTime") Date endTime);

    @Query(nativeQuery = true, value = "select u.username,u.remark,IFNULL(balance_amount,0)/100000000 from account acc LEFT JOIN user u " +
            "ON acc.user_id = u.id  where  acc.account_status = 'ACTIVE' order by balance_amount desc")
    List getUserAccountSummary();

    @Query(nativeQuery = true, value = "select count(1) from order_record where create_time >=:start and create_time <=:end and order_status in (:orderStatuses)")
    Long countByDateAndOrderStatusIn(@Param("start") Date start, @Param("end") Date end, @Param("orderStatuses") List<String> orderStatuses);

    @Query(nativeQuery = true, value = "select * from order_record where " +
            "order_status =( :orderStatus ) and create_time <:createTime")
    List<OrderRecord> findByOrderStatusAndCreatedTime(@Param("orderStatus") String orderStatus, @Param("createTime") Date date);

    /**
     * 订单的数据汇总
     */
    @Query(nativeQuery = true, value = "select count(1),sum(IF(IFNULL(order_num,0)<IFNULL(end_num,0) - IFNULL(init_num,0), " +
            "IFNULL(order_num,0),IF(IFNULL(end_num,0) - IFNULL(init_num,0)<0,0,IFNULL(end_num,0) - IFNULL(init_num,0))))  " +
            "from order_record " +
            "where update_time> :startTime and update_time< :endTime " +
            "and order_status = :orderStatus and shop_category_id in (:shopCategoryIds)")
    List getOrderRecordSummary(@Param("shopCategoryIds") List<Long> shopCategoryIds, @Param("orderStatus") String orderStatus,
                               @Param("startTime") Date startTime, @Param("endTime") Date endTime);

    //sum(IF(IFNULL(order_num,0)<IFNULL(end_num,0) - IFNULL(init_num,0), " +
    //            "IFNULL(order_num,0),IFNULL(end_num,0) - IFNULL(init_num,0)))
    @Query(nativeQuery = true, value = "select count(1),sum(IFNULL(order_num,0) - (IFNULL(end_num,0) - IFNULL(init_num,0)))  " +
            "from order_record " +
            "where order_status = :orderStatus and shop_id in (:shopIds)")
    List getOrderRecordSummary(@Param("shopIds") List<Long> shopIds, @Param("orderStatus") String orderStatus);

    @Query(nativeQuery = true, value = "select count(1) from order_record where create_time >=:start and create_time <=:end and order_status in (:orderStatuses) and shop_id in (:shopIds)")
    Long countByDateAndOrderStatusInAndShopIdIn(@Param("start") Date start, @Param("end") Date end, @Param("orderStatuses") List<String> orderStatuses, @Param("shopIds") List<Long> shopIds);

    @Query(nativeQuery = true, value = "select count(1) from order_record where order_status in (:orderStatuses) and shop_id in (:shopIds)")
    Long countByDateAndOrderStatusInAndShopIdIn(@Param("orderStatuses") List<String> orderStatuses, @Param("shopIds") List<Long> shopIds);

    @Query(nativeQuery = true, value = "select count(1),sum(IFNULL(order_num,0) - (IFNULL(end_num,0) - IFNULL(init_num,0)) ) from order_record " +
            "where create_time <=:endTime and order_status in (:orderStatuses) " +
            "and shop_id in (:shopIds)")
    List getRemainTaskSummary(@Param("endTime") Date endTime, @Param("orderStatuses") List<String> orderStatuses, @Param("shopIds") List<Long> shopIds);

    OrderRecord findByOrderHash(String orderHash);

    @Query(nativeQuery = true, value = "select id from order_record where shop_id = :shopId and order_status = :orderStatus and create_time <= :end ")
    List<BigInteger> getIdsByShopIdAndStatusAndCreateTime(@Param("shopId") Long shopId, @Param("orderStatus") String orderStatus, @Param("end") Date end);

    OrderRecord findTopByShopIdAndBusinessIdOrderByCreateTimeDesc(Long shopId, String businessId);

    OrderRecord findTopByTinyUrlAndOrderStatusInAndShopCategoryId(String tinyUrl, List<String> orderStatuses, Long shopCategoryId);

    List<OrderRecord> findByChannelAndOrderStatusIn(String channel, List<String> orderStatuses);

    OrderRecord findByChannelAndExternalOrderId(String channel, String externalOrderId);
}
