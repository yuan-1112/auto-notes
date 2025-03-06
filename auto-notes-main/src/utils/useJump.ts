/**
 * 页面导航Hook
 * 
 * 该Hook封装了应用内的导航功能，提供以下功能：
 * - 笔记页面跳转（支持定位到具体知识点和小节）
 * - 识别结果页面跳转（支持定位到具体时间点）
 */

import {useRouter} from "vue-router";

export function useJump() {
  const router = useRouter();

  /**
   * 跳转到笔记页面
   * @param id - 笔记ID
   * @param point - 可选，知识点名称
   * @param subtitle - 可选，小节标题
   * 
   * @example
   * // 跳转到笔记概览
   * jumpToNote(1)
   * // 跳转到特定知识点
   * jumpToNote(1, 'Introduction')
   * // 跳转到特定知识点的特定小节
   * jumpToNote(1, 'Introduction', 'Basic Concepts')
   */
  const jumpToNote = async (id: number, point?: string, subtitle?: string) => {
    if (point && subtitle) {
      // 跳转到特定知识点的特定小节
      await router.push({path: `/detail/note/${id}`, query: {point}, hash: `#${subtitle}`})
    } else if (point) {
      // 仅跳转到特定知识点
      await router.push({path: `/detail/note/${id}`, query: {point}})
    } else {
      // 跳转到笔记概览页
      await router.push({path: `/detail/note/${id}/overview`})
    }
  }
  
  /**
   * 跳转到识别结果页面
   * @param id - 笔记ID
   * @param start - 开始时间（秒）
   * 
   * @example
   * // 跳转到识别结果的特定时间点
   * jumpToRecognition(1, 30) // 跳转到30秒处
   */
  const jumpToRecognition = async (id: number, start: number) => {
    await router.push({path: `/detail/recognition/${id}`, hash: `#time-${start}`})
  }

  return {jumpToNote, jumpToRecognition}
}
