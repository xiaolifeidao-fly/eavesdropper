package com.kakrolot.service.account.api;

import com.kakrolot.service.account.api.dto.ChargeJnlDTO;

public interface ChargeJnlService {

    ChargeJnlDTO save(ChargeJnlDTO chargeJnlDTO);

    ChargeJnlDTO findByProfitPayIdAndType(Long profitPayId, String type);
}
