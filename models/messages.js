const mongoose = require("mongoose");

const whatsappSchema = new mongoose.Schema({
  messages: String,
  image: String,
  imageName: String,
});
const Event = mongoose.model("message", whatsappSchema);
module.exports = Event;
