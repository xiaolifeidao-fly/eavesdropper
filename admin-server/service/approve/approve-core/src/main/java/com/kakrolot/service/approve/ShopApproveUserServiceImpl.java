package com.kakrolot.service.approve;

import com.kakrolot.service.approve.api.ShopApproveUserService;
import com.kakrolot.service.approve.api.dto.ShopApproveUserDTO;
import com.kakrolot.service.approve.converter.ShopApproveUserConverter;
import com.kakrolot.service.approve.dao.po.ShopApproveUser;
import com.kakrolot.service.approve.dao.repository.ShopApproveUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShopApproveUserServiceImpl implements ShopApproveUserService {

    @Autowired
    private ShopApproveUserConverter shopApproveUserConverter;

    @Autowired
    private ShopApproveUserRepository shopApproveUserRepository;

    @Override
    public void save(ShopApproveUserDTO shopApproveUserDTO) {
        ShopApproveUser shopApproveUser = shopApproveUserConverter.toPo(shopApproveUserDTO);
        shopApproveUserRepository.save(shopApproveUser);
    }

    @Override
    public List<ShopApproveUserDTO> getByUserId(Long userId) {
        List<ShopApproveUser> shopApproveUsers = shopApproveUserRepository.findByUserId(userId);
        return shopApproveUserConverter.toDTOs(shopApproveUsers);
    }
}
