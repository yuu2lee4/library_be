const mongoose = require('mongoose');
const Schema = mongoose.Schema

const TagSchema = new Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    tags_2nd: Array,
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

TagSchema.pre('save', function(next){
    if(this.isNew){
        this.meta.createAt = this.meta.updateAt = Date.now()
    }else{
        this.meta.updateAt = Date.now()
    }
    next()
})

TagSchema.statics = {
    fetch: function(cb){
        return this
        .find({})
        .sort('meta.updateAt')
        .exec(cb)
    }
}

module.exports = mongoose.model('Tag',TagSchema)