package com.kakrolot.service.account;

import com.kakrolot.service.account.api.ProfitPayService;
import com.kakrolot.service.account.api.dto.ProfitPayDTO;
import com.kakrolot.service.account.convert.ProfitPayConverter;
import com.kakrolot.service.account.dao.po.ProfitPay;
import com.kakrolot.service.account.dao.repository.ProfitPayRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@Slf4j
public class ProfitPayServiceImpl implements ProfitPayService {

    @Autowired
    private ProfitPayConverter profitPayConverter;

    @Autowired
    private ProfitPayRepository profitPayRepository;

    @Override
    public ProfitPayDTO save(ProfitPayDTO profitPayDTO) {
        ProfitPay profitPay = profitPayConverter.toPo(profitPayDTO);
        profitPayRepository.save(profitPay);
        return profitPayConverter.toDTO(profitPay);
    }

    @Override
    public ProfitPayDTO findByDate(Date date) {
        ProfitPay profitPay = profitPayRepository.findByDate(date);
        return profitPayConverter.toDTO(profitPay);
    }

    @Override
    public List<ProfitPayDTO> findByStatus(String status) {
        List<ProfitPay> profitPays = profitPayRepository.findByStatus(status);
        return profitPayConverter.toDTOs(profitPays);
    }
}
