module.exports = (app) => {
    const mongoose = require('mongoose');
    mongoose.connect('mongodb://127.0.0.1:27017/dbecommerce', {
    //   useNewUrlParser: true,
    //   useFindAndModify: false,
      useUnifiedTopology: true,
    //   useCreateIndex: true,
    })
    .then(console.log("Connected to MongoDB!"))
    .catch((err)=>console.log(err))
  };