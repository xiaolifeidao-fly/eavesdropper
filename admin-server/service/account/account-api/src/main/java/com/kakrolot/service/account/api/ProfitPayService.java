package com.kakrolot.service.account.api;

import com.kakrolot.service.account.api.dto.ProfitPayDTO;

import java.util.Date;
import java.util.List;

public interface ProfitPayService {

    ProfitPayDTO save(ProfitPayDTO profitPayDTO);

    ProfitPayDTO findByDate(Date date);

    List<ProfitPayDTO> findByStatus(String status);
}
