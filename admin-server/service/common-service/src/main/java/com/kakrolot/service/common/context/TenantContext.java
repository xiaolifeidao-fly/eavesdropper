package com.kakrolot.service.common.context;

import java.util.List;

public class TenantContext {

    private static InheritableThreadLocal<List<Long>> context = new InheritableThreadLocal();

    public static void set(List<Long> tenantIds) {
        context.set(tenantIds);
    }

    public static List<Long> get() {
        return context.get();
    }

    public static void clear() {
        context.remove();
    }
}
