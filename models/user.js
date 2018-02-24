const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const bcrypt =  require('bcryptjs');
const SALT_WORK_FACTOR = 10;
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
        bcrypt.genSalt(SALT_WORK_FACTOR,(err, salt)=> {
            if(err) return next(err)

            bcrypt.hash(this.password, salt,(err, hash)=> {
                if(err) return next(err)
                this.password = hash
                next()
            })
        })
    }
})

UserSchema.methods = {
    comparePassword(_password){
        return util.promisify(bcrypt.compare)(_password, this.password);
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