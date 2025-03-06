import {load, Store} from "@tauri-apps/plugin-store";
import {Cache, NodeLink} from "../types.ts";
import {EChartsOption} from "echarts";
//缓存管理工具，主要负责应用的本地数据存储和管理。

// 示例缓存数据，用于初始化时的默认内容
const EXAMPLE_CACHE: Cache[] = [
    {
        id: 1,
        tags: ['Discrete Structures', 'ICSI210'],
        duration: 3421,
        abstract: 'The lecture includes the language of propositions and its applications, and logical equivalents of propositions.',
        topic: 'Propositional Logic',
        raw_recognition: [
                {
                    "start": 132,
                    "end": 137,
                    "text": "Well, for this section, we will talk about logics and proofs, which is the core of the course."
                },
                {
                    "start": 137,
                    "end": 142,
                    "text": "When it comes to the first concept propositions, it is a declarative sentence that is either true or false. "
                },
                {
                    "start": 143,
                    "end": 150,
                    "text": "The truth value of a proposition is determined, it can be predicated from the facts or the rules of inference."
                },
                {
                    "start": 151,
                    "end": 158,
                    "text": "Here are some examples of propositions, we can learn deeper about the definition of propositions."
                },
                {
                    "start": 159,
                    "end": 166,
                    "text": "Washington, D.C., is the capital of the United States of America. This sentence follows the fact, and it's true, "
                },
                {
                    "start": 166,
                    "end": 172,
                    "text": "So we can say that it is a proposition."
                },
                {
                    "start": 173,
                    "end": 179,
                    "text": "Toronto is the capital of Canada. This sentence also follows the fact, and it's true."
                },
                {
                    "start": 180,
                    "end": 186,
                    "text": "1 + 0 = 1. This sentence is a mathematical proposition, and it's true."
                },
                {
                    "start": 187,
                    "end": 193,
                    "text": "0 + 0 = 2. This sentence is also a mathematical proposition, and it's false."
                }
        ],
        points: [
            {
                name: 'The Language of Propositions',
                importance: 3,
                links: [],
                summary: "",
                subtitles: [
                    {
                        subtitle: '1. Definition',
                        md: `         
A **proposition** is a declarative sentence that is either true or false. 
`,
                        raw_recognition: [{start: 132}]
                    },
                    {
                        subtitle: "2. Example Analysis",
                        md: `
# Problem
How do we distinguish between **propositions and non-propositions** in logic?
     
# Solution
A **proposition** is a declarative statement that is either true or false. Examples:

- "Washington, D.C., is the capital of the United States of America." (True)

- "0 + 0 = 2." (False)

A **non-proposition** is a statement that cannot be classified as true or false. These include commands, questions, and expressions with variables. Examples:

- "Sit down!" (Command)

- "What time is it?" (Question)

# Analysis

Non-propositions, on the other hand, lack a truth value and are not suitable for logical analysis. For example, commands and questions are meant to elicit actions or responses, not to assert facts.


                        `,
                        raw_recognition: [{start: 151}]
                    },
                    {
                        subtitle: "3. Symbol Representations",
                        md: `
1. Proposition valuables are represented by \`p, q, r, s, ...\`.
2. Constants: 
    **T**: A proposition that is always true (tautology).
    **F**: A proposition that is always false (contradiction).
3. Proposition Logics:
    - **Negation**  
    Symbol: \`¬\`  
    Example: \`¬p\` (not p).

    - **Conjunction**  
    Symbol: \`∧\`  
    Example: \`p ∧ q\` (p and q).

    - **Disjunction**  
    Symbol: \`∨\`  
    Example: \`p ∨ q\` (p or q).

    - **Implication**  
    Symbol: \`→\`  
    Example: \`p → q\` (if p, then q).

    - **Biconditional**  
    Symbol: \`↔\`  
    Example: \`p ↔ q\` (p if and only if q).
                        `,
                        raw_recognition: [{start: 400}]
                    }
                ]
            },
            {
                name: "Logical Equivalents",
                importance: 2,
                links: [],
                summary: "",
                subtitles: [
                ]
            },
            {
                name: "Applications of Propositional Logic",
                importance: 2,
                links: [],
                summary: "",
                subtitles: [
                ]
            },
        ]
    }
];

// 初始化存储实例，启用自动保存
const store: Store = await load('store.json', {autoSave: true});

// 读取所有缓存数据，如果为空则使用示例数据
export const readAllCache = async () => {
    let cache = await store.get<Cache[]>('cache');
    if (!cache || cache.length === 0) {
        cache = EXAMPLE_CACHE;
        await store.set('cache', cache);
    }
    return cache;
}

// 根据ID读取特定缓存数据
export const readCache = async (id: number) => {
    const cache = await readAllCache();
    const result = cache.find(c => c.id === id);
    if (!result) {
        throw new Error('Cache not found');
    }
    return result;
}

// 更新指定ID的缓存数据
export const updateCache = async (id: number, kv: object) => {
    const cache = await readAllCache();
    const index = cache.findIndex(c => c.id === id);
    if (index === -1) {
        throw new Error('Cache not found');
    }
    // 使用展开运算符合并更新数据
    cache[index] = {...cache[index], ...kv};
    await store.set('cache', cache);
    await setShouldUpdateChart(true); // 懒更新：仅在查看图表时更新
}

// 更新指定知识点的缓存数据
export const updatePointCache = async (id: number, pointName: string, kv: object) => {
    console.log('updatePointCache', id, pointName, kv);
    const cache = await readCache(id);
    let point = cache?.points?.find(p => p.name === pointName);
    const pointIndex = cache?.points?.findIndex(p => p.name === pointName);
    if (!point || pointIndex === -1) {
        throw new Error('Point not found');
    }
    point = {...point, ...kv};
    cache.points!![pointIndex] = point;
    await updateCache(id, {points: cache.points});
}

// 添加新的缓存数据
export const addCache = async (cache: Cache) => {
    const allCache = await readAllCache();
    if (allCache.some(c => c.id === cache.id)) {
        throw new Error('Cache with the same id already exists');
    }
    allCache.push(cache);
    await store.set('cache', allCache);
}

// 删除指定ID的缓存数据
export const deleteCache = async (id: number) => {
    const cache = await readAllCache();
    const index = cache.findIndex(c => c.id === id);
    if (index === -1) {
        throw new Error('Cache not found');
    }
    cache.splice(index, 1);
    await store.set('cache', cache);
}

// 清空所有缓存数据
export const clearCache = async () => {
    await store.set('cache', []);
    await store.set('chart', null);
    await store.set('shouldUpdateChart', true);
    await store.set('userLink', []);
}

// 获取图表是否需要更新的状态
export const getShouldUpdateChart = async () => {
    return await store.get<boolean>('shouldUpdateChart') ?? true;
}

// 设置图表更新状态
export const setShouldUpdateChart = async (shouldUpdate: boolean = true) => {
    await store.set('shouldUpdateChart', shouldUpdate);
}

// 加载图表缓存数据
export const loadChartCache = async () => {
    const cache = await store.get<EChartsOption>('chart');
    if (!cache) {
        return null;
    }
    return cache;
}

// 更新图表缓存数据
export const updateChartCache = async (cache: EChartsOption) => {
    await store.set('chart', cache);
}

// 获取用户自定义链接缓存
export const getUserLinkCache = async () => {
    const cache = await store.get<NodeLink[]>('userLink');
    if (!cache) {
        return [];
    }
    return cache;
}

// 更新用户自定义链接缓存
export const updateUserLinkCache = async (links: NodeLink[]) => {
    await store.set('userLink', links);
}

// 获取是否使用模拟服务的状态
export const getFakeService = async () => {
    return await store.get<boolean>('fakeService') ?? false;
}

// 设置是否使用模拟服务
export const setFakeService = async (fake: boolean) => {
    await store.set('fakeService', fake);
}

// 获取语言设置（是否为英文）
export const getIsEnglish = async () => {
    return await store.get<boolean>('isEnglish') ?? true;
}

// 设置语言（英文/非英文）
export const setIsEnglish = async (isEnglish: boolean) => {
    await store.set('isEnglish', isEnglish);
}

// 获取是否为Beta版本的状态
export const getIsBeta = async () => {
    return await store.get<boolean>('isBeta') ?? false;
}

// 设置Beta版本状态
export const setIsBeta = async (isBeta: boolean) => {
    await store.set('isBeta', isBeta);
}