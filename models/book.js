const mongoose = require('mongoose');
const Schema = mongoose.Schema

const borrowers = new Schema({
    name: String,
    identifier: String,
    date: {
        type: Date,
        default: Date.now()
    }
},{ _id: false, autoIndex: false })

const BookSchema = new Schema({
    isbn: {
        type: String,
        require: true,
        unique: true
    },
    title: String,
    author: String,
    identifierList: [String],
    doubanID: String,
    image: String,
    summary: String,
    tag_1st: String,
    tag_2nd: String,
    borrowers: [borrowers],
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

BookSchema.pre('save', function(next){
    if(this.isNew){
        this.meta.createAt = this.meta.updateAt = Date.now()
    }else{
        this.meta.updateAt = Date.now()
    }
    next()
})

BookSchema.statics = {
    fetch: function(cb){
        return this
        .find({})
        .sort('meta.updateAt')
        .exec(cb)
    }
}

module.exports = mongoose.model('Book',BookSchema)