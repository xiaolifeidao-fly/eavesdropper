package com.kakrolot.service.user;

import com.kakrolot.service.user.api.UserLoginRecordService;
import com.kakrolot.service.user.api.dto.UserLoginRecordDTO;
import com.kakrolot.service.user.convert.UserLoginRecordConverter;
import com.kakrolot.service.user.dao.po.UserLoginRecord;
import com.kakrolot.service.user.dao.repository.UserLoginRecordRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class UserLoginRecordServiceImpl implements UserLoginRecordService {

    @Autowired
    private UserLoginRecordConverter userLoginRecordConverter;

    @Autowired
    private UserLoginRecordRepository userLoginRecordRepository;

    @Override
    public void save(UserLoginRecordDTO userLoginRecordDTO){
        UserLoginRecord userLoginRecord = userLoginRecordConverter.toPo(userLoginRecordDTO);
        userLoginRecordRepository.save(userLoginRecord);
    }
}
