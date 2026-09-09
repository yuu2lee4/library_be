import Router from "@koa/router";
import config from "config";

// https://github.com/Tencent/WeChatReading/blob/main/skills/SKILL.md

const router = new Router({ prefix: '/weread' });

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