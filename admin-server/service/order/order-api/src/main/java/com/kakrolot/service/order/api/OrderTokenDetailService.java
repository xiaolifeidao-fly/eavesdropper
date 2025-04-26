package com.kakrolot.service.order.api;

import com.kakrolot.service.business.response.BindResult;
import com.kakrolot.service.order.api.dto.OrderTokenDetailDTO;
import com.kakrolot.service.order.api.dto.QueryTokenDetailDTO;

import java.util.List;

public interface OrderTokenDetailService {

    Long save(OrderTokenDetailDTO orderTokenDetailDTO);

    OrderTokenDetailDTO findById(Long id);
    
    OrderTokenDetailDTO findByToken(String token);
    
    List<OrderTokenDetailDTO> findByOrderRecordId(Long orderRecordId);
    
    List<OrderTokenDetailDTO> findByUserId(Long userId);
    
    List<OrderTokenDetailDTO> findByAccountId(Long accountId);
    
    List<OrderTokenDetailDTO> findByTbShopId(Long tbShopId);
    
    void deleteById(Long id);
    
    /**
     * 将token绑定到淘宝店铺
     * @param token 激活码
     * @param tbShopName 淘宝店铺名称
     * @param tbShopId 淘宝店铺ID
     * @return 绑定结果，包含成功或失败的详细信息
     */
    BindResult bindToken(String token, String tbShopName, String tbShopId);
    
    /**
     * 根据条件查询激活码列表总数
     * @param queryTokenDetailDTO 查询条件
     * @return 总数
     */
    Long countByCondition(QueryTokenDetailDTO queryTokenDetailDTO);
    
    /**
     * 根据条件查询激活码列表
     * @param queryTokenDetailDTO 查询条件
     * @return 激活码列表
     */
    List<OrderTokenDetailDTO> findByCondition(QueryTokenDetailDTO queryTokenDetailDTO);
    
    /**
     * 管理员根据条件查询激活码列表总数
     * @param queryTokenDetailDTO 查询条件
     * @return 总数
     */
    Long countByManagerCondition(QueryTokenDetailDTO queryTokenDetailDTO);
    
    /**
     * 管理员根据条件查询激活码列表
     * @param queryTokenDetailDTO 查询条件
     * @return 激活码列表
     */
    List<OrderTokenDetailDTO> findByManagerCondition(QueryTokenDetailDTO queryTokenDetailDTO);

    /**
     * 根据淘宝店铺ID查找当前生效的绑定记录
     * @param tbShopId 淘宝店铺ID
     * @return 最新的生效绑定记录，如果不存在则返回null
     */
    OrderTokenDetailDTO findActiveBindingByTbShopId(String tbShopId);
} 