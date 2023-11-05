const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const { pbkdf2 } = require('node:crypto');
const CRYPTO_SALT = 'library';
const util = require('util');

const borrowedBooksSchema = new Schema({
    id: ObjectId,
    identifier: String,
    date: {
        type: Date,
        default: Date.now()
    }
},{ _id: false, autoIndex: false })

const UserSchema = new Schema({
    name: {
        unique: true,
        type: String
    },
    password: String,
    // 0: normal user
    // 1: verified user
    // 2: peofessional user

    // >10: admin
    // >50: super admin
    role: {
        type: Number,
        default: 0
    },
    borrowedBooks: [borrowedBooksSchema],
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
         updateAt: {
            type: Date,
            default: Date.now()
        }
    }
})

UserSchema.pre('save', function(next){
    if(this.isNew){
        this.meta.createAt = this.meta.updateAt = Date.now()
    }else{
        this.meta.updateAt = Date.now()
    }

    if(this.notHashPassword){
        delete this.notHashPassword
        next()
    }else{
        pbkdf2(this.password, CRYPTO_SALT, 5000, 64, 'sha512', (err, derivedKey) => {
            if(err) return next(err);
            this.password = derivedKey.toString('hex');
            next();
        });
    }
})

UserSchema.methods = {
    async comparePassword(_password) {
        const derivedKey = await util.promisify(pbkdf2)(_password, CRYPTO_SALT, 5000, 64, 'sha512');
        return derivedKey.toString('hex') === this.password;
    }
}

UserSchema.statics = {
    fetch: function(cb){
        return this
        .find({})
        .sort('meta.updateAt')
        .exec(cb)
    }
}

module.exports = mongoose.model('User',UserSchema)