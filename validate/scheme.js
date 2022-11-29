const validator = require('validator');

module.exports = {
    "POST /api/user/register": {
        "request": {
            "body": {
                "name": validator.isEmail,
                "pin": checkPin,
                "password": /^[a-zA-Z0-9]{6,12}$/
            }
        }
    },
    "POST /api/user/getPin": {
        "request": {
            "body": {
                "name": validator.isEmail,
                // validator的入参现在必须是string，等待koa-scheme解决
                // "checkUser": validator.isBoolean
            }
        }
    }
}

function checkPin(pin) {
    if(!this.session.pin) return this.body = {code:205,msg:'未验证或验证码已过期!'};

    const reg = /^[a-z0-9]{5}$/i;
    if(!reg.test(pin)) return this.body = {code:206,msg:'验证码格式不正确!'};
    if(pin.toUpperCase() !== this.session.pin.code) return this.body = {code:207,msg:'验证码错误!'};
    if(this.request.body.name !== this.session.pin.email) return this.body = {code:208,msg:'验证邮箱错误!'};
    return true;
}
