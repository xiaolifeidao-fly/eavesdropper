package com.kakrolot.web.controller.impl;

import com.kakrolot.business.service.user.UserAccountService;
import com.kakrolot.common.utils.AmountUtils;
import com.kakrolot.lock.KakrolotLock;
import com.kakrolot.service.account.api.AccountDetailService;
import com.kakrolot.service.account.api.AccountService;
import com.kakrolot.service.account.api.dto.AccountDTO;
import com.kakrolot.service.account.api.dto.AccountLockKey;
import com.kakrolot.service.account.api.dto.QueryAccountDetailDTO;
import com.kakrolot.web.controller.BaseController;
import com.kakrolot.web.convert.account.AccountDetailWebConverter;
import com.kakrolot.web.convert.account.AccountWebConverter;
import com.kakrolot.web.model.PageModel;
import com.kakrolot.web.model.WebResponse;
import com.kakrolot.web.model.account.AccountRechargeModel;
import com.kakrolot.web.model.account.AccountDetailModel;
import com.kakrolot.web.model.account.AccountModel;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/accounts")
@Slf4j
public class AccountController extends BaseController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private UserAccountService userAccountService;

    @Autowired
    private KakrolotLock kakrolotLock;

    @Autowired
    private AccountDetailWebConverter accountDetailWebConverter;

    @Autowired
    private AccountWebConverter accountWebConverter;

    @Autowired
    private AccountDetailService accountDetailService;

    @RequestMapping(value = "/recharge/list", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "获取充值明细列表", httpMethod = "GET")
    public WebResponse<List<AccountRechargeModel>> getAccountDetailList(AccountDetailModel accountDetailModel) {
        List chargeList = accountDetailService.findChargeDetailByDate(accountDetailModel.getStartTime(), accountDetailModel.getEndTime());
        return WebResponse.success(accountDetailWebConverter.toRechargeModel(chargeList));
    }

    @RequestMapping(value = "/{accountId}/list", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "获取某账户明细列表", httpMethod = "GET")
    public WebResponse<PageModel<AccountDetailModel>> getAccountDetailList(@PathVariable(name = "accountId") Long accountId,
                                                                           AccountDetailModel accountDetailModel,
                                                                           @RequestParam("page") int startIndex,
                                                                           @RequestParam("limit") int pageSize,
                                                                           @RequestParam("sort") String sort) {
        QueryAccountDetailDTO queryAccountDetailDTO = accountDetailWebConverter.toQueryDTO(accountDetailModel, startIndex, pageSize);
        Long count = accountDetailService.countByCondition(queryAccountDetailDTO, accountId);
        List<QueryAccountDetailDTO> queryAccountDetailDTOs = null;
        if (count > 0) {
            queryAccountDetailDTOs = accountDetailService.findByCondition(queryAccountDetailDTO, accountId);
        }
        return WebResponse.success(accountDetailWebConverter.toPageModel(queryAccountDetailDTOs, count));
    }

    @RequestMapping(value = "/currentAccount/list", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "获取当前登录用户账户明细列表", httpMethod = "GET")
    public WebResponse<PageModel<AccountDetailModel>> getUserList(AccountDetailModel accountDetailModel,
                                                                  @RequestParam("page") int startIndex,
                                                                  @RequestParam("limit") int pageSize,
                                                                  @RequestParam("sort") String sort) {
        AccountDTO accountDTO = accountService.findByUserId(getCurrentUser().getId());
        QueryAccountDetailDTO queryAccountDetailDTO = accountDetailWebConverter.toQueryDTO(accountDetailModel, startIndex, pageSize);
        Long count = accountDetailService.countByCondition(queryAccountDetailDTO, accountDTO.getId());
        List<QueryAccountDetailDTO> queryAccountDetailDTOs = null;
        if (count > 0) {
            queryAccountDetailDTOs = accountDetailService.findByCondition(queryAccountDetailDTO, accountDTO.getId());
        }
        return WebResponse.success(accountDetailWebConverter.toPageModel(queryAccountDetailDTOs, count));
    }

    @RequestMapping(value = "/currentAccount", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "获取当前登录用户账户信息", httpMethod = "GET")
    public WebResponse<AccountModel> getUserList() {
        AccountDTO accountDTO = accountService.findByUserId(getCurrentUser().getId());
        return WebResponse.success(accountWebConverter.toModel(accountDTO));
    }

    @RequestMapping(value = "/{accountId}/payAmount", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "充值", httpMethod = "POST")
    public WebResponse<Object> payAmount(@PathVariable("accountId") Long accountId, @RequestBody AccountModel accountModel) {
        BigDecimal amount = accountModel.getAmount();
        if (amount == null) {
            return WebResponse.error("充值金额不能为空");
        }
        if (amount.doubleValue() <= 0.00d) {
            return WebResponse.error("充值金额需大于0");
        }
        AccountDTO accountDTO = accountService.findById(accountId);
        if (accountDTO == null) {
            return WebResponse.error("账户不存在");
        }
        String lockType = AccountLockKey.LOCK_KEY;
        String key = lockType + "_" + accountDTO.getUserId();
        try {
            boolean lockResult = kakrolotLock.lock(lockType, key);
            if (!lockResult) {
                return WebResponse.error("账户被锁定,请稍后再试");
            }
        } catch (Exception e) {
            log.error("payAmount getLock by {} error", key);
            return WebResponse.error("充值发生未知异常");
        }
        try {
            accountDTO = accountService.findById(accountId);
            return WebResponse.response(userAccountService.payAndGivenAmount(accountDTO, amount, accountModel.getGivenScale(), getRemoteIp(), getCurrentUser().getUsername()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            kakrolotLock.unLock(lockType, lockType);
        }
    }

    @RequestMapping(value = "/{accountId}/blockAccount", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "冻结账户", httpMethod = "POST")
    public WebResponse<String> blockAccount(@PathVariable("accountId") Long accountId) {
        AccountDTO accountDTO = accountService.findById(accountId);
        if (accountDTO == null) {
            return WebResponse.error("该用户未开通账户");
        }
        accountService.blockAccount(accountDTO.getId());
        return WebResponse.success("冻结账户成功");
    }

}
