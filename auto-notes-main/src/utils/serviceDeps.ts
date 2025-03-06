/**
 * 服务依赖管理模块
 * 
 * 该模块负责管理应用的后端服务依赖，主要功能包括：
 * 1. UV包管理器的安装和状态管理
 *    - 检查UV是否已安装
 *    - 跨平台安装UV（支持Windows/MacOS/Linux）
 * 
 * 2. FastAPI后端服务的管理
 *    - 启动后端服务
 *    - 监控服务状态
 *    - 处理服务输出
 * 
 * 3. 错误处理和状态反馈
 *    - 提供加载状态指示
 *    - 处理安装和启动过程中的错误
 *    - 服务状态的实时反馈
 */

import {Ref} from "vue";
import {resolveResource} from "@tauri-apps/api/path";
import {Command} from "@tauri-apps/plugin-shell";
import {testConnection} from "../apis.ts";
import {platform} from "@tauri-apps/plugin-os";
import {success} from "./utils.ts";
import {load} from "@tauri-apps/plugin-store";
import {info} from "@tauri-apps/plugin-log"

// 初始化本地存储，启用自动保存
const store = await load('store.json', {autoSave: true});

// 检查 uv 包管理器是否已安装
export const checkUvInstalled = async () => {
    if (!await store.get<Boolean>('uv')) {
        await store.set('uv', true);
        return false;
    } else {
        return true;
    }
}

// 移除 uv 安装标记
export const removeUvInstalled = async () => {
    await store.set('uv', false);
}

// 安装 uv 包管理器
export const installUv = async (loading: Ref<boolean>) => {
    const apiPath = await resolveResource('../api/')
    const currentPlatform = platform();
    loading.value = true

    // 不同平台的安装命令配置
    const command = {
        windows: {
            beforeExec: '',  // Windows 平台不需要前置命令
            script: 'winget install --id=astral-sh.uv -e'
        },
        macos: {
            beforeExec: 'chmod +x uv_macos.sh',
            script: './uv_macos.sh'
        },
        linux: {
            beforeExec: 'chmod +x uv_linux.sh',
            script: './uv_linux.sh'
        }
    }

    // 检查平台支持
    if (!command[currentPlatform]) {
        throw new Error('不支持当前平台，请手动安装`uv`!')
    }

    // 解析安装命令
    const script = command[currentPlatform].script.split(' ')
    const beforeExec = command[currentPlatform].beforeExec.split(' ')

    // 执行前置命令（如果有）
    if (beforeExec[0] !== '') {
        const rs1 = await Command.create(beforeExec[0], beforeExec.slice(1), {cwd: apiPath}).execute()
        if (rs1.code !== 0) {
            loading.value = false
            throw new Error(rs1.stderr)
        }
        console.log(rs1.stdout)
        info(rs1.stdout)
    }

    // 执行安装命令
    const rs2 = await Command.create(script[0], script.slice(1), {cwd: apiPath}).execute()
    if (rs2.code !== 0) {
        loading.value = false
        throw new Error(rs2.stderr)
    }
    console.log(rs2.stdout)
    info(rs2.stdout)
    loading.value = false
    await success("依赖安装成功！")
}

// 启动后端服务
export const bootService = async (loading: Ref<boolean>) => {
    let count = 0;
    const apiPath = await resolveResource('../api/')
    loading.value = true

    // 创建启动命令
    const command = await Command.create('uv', ['run', 'fastapi', 'run', 'main.py', '--port', '5100'], {
        cwd: apiPath, 
        encoding: 'utf8', 
        env: {
            "PYTHONIOENCODING": "utf-8",
            "PYTHONLEGACYWINDOWSSTDIO": "utf-8"
        }
    });

    // 监听命令执行完成事件
    command.on('close', (data) => {
        console.log(`command finished with code ${data.code} and signal ${data.signal}`)
    });

    // 监听命令执行错误
    command.on('error', (err) => {
        throw new Error(`command error: "${err}"`);
    });

    // 监听标准输出
    command.stdout.on('data', line => {
        console.log(`command stdout: "${line}"`);
        info(line);
    });
    
    // 监听错误输出
    command.stderr.on('data', line => {
        throw new Error(`command stderr: "${line}"`);
    });

    // 启动命令
    await command.spawn();

    // 定期检查服务是否启动成功
    const interval = setInterval(async () => {
        const isConnected = await testConnection()
        if (isConnected) {
            clearInterval(interval)
            loading.value = false
            await success("服务启动成功！")
        } else {
            count += 1
            // 超过40秒（20次 * 2秒）未启动则判定失败
            if (count > 20) {
                clearInterval(interval)
                loading.value = false
                throw new Error("服务启动失败！")
            }
        }
    }, 2000)
}