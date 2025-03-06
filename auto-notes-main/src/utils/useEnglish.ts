/**
 * 国际化语言Hook
 * 
 * 该Hook用于管理应用的语言切换功能，提供以下功能：
 * - 维护语言状态（英文/中文）
 * - 提供便捷的文本国际化方法
 * - 在组件挂载时自动加载语言设置
 */

import {onMounted, ref} from "vue";
import {getIsEnglish} from "./cache.ts";

export const useEnglish = () => {
    // 语言状态：true为英文，false为中文
    const isEnglish = ref(true);

    /**
     * 根据当前语言返回对应文本
     * @param en - 英文文本
     * @param zh - 中文文本
     * @returns 根据当前语言设置返回相应文本
     * 
     * @example
     * const { i18n } = useEnglish();
     * const text = i18n('Hello', '你好');  // 当isEnglish为true时返回'Hello'，为false时返回'你好'
     */
    const i18n = (en: string, zh: string) => {
        return isEnglish.value ? en : zh; 
    }

    // 组件挂载时从缓存加载语言设置
    onMounted(async () => {
        isEnglish.value = await getIsEnglish();
    })

    return { i18n }
}