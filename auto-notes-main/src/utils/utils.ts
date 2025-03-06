/**
 * 通用工具函数模块
 * 
 * 该模块提供了一些通用的工具函数，包括：
 * - 消息提示功能
 * - 时间格式化功能
 */

import {ToastEventBus} from "primevue";

/**
 * 显示信息提示
 * @param msg - 要显示的信息内容
 * 
 * @example
 * info('正在加载数据...')
 */
export const info = async (msg: string) => {
    await ToastEventBus.emit('add', { 
        severity: "info",      // 提示类型为信息
        summary: "日志",       // 提示标题
        detail: msg,          // 提示内容
        life: 3000            // 显示时间3秒
    });
}

/**
 * 显示成功提示
 * @param msg - 成功信息内容
 * 
 * @example
 * success('数据保存成功！')
 */
export const success = async (msg: string) => {
    await ToastEventBus.emit('add', { 
        severity: "success",   // 提示类型为成功
        summary: "任务成功执行", // 提示标题
        detail: msg,          // 提示内容
        life: 3000           // 显示时间3秒
    });
}

/**
 * 将秒数转换为时:分:秒格式
 * @param seconds - 要转换的秒数
 * @returns 格式化后的时间字符串 (HH:MM:SS)
 * 
 * @example
 * formatTime(3661) // 返回 "01:01:01"
 * formatTime(70)   // 返回 "00:01:10"
 */
export const formatTime = (seconds: number) => {
    // 计算小时数
    const hours = Math.floor(seconds / 3600);
    const remainingSeconds = seconds % 3600;
    // 计算分钟数
    const minutes = Math.floor(remainingSeconds / 60);
    // 计算剩余秒数
    const finalSeconds = remainingSeconds % 60;

    // 补零处理，确保每个部分都是两位数
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(finalSeconds).padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}

// 注释掉的时间区间格式化函数
// export const formatDuration = (start: number, end: number, sep = ' - ') => {
//     return formatTime(start) + sep + formatTime(end);
// }