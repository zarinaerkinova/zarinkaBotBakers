const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    role: { type: String, enum: ["admin", "baker"], required: true },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String, required: true, unique: true },
}, { autoIndex: true });

module.exports = mongoose.model("User", userSchema);
