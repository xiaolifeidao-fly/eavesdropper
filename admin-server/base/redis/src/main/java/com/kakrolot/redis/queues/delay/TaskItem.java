package com.kakrolot.redis.queues.delay;

import lombok.Data;

@Data
public class TaskItem<T> {

    public String id;
    public T msg;
}
