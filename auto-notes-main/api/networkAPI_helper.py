# -*- coding: utf-8 -*-
"""
This file provides help methods for the network API
Created on Sun Feb  9 18:31:24 2025
@author: Zeyu Pan
version 3
"""
from langchain_core.messages import SystemMessage

import locale
locale.getpreferredencoding = lambda: "UTF-8"

#记录日志
import myLogging

#引入响应和请求
from models import NetworkResponse, NodeCategory, NodeLink, Node, NoteRoute
from entities import Lecture

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

import json

# 获取默认的日志记录器
logging = myLogging.default_logger

"""
生成知识网络
"""
def getNetwork(model_name: str, url: str, lectures: list[Lecture]):
    try:
        logging.info("开始生成知识网络...")
        
        # 初始化ChatOpenAI模型
        model = ChatOpenAI(
            model=model_name,
            openai_api_base=url,
            api_key="0f78283e98d641af831083f72612950b.ZyRMh52V3a4LmmRy",
            max_tokens=4095,
            temperature=0,
        )
        logging.info(f"ChatOpenAI 模型 {model_name} 初始化成功")

        # 构建提示词
        prompt = """请根据提供的课程列表生成一个知识网络。每个课程包含主题和知识点列表。
        你需要:
        1. 将每个课程主题作为一个节点类别(category)
        2. 将每个知识点作为一个节点(node)，其中:
           - name: 知识点名称
           - category: 对应的主题类别索引
           - size: 根据importance(1-5)设置节点大小
           - route: 包含课程id和知识点名称的路由信息
        3. 分析知识点之间的关联，生成节点间的连接(link)，其中:
           - source: 源节点名称
           - target: 目标节点名称 
           - weight: 连接权重(1-5)，表示关联程度

        请以JSON格式返回，包含:
        {
          "categories": [{"idx": 0, "name": "主题1"}, ...],
          "nodes": [{"name": "知识点1", "category": 0, "size": 3, "route": {"id": "xxx", "point": "知识点1"}}, ...],
          "links": [{"source": "知识点1", "target": "知识点2", "weight": 3}, ...]
        }
        """

        # 构建输入数据
        lectures_data = []
        for lecture in lectures:
            lecture_data = {
                "id": lecture.id,
                "topic": lecture.topic,
                "points": [{"name": p.name, "importance": p.importance} for p in lecture.points]
            }
            lectures_data.append(lecture_data)

        # 构建Prompt模板
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", prompt),
            ("human", json.dumps(lectures_data, ensure_ascii=False))
        ])

        # 执行推理
        chain = prompt_template | model
        result = chain.invoke({})
        network_json = result.content

        # 解析JSON结果
        network_data = json.loads(network_json)
        
        # 构建NetworkResponse对象
        response = NetworkResponse(
            categories=[NodeCategory(**cat) for cat in network_data["categories"]],
            nodes=[Node(**node) for node in network_data["nodes"]],
            links=[NodeLink(**link) for link in network_data["links"]]
        )
        
        return response

    except Exception as e:
        logging.error(f"生成知识网络失败: {e}")
        raise e

"""
获取响应
"""
def getResponse(lectures: list[Lecture]):
    try:
        # 设置模型及网址
        model_name = 'glm-4'
        base_url = "https://open.bigmodel.cn/api/paas/v4/"
        
        # 生成知识网络
        return getNetwork(model_name, base_url, lectures)
    except Exception as e:
        raise e 