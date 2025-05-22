export function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 返回当天的日期字符串 格式：2025-05-21
export function getTodayDateString() {
    const today = new Date()

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`
}