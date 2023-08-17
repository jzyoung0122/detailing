const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    title:String,
    description:[]
    
});

// 实例化模型
const Description = mongoose.model('Description', schema);

// 导出模型
module.exports = Description;