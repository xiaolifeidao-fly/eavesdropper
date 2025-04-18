package com.kakrolot.service.approve.support;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 *
 */
@Component
@Slf4j
public class AssignArithmetic {


    @Autowired
    protected ApproveUserSupport approveUserSupport;

    public Long choseUserId(Long num) {
        try {
            return approveUserSupport.choseUserId(num);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
