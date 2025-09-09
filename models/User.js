const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    role: { type: String, enum: ["admin", "baker"], required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function (next) {
    if (this.phone) {
        // Normalize phone number
        let phone = this.phone.replace(/[^\d+]/g, '');

        if (phone.startsWith('998') && !phone.startsWith('+998')) {
            phone = '+' + phone;
        } else if (phone.startsWith('8') || phone.startsWith('9')) {
            phone = '+998' + phone.replace(/^8/, '').replace(/^9/, '');
        }

        this.phone = phone;
    }
    next();
});

module.exports = mongoose.model("User", userSchema);
