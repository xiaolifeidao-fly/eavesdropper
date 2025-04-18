package com.kakrolot.service.approve.support;

import com.kakrolot.redis.util.RedisUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Random;
import java.util.Set;

@Component
@Slf4j
public class ApproveUserSupport {

    private static final String PRE_ASSIGN_CAL = "APPROVE_USER_AVG_ASSIGN_CAL";

    private static final String QUEUE_AGENT_ASSIGN_TOTAL_NUM = "APPROVE_USER_AGENT_ASSIGN_TOTAL_NUM_";

    @Autowired
    private RedisUtil redisUtil;

    public Long choseUserId(Long num) {
        Long userId = choseMinScoreUserId();
        if (userId == null) {
            log.warn("QueueAssignNumSupport could not choose userId, please init redis userId rank");
            return null;
        }
        redisUtil.zincrby(PRE_ASSIGN_CAL, num.intValue(), userId.toString());
        return userId;
    }

    private Long choseMinScoreUserId(){
        Set<String> set = redisUtil.zrange(ApproveUserSupport.PRE_ASSIGN_CAL, 0, 1);
        for (String value : set) {
            return Long.valueOf(value);
        }
        return null;
    }

    public void addUserId(Long userId) {
        try {
            Double score = redisUtil.zscore(PRE_ASSIGN_CAL, userId.toString());
            if (score != null && score > 0) {
                log.info("has add agentId {}", userId);
                return;
            }
            Long minScoreAgentId = choseMinScoreUserId();
            if (minScoreAgentId == null) {
                minScoreAgentId = userId;
            }

            Double minScore = getMinScore(minScoreAgentId);
            redisUtil.zincrby(PRE_ASSIGN_CAL, minScore.intValue(), userId.toString());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void removeUserId(Long userId) {
        try {
            redisUtil.zrem(PRE_ASSIGN_CAL, userId.toString());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private Double getMinScore(Long minScoreAgentId) {
        try {
            Double minScore = redisUtil.zscore(ApproveUserSupport.PRE_ASSIGN_CAL, minScoreAgentId.toString());
            if (minScore == null) {
                return getDefaultScore();
            }
            String score = new BigDecimal(minScore).intValue() + ".";
            int random = new Random().nextInt(10000);
            return Double.parseDouble(score + random);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private double getDefaultScore() {
        String defaultAssignNum = "1.";
        int random = new Random().nextInt(10000);
        return Double.parseDouble(defaultAssignNum + random);
    }

}
