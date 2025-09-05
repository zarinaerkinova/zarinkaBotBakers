const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    role: { type: String, enum: ["admin", "baker"], required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
