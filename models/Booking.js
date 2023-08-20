const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    date:Date,
    time:Number,
    sedanServices:[],
    suvServices:[],
    vanServices:[],
    firstName:String,
    lastName:String,
    phoneNumber:String,
    email:String,
    address:{
        address1:String,
        address2:String,
        suburb:String,
        postCode:String
    },
    delete:Boolean,
    totalTime:Number

});

// 实例化模型
const Booking = mongoose.model('Booking', schema);

// 导出模型
module.exports = Booking;