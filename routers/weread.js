import Router from "@koa/router";
import config from "config";

// https://github.com/Tencent/WeChatReading/blob/main/skills/SKILL.md

const router = new Router({ prefix: '/weread' });

/**
 * @openapi
 * /weread/gateway:
 *   post:
 *     summary: 转发微信读书 Agent Gateway 请求
 *     tags: [微信读书模块]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200: { description: 微信读书网关响应 }
 */
router.post('/gateway', async (ctx) => {
	const wereadConfig = config.get('weread');
	const response = await fetch(wereadConfig.gateway, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${wereadConfig.apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			...ctx.request.body,
			skill_version: wereadConfig.skillVersion
		})
	});

	const responseText = await response.text();
	let responseBody;
	try {
		responseBody = JSON.parse(responseText);
	} catch {
		responseBody = responseText;
	}

	ctx.status = response.status;
	ctx.body = responseBody;
});

export default router;