import config from 'config';

export const createWebSearchTool = () => ({
    name: 'web_search',
    description: '搜索网络上的公开书籍资料，并返回结果标题、摘要和链接。',
    input: {
        type: 'object',
        properties: {
            query: { type: 'string', minLength: 1, maxLength: 300 }
        },
        required: ['query'],
        additionalProperties: false
    },
    async execute({ query }) {
        const searchConfig = config.get('ai.webSearch');
        const apiKey = process.env.BOCHA_API_KEY || searchConfig.apiKey;
        if (!searchConfig.enabled || !apiKey) {
            throw new Error('Web Search 尚未配置');
        }

        const controller = new globalThis.AbortController();
        const timeout = globalThis.setTimeout(() => controller.abort(), searchConfig.timeoutMs || 8000);
        const response = await fetch(searchConfig.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                query,
                freshness: searchConfig.freshness,
                summary: searchConfig.summary,
                count: searchConfig.maxResults
            }),
            signal: controller.signal
        }).finally(() => globalThis.clearTimeout(timeout));
        if (!response.ok) throw new Error(`Web Search HTTP ${response.status}`);
        const data = await response.json();
        const results = data?.data?.webPages?.value || data?.webPages?.value || [];
        return results.slice(0, searchConfig.maxResults || 5).map(item => ({
            title: item.title,
            url: item.url,
            snippet: item.summary || item.snippet
        }));
    }
});