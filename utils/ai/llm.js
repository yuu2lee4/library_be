import OpenAI from 'openai';
import config from "config";

const trimText = value => typeof value === 'string' ? value.trim() : value;

export class LLM {
    constructor(options = {}) {
        const aiConfig = config.get('ai');
        this.apiKey = options.apiKey || process.env.AI_API_KEY || aiConfig.apiKey || '';
        this.model = options.model || aiConfig.model;
        this.temperature = options.temperature ?? aiConfig.temperature ?? 0;
        this.stream = options.stream ?? aiConfig.stream ?? true;
        this.client = new OpenAI({
            apiKey: this.apiKey,
            baseURL: options.baseURL || aiConfig.baseURL,
            timeout: aiConfig.timeoutMs || 30000,
            maxRetries: aiConfig.maxRetries ?? 2
        });
    }

    async chat({ messages, tools, signal, onToken, onReasoning }) {
        if (!this.apiKey) {
            throw new Error('未配置 AI_API_KEY');
        }

        const request = {
                model: this.model,
                temperature: this.temperature,
                messages,
                tools,
                stream: this.stream
        };

        if (!this.stream) {
            const completion = await this.client.chat.completions.create(request, { signal });
            const message = completion.choices?.[0]?.message;
            if (!message) {
                throw new Error('LLM 返回为空');
            }
            if (message.reasoning_content) {
                onReasoning?.(trimText(message.reasoning_content));
            }
            return {
                ...message,
                content: trimText(message.content),
                reasoning_content: trimText(message.reasoning_content)
            };
        }

        const completion = await this.client.chat.completions.create(request, { signal });
        let role = 'assistant';
        let content = '';
        const toolCalls = [];

        for await (const chunk of completion) {
            const delta = chunk.choices?.[0]?.delta;
            if (!delta) continue;
            if (delta.role) role = delta.role;
            if (delta.content) {
                content += delta.content;
                onToken?.(delta.content);
            }
            if (delta.reasoning_content) {
                onReasoning?.(delta.reasoning_content);
            }
            for (const toolCall of delta.tool_calls || []) {
                const current = toolCalls[toolCall.index] || {
                    id: '',
                    type: 'function',
                    function: { name: '', arguments: '' }
                };
                current.id += toolCall.id || '';
                current.type = toolCall.type || current.type;
                current.function.name += toolCall.function?.name || '';
                current.function.arguments += toolCall.function?.arguments || '';
                toolCalls[toolCall.index] = current;
            }
        }

        if (!content && toolCalls.length === 0) {
            throw new Error('LLM 返回为空');
        }
        return {
            role,
            content: trimText(content) || null,
            ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {})
        };
    }
}