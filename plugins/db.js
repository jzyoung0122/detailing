module.exports = (app) => {
    const mongoose = require('mongoose');
    require('dotenv').config()
    process.env.authURI
    mongoose.connect(process.env.authURI, {
    //   useNewUrlParser: true,
    //   useFindAndModify: false,
      useUnifiedTopology: true,
    //   useCreateIndex: true,
    })
    .then(console.log("Connected to MongoDB!"))
    .catch((err)=>console.log(err))
  };
