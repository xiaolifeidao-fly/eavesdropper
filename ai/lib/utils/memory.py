import functools
import inspect
from typing import Callable, TypeVar, Any,Optional

from lib.utils import memory_context

# 定义一个类型变量T，表示返回值的类型
T = TypeVar('T')

# 装饰器函数
def cache(rule: str) -> Callable[[Callable[..., T]], Callable[..., T]]:
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> T:
            # 将参数替换到规则字符串中
            sig = inspect.signature(func)
            bound_args = sig.bind(*args, **kwargs)
            bound_args.apply_defaults()

            # 创建包含参数名称和值的字典
            arg_dict = bound_args.arguments
            key = rule.format(**arg_dict)
            key = f"{func.__name__}_{key}"
            memory_value : Optional[T] = memory_context.get(key)
            if memory_value :
                return memory_value
            result = func(*args, **kwargs)
            if result:
                memory_context.put(key, result)
            return result
        return wrapper
    return decorator
