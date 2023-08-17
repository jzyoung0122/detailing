const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    date:Date,
    ifAvailable:{
        type:Boolean,
        default:true
    },
    period:[]
});

// 实例化模型
const ChosenDate = mongoose.model('Date', schema);

// 导出模型
module.exports = ChosenDate;