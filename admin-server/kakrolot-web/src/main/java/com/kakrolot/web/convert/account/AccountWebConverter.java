package com.kakrolot.web.convert.account;

import com.kakrolot.common.utils.AmountUtils;
import com.kakrolot.service.account.api.dto.AccountDTO;
import com.kakrolot.web.convert.WebConvert;
import com.kakrolot.web.model.PageModel;
import com.kakrolot.web.model.account.AccountModel;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AccountWebConverter extends WebConvert<AccountDTO, AccountModel> {

    public PageModel<AccountModel> toPageModel(List<AccountDTO> accountDTOs, Long count) {
        PageModel<AccountModel> pageModel = new PageModel<>();
        pageModel.setTotal(count);
        pageModel.setItems(toModels(accountDTOs));
        return pageModel;
    }

    @Override
    public AccountModel toModel(AccountDTO accountDTO) {
        AccountModel accountModel = super.toModel(accountDTO);
        accountModel.setBalanceAmount(accountDTO.getBalanceAmount());
        return accountModel;

    }
}

