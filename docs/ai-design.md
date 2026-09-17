# 图书管理 AI 聊天设计与落地说明

## 1. 范围

AI 聊天只允许登录用户使用，只处理书籍、作者、ISBN、馆藏、借阅和公开书籍资料问题。匿名用户不创建 AI 会话、不保存聊天历史，也不能调用任何 AI 工具。

## 2. 交互协议

采用 SSE。浏览器通过 `fetch` POST `/api/ai/chat`，服务端以 `text/event-stream` 返回 `conversation`、`thinking`、`tool_call`、`tool_result`、`answer_delta`、`answer`、`done` 或 `error` 事件。LLM 使用 `stream: true` 返回增量内容，Agent 聚合工具调用参数后再执行工具。

WebSocket 暂不采用。当前场景是单次提问和服务端流式回答，不需要持续双向通信。

## 3. 数据模型

- `AiConversation`：保存用户 ID、标题、状态和最近消息时间。
- `AiMessage`：保存用户消息、助手消息及工具调用结果。
- 认证状态继续使用现有 Koa session，不把聊天正文放入认证 session。

所有查询都使用 `userId` 做数据隔离。会话读取必须使用 `{ _id, userId }` 条件，不能只根据会话 ID 查询。

## 4. Agent 流程

1. `auth.isLogin` 拦截未登录请求。
2. 从当前会话读取最近 5 条消息，按时间正序组成短期记忆。
3. 保存本轮用户消息。
4. Agent 判断是否为书籍问题。
5. 可直接回答时返回答案。
6. 馆藏问题调用 `book_db_query`。
7. 当前用户借阅问题调用 `get_my_borrowed_books`。
8. 需要实时公开信息时调用 `web_search`。
9. 保存助手答案并发送 `done`。

Agent 的最大工具调用步数为 6。工具参数由模型输出后仍需经过工具 schema 和业务代码限制，不能执行任意 MongoDB 查询。

短期记忆只发送最近 5 条已持久化的用户或助手消息，避免上下文无限增长。完整历史仍保存在 `AiMessage` 中，可通过历史接口分页或展示；后续如需更长记忆，再增加摘要记忆，而不是简单扩大消息数量。

## 5. 用户私有数据

模型不能传入 `userId` 查询其他用户。`get_my_borrowed_books` 的用户 ID由服务端从 `ctx.session.user._id` 注入。工具只能返回当前登录用户的借阅信息。

## 6. Web Search 与 MCP

`webSearchTool` 当前接入 Bocha Web Search API，使用 `POST https://api.bochaai.com/v1/web-search`。API Key 通过 `BOCHA_API_KEY` 环境变量提供，搜索结果统一转换为标题、链接和摘要。后续可以把其内部实现替换为 MCP Client，连接固定配置的 Web Search MCP Server。

不允许模型动态连接任意 MCP Server。MCP 服务必须配置白名单、超时、结果数量限制和来源 URL。MongoDB 查询保持为本地工具，不通过 MCP 暴露。

## 7. 配置

使用环境变量 `AI_API_KEY` 提供模型密钥。模型地址、模型名和 Web Search 地址配置在 `config/default.json`，生产环境应通过环境覆盖配置，不要把真实密钥提交到仓库。

## 8. 后续工作

- 将 LLM 适配器替换为目标供应商的原生 tool calling 实现。
- 为 Agent、工具权限、会话归属和 SSE 事件增加测试。
- 为 `AiConversation` 增加归档和删除接口。
- 将书籍借阅数据统一为稳定的用户 ID 关联，避免使用借阅人名称或 identifier 混淆权限。