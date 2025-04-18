package com.kakrolot.service.account;

import com.kakrolot.service.account.api.ChargeJnlService;
import com.kakrolot.service.account.api.dto.ChargeJnlDTO;
import com.kakrolot.service.account.convert.ChargeJnlConverter;
import com.kakrolot.service.account.dao.po.ChargeJnl;
import com.kakrolot.service.account.dao.repository.ChargeJnlRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ChargeJnlServiceImpl implements ChargeJnlService {

    @Autowired
    private ChargeJnlConverter chargeJnlConverter;

    @Autowired
    private ChargeJnlRepository chargeJnlRepository;

    @Override
    public ChargeJnlDTO save(ChargeJnlDTO chargeJnlDTO) {
        ChargeJnl chargeJnl = chargeJnlConverter.toPo(chargeJnlDTO);
        chargeJnlRepository.save(chargeJnl);
        return chargeJnlConverter.toDTO(chargeJnl);
    }

    @Override
    public ChargeJnlDTO findByProfitPayIdAndType(Long profitPayId, String type) {
        ChargeJnl chargeJnl = chargeJnlRepository.findByProfitPayIdAndType(profitPayId, type);
        return chargeJnlConverter.toDTO(chargeJnl);
    }
}
