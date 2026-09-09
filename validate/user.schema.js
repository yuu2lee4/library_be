import { z } from 'zod';

const email = z.string().email('邮箱格式不正确');
const password = z.string()
    .regex(/^[a-zA-Z0-9]{6,12}$/, '密码必须是 6 到 12 位字母或数字');
const pin = z.string()
    .regex(/^[a-z0-9]{5}$/i, '验证码格式不正确');
const userCredentials = z.object({
    name: email,
    password
});

export const registerSchema = z.object({
    name: email,
    pin,
    password,
    repassword: z.string()
}).refine(data => data.password === data.repassword, {
    path: ['repassword'],
    message: '两次密码不一致'
});

export const resetPasswordSchema = registerSchema;
export const loginSchema = userCredentials;
export const ldapLoginSchema = userCredentials;
export const getPinSchema = z.object({
    name: email,
    checkUser: z.boolean()
});
export const borrowSchema = z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, '书籍 ID 格式不正确')
});
export const returnSchema = borrowSchema;