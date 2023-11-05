import mongoose from "mongoose";

const { Schema } = mongoose;

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
});
TagSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    }
    else {
        this.meta.updateAt = Date.now();
    }
    next();
});
TagSchema.statics = {
    fetch: function (cb) {
        return this
            .find({})
            .sort('meta.updateAt')
            .exec(cb);
    }
};
export default mongoose.model('Tag', TagSchema);
