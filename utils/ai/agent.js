import { ToolRegistry } from './toolRegistry.js';

const SYSTEM_PROMPT = `你是图书管理系统的 AI 助手，只能回答书籍、作者、ISBN、馆藏、借阅和图书公开资料相关问题。
非书籍问题必须拒绝回答。
涉及当前馆藏或当前用户借阅信息时必须调用对应工具，不能猜测。
需要实时公开资料时调用 web_search。
不得请求、展示或推测密码、session、其他用户信息。
每次只能选择一个动作。`;

const toToolSchema = tool => ({
    type: 'function',
    function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.input || { type: 'object', properties: {} }
    }
});

export class Agent {
    constructor({ llm, tools = [], maxSteps = 6, onEvent = () => {}, signal } = {}) {
        this.llm = llm;
        this.maxSteps = maxSteps;
        this.onEvent = onEvent;
        this.signal = signal;
        this.registry = new ToolRegistry();
        tools.forEach(tool => this.registry.register(tool));
    }

    async run(message, history = []) {
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history.map(item => ({
                role: item.role,
                content: item.content
            })),
            { role: 'user', content: message }
        ];
        const tools = this.registry.describe().map(toToolSchema);

        for (let step = 0; step < this.maxSteps; step += 1) {
            this.onEvent('thinking', { step: step + 1 });
            const response = await this.llm.chat({
                messages,
                tools,
                signal: this.signal,
                onToken: token => this.onEvent('answer_delta', { content: token }),
                onReasoning: content => this.onEvent('thinking_delta', { content })
            });
            messages.push(response);

            const toolCall = response.tool_calls?.[0];
            if (!toolCall) {
                const answer = response.content || '暂时无法生成回答。';
                this.onEvent('answer', { content: answer });
                return answer;
            }

            const toolName = toolCall.function?.name;
            const tool = this.registry.get(toolName);
            if (!tool) {
                throw new Error(`不允许调用工具: ${toolName}`);
            }

            let args = {};
            try {
                args = JSON.parse(toolCall.function.arguments || '{}');
            }
            catch {
                throw new Error(`工具参数不是有效 JSON: ${toolName}`);
            }

            this.onEvent('tool_call', { tool: toolName, args });
            const result = await tool.execute(args);
            this.onEvent('tool_result', { tool: toolName, result });
            messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify(result)
            });
        }

        throw new Error(`Agent 超过最大执行步数 ${this.maxSteps}`);
    }
}