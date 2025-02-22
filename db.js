// getting-started.js
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
    console.log("connected successfully")
  await mongoose.connect('mongodb+srv://vinayakjaimini51:Vinayak%4012@cluster0.h6vsu.mongodb.net/Blog-Application?retryWrites=true&w=majority&appName=Cluster0');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
module.exports = main