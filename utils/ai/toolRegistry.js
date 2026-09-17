export class ToolRegistry {
    constructor() {
        this.tools = new Map();
    }

    register(tool) {
        if (!tool?.name || typeof tool.execute !== 'function') {
            throw new Error('AI 工具必须包含 name 和 execute');
        }
        this.tools.set(tool.name, tool);
    }

    has(name) {
        return this.tools.has(name);
    }

    get(name) {
        return this.tools.get(name);
    }

    describe() {
        return [...this.tools.values()].map(tool => ({
            name: tool.name,
            description: tool.description,
            input: tool.input || {}
        }));
    }
}