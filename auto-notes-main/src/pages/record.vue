<template>
  <!-- 全屏居中的容器 -->
  <div class="min-h-screen flex items-center justify-center p-6">
    <!-- 白色圆角卡片容器 -->
    <div class="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
      <!-- 暂时注释掉的标题 -->
<!--      <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">高级音频录制器</h1>-->

      <!-- 初始状态：显示开始录音按钮 -->
      <div v-if="!isRecording && !audioUrl" class="flex justify-center">
        <button @click="startRecording" class="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition duration-300 ease-in-out flex items-center">
          <MicIcon class="w-6 h-6 mr-2" />
          开始录音
        </button>
      </div>

      <!-- 录音状态：显示暂停和停止按钮 -->
      <div v-if="isRecording" class="flex justify-center space-x-4">
        <button @click="pauseRecording" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out flex items-center">
          <!-- 根据录音状态显示不同图标 -->
          <PauseIcon v-if="!isPaused" class="w-5 h-5 mr-2" />
          <PlayIcon v-else class="w-5 h-5 mr-2" />
          {{ isPaused ? '继续' : '暂停' }}
        </button>
        <button @click="stopRecording" class="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out flex items-center">
          <SquareIcon class="w-5 h-5 mr-2" />
          停止
        </button>
      </div>

      <!-- 录音完成状态：显示音频播放器和操作按钮 -->
      <div v-if="audioUrl" class="mt-8 space-y-4">
        <!-- 音频播放器 -->
        <audio :src="audioUrl" controls class="w-full"></audio>
        <div class="flex justify-center space-x-4">
          <!-- 上传按钮 -->
          <button @click="uploadAudio" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out flex items-center">
            <UploadIcon class="w-5 h-5 mr-2" />
            上传
          </button>
          <!-- 重新录制按钮 -->
          <button @click="resetRecording" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out flex items-center">
            <RefreshCwIcon class="w-5 h-5 mr-2" />
            重新录制
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// TODO: 实现本地录音功能，可能需要与Rust进行交互
throw new Error('此功能目前仅在浏览器中可用。')

// 导入必要的 Vue 组件和图标
import { ref, onUnmounted } from 'vue'
import { MicIcon, PauseIcon, PlayIcon, SquareIcon, UploadIcon, RefreshCwIcon } from 'lucide-vue-next'

// 定义响应式状态
const isRecording = ref(false)  // 是否正在录音
const isPaused = ref(false)     // 是否暂停
const audioUrl = ref(null)      // 录音文件的 URL

// 录音相关变量
let mediaRecorder = null        // MediaRecorder 实例
let audioChunks = []           // 存储录音数据的数组

// 开始录音的函数
const startRecording = async () => {
  try {
    // 请求麦克风权限并获取音频流
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)

    // 处理录音数据
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }

    // 录音停止时的处理
    mediaRecorder.onstop = () => {
      // 将录音数据转换为 Blob 对象
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
      // 创建音频 URL
      audioUrl.value = URL.createObjectURL(audioBlob)
      // 重置状态
      isRecording.value = false
      isPaused.value = false
    }

    // 开始录音
    mediaRecorder.start()
    isRecording.value = true
  } catch (error) {
    console.error('Error accessing microphone:', error)
    alert('无法访问麦克风。请确保您已授予必要的权限。')
  }
}

// 暂停/继续录音
const pauseRecording = () => {
  if (isPaused.value) {
    mediaRecorder.resume()
  } else {
    mediaRecorder.pause()
  }
  isPaused.value = !isPaused.value
}

// 停止录音
const stopRecording = () => {
  mediaRecorder.stop()
  // 停止所有音轨
  mediaRecorder.stream.getTracks().forEach(track => track.stop())
}

// 上传音频（待实现）
const uploadAudio = () => {
  // 这里添加上传逻辑
  console.log('上传音频文件')
}

// 重置录音
const resetRecording = () => {
  audioUrl.value = null
  audioChunks = []
}

// 组件卸载时清理资源
onUnmounted(() => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
    mediaRecorder.stream.getTracks().forEach(track => track.stop())
  }
})
</script>