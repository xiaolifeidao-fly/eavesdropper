package com.kakrolot.order.gateway.controller;

import com.kakrolot.order.gateway.model.WebResponse;
import com.kakrolot.service.approve.api.ApproveUserService;
import com.kakrolot.service.approve.api.dto.ApproveUserDTO;
import com.kakrolot.service.user.api.dto.UserStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/approveUsers")
@Slf4j
public class ApproveUserController extends BaseController {

    @Autowired
    private ApproveUserService approveUserService;

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    @ResponseBody
    public WebResponse<String> save(@RequestParam(name = "userId") Long userId) {
        ApproveUserDTO approveUserDTO = buildApproveUserDTO(userId);
        approveUserService.save(approveUserDTO);
        return WebResponse.success("success");
    }

    @RequestMapping(value = "/remove", method = RequestMethod.POST)
    @ResponseBody
    public WebResponse<String> remove(@RequestParam(name = "userId") Long userId) {
        approveUserService.deleteByUserId(userId);
        return WebResponse.success("success");
    }

    private ApproveUserDTO buildApproveUserDTO(Long userId) {
        ApproveUserDTO approveUserDTO = approveUserService.findByUserId(userId);
        if (approveUserDTO == null) {
            approveUserDTO = new ApproveUserDTO();
            approveUserDTO.setStatus(UserStatus.ACTIVE.name());
            approveUserDTO.setUserId(userId);
        }
        return approveUserDTO;
    }
}
