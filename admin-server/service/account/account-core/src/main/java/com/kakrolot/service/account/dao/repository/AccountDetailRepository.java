package com.kakrolot.service.account.dao.repository;

import com.kakrolot.common.config.CommonRepository;
import com.kakrolot.service.account.dao.po.AccountDetail;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public interface AccountDetailRepository extends CommonRepository<AccountDetail, Long> {

    @Query(nativeQuery = true, value = "select sum(amount) from account_detail where create_time >= :start and create_time <= :end and type = :type")
    BigDecimal sumAmountByDateAndType(@Param("start") Date start, @Param("end") Date end, @Param("type") String type);

    @Query(nativeQuery = true, value = "select account.business_id,u.username,u.remark,amount/100000000,description, " +
            "account.operator,account.create_time from account_detail\taccount left join account acc on " +
            "account.account_id = acc.id left join user u on acc.user_id = u.id " +
            "where account.type in ( :types ) and account.create_time>= :startTime  and account.create_time  <= :endTime order by account.create_time  desc ")
    List getRechargeByDate(@Param("types") List<String> types, @Param("startTime") Date startTime, @Param("endTime") Date endTime);

}
