package com.kakrolot.service.approve;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.kakrolot.base.http.okhttp.OkHttpUtils;
import com.kakrolot.service.approve.api.UserTaskApproveService;
import com.kakrolot.service.approve.api.dto.UserApproveStatus;
import com.kakrolot.service.approve.api.dto.UserApproveTaskDTO;
import okhttp3.Response;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserTaskApproveServiceImpl implements UserTaskApproveService {

    @Value("${barry.query.url:}")
    private String bladeUrl;

    @Override
    public Long countUserApproveTasksByOrderId(Long orderId, List<UserApproveStatus> userApproveStatuses) {
        JSONObject result = getUserApproveTaskNums(orderId, userApproveStatuses);
        String code = result.getString("code");
        if (!StringUtils.equals(code, "1")) {
            return 0L;
        }
        return result.getLong("data");
    }

    private JSONObject getUserApproveTaskNums(Long orderId, List<UserApproveStatus> userApproveStatuses) {
        String url = bladeUrl + "/userTasks/queryNum?orderId=" + orderId + "&statues=" + buildUserTasksStatus(userApproveStatuses);
        return get(url);
    }

    @Override
    public List<UserApproveTaskDTO> findUserApproveTasksByOrderId(Long orderId, List<UserApproveStatus> userApproveStatuses, int startIndex, int pageSize) {
        if (startIndex <= 0) {
            startIndex = 1;
        }
        JSONObject result = getUserApproveTasks(orderId, userApproveStatuses, startIndex, pageSize);
        return toUserApproveTaskDTOs(result);
    }

    @Override
    public boolean approve(Long userTaskId, UserApproveStatus userApproveStatus) {
        JSONObject body = new JSONObject();
        body.put("userTaskId", userTaskId);
        body.put("status", userApproveStatus.name());
        String url = bladeUrl + "/userTasks/approve";
        JSONObject result = post(url, body);
        String code = result.getString("code");
        if (!StringUtils.equals(code, "1")) {
            return false;
        }
        return result.getBoolean("data");
    }

    @Override
    public boolean approve(List<Long> userTaskIds, UserApproveStatus userApproveStatus) {
        JSONObject body = new JSONObject();
        List<String> userTaskIdsStr = userTaskIds.stream().map(String::valueOf).collect(Collectors.toList());
        body.put("userTaskIds", userTaskIdsStr);
        body.put("status", userApproveStatus.name());
        String url = bladeUrl + "/userTasks/approves";
        JSONObject result = post(url, body);
        String code = result.getString("code");
        if (!StringUtils.equals(code, "1")) {
            return false;
        }
        return result.getBoolean("data");
    }

    private List<UserApproveTaskDTO> toUserApproveTaskDTOs(JSONObject result) {
        String code = result.getString("code");
        if (!StringUtils.equals(code, "1")) {
            return Collections.emptyList();
        }
        JSONArray jsonArray = result.getJSONArray("data");
        if (jsonArray == null || jsonArray.size() == 0) {
            return Collections.emptyList();
        }
        List<UserApproveTaskDTO> userApproveTaskDTOs = new ArrayList<>();
        for (Object object : jsonArray) {
            JSONObject json = (JSONObject) object;
            userApproveTaskDTOs.add(JSON.toJavaObject(json, UserApproveTaskDTO.class));
        }
        return userApproveTaskDTOs;
    }

    private JSONObject getUserApproveTasks(Long orderId, List<UserApproveStatus> userApproveStatuses, int startIndex, int pageSize) {
        String url = bladeUrl + "/userTasks/query?orderId=" + orderId + "&statues=" + buildUserTasksStatus(userApproveStatuses) + "&startIndex=" + startIndex + "&pageSize=" + pageSize;
        return get(url);
    }

    private String buildUserTasksStatus(List<UserApproveStatus> userApproveStatuses) {
        StringBuilder stringBuilder = new StringBuilder();
        for (UserApproveStatus userApproveStatus : userApproveStatuses) {
            stringBuilder.append(userApproveStatus.name() + ",");
        }
        return stringBuilder.deleteCharAt(stringBuilder.length() - 1).toString();
    }

    private JSONObject get(String url) {
        Response response = null;
        try {
            response = OkHttpUtils.doGet(url, null);
            String result = response.body().string();
            return JSONObject.parseObject(result);
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }

    private JSONObject post(String url, JSONObject body) {
        Response response = null;
        try {
            response = OkHttpUtils.doPost(url, body, "application/json", null);
            String result = response.body().string();
            return JSONObject.parseObject(result);
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (response != null) {
                response.close();
            }
        }
    }
}
