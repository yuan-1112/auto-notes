/**
 * API接口模块
 * 
 * 该模块定义了与后端交互的接口类型和API函数，包括：
 * - 接口响应和请求的类型定义
 * - 后端API调用函数
 */

import request from "./request.ts";
import {NodeCategory, NodeLink, Node, Point, RawRecognition, Lecture} from "./types.ts";

/**
 * 通用状态响应接口
 */
export interface StateResponse {
    response: string;
    [property: string]: any;
}

/**
 * 录制课程响应接口
 */
export interface RecordResponse {
    /**
     * 课程摘要，长度大约为2行。
     */
    abstract: string;
    /**
     * 课程时长，单位为秒。
     */
    duration: number;
    /**
     * id，课程的唯一id。可以随机生成但不能重复。
     */
    id: number;
    /**
     * 原始转文字结果
     */
    raw_recognition: RawRecognition[];
    /**
     * 课程主题，限制长度不能超过10个字。
     */
    topic: string;
    [property: string]: any;
}

/**
 * 笔记生成请求接口
 */
export interface NoteRequest {
    /**
     * 课程摘要
     */
    abstract: string;
    raw_recognition: RawRecognition[];
    /**
     * 课程主题
     */
    topic: string;
    [property: string]: any;
}

/**
 * 笔记生成响应接口
 */
export interface NoteResponse {
    /**
     * 多个知识点
     */
    points: Point[];
    [property: string]: any;
}

/**
 * 知识网络生成请求接口
 */
export interface NetworkRequest {
    lectures: Lecture[];
    [property: string]: any;
}

/**
 * 知识网络生成响应接口
 */
export interface NetworkResponse {
    /**
     * 节点类别, 注意：每个topic为一个category。
     */
    categories: NodeCategory[];
    /**
     * 节点链接, 注意：topic节点和其子point节点之间需要建立链接、各point之间也可以建立链接。
     */
    links: NodeLink[];
    /**
     * 节点, 注意：课程主题topic和课程的所有知识点point都会作为节点。
     */
    nodes: Node[];
    [property: string]: any;
}

/**
 * 笔记导出请求接口
 */
export interface ExportRequest {
    id: number;
    topic: string;
    abstract: string;
    points: Point[];
    [property: string]: any;
}

/**
 * 测试后端连接
 * @returns 连接是否成功
 */
export const testConnection = async () => {
    const response = (await request("/test", "GET")) as StateResponse;
    return response.response === "OK";
}

/**
 * 上传录制的课程
 * @param record - 课程录制表单数据
 * @returns 处理后的课程信息
 */
export const postRecord = async (record: FormData) => {
    const response = await request("/record", "POST", null, record, {})  // headers will be auto-generated
    return response as RecordResponse;
}

/**
 * 生成课程笔记
 * @param note - 笔记生成请求数据
 * @returns 生成的笔记内容
 */
export const getNote = async (note: NoteRequest) => {
    const response = await request("/note", "POST", note)
    return response as NoteResponse;
}

/**
 * 生成知识网络
 * @param req - 知识网络生成请求数据
 * @returns 知识网络数据
 */
export const getNetwork = async (req: NetworkRequest) => {
    const response = await request("/network", "POST", req)
    return response as NetworkResponse;
}

/**
 * 导出笔记
 * @param req - 笔记导出请求数据
 * @returns 导出是否成功
 */
export const getExport = async (req: ExportRequest) => {
    const response = (await request("/export", "POST", req)) as StateResponse;
    return response.response === "OK";
}

