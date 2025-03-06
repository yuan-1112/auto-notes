/**
 * Beta功能管理Hook
 * 
 * 该Hook用于管理应用的Beta功能开关，提供以下功能：
 * - 维护Beta状态
 * - 根据Beta状态条件性返回不同内容
 * - 在组件挂载时自动加载Beta状态
 */

import {onMounted, ref} from "vue";
import {getIsBeta, getIsEnglish} from "./cache.ts";

export const useBeta = () => {
    // Beta功能开关状态
    const isBeta = ref(true);

    /**
     * 根据Beta状态返回对应内容
     * @param yes - Beta版本下显示的内容
     * @param no - 非Beta版本下显示的内容
     * @returns 根据当前Beta状态返回对应内容
     */
    const beta = (yes: string, no: string) => {
        return isBeta.value? yes : no;
    }

    // 组件挂载时从缓存加载Beta状态
    onMounted(async () => {
        isBeta.value = await getIsBeta();
    })

    return { beta, isBeta }
}