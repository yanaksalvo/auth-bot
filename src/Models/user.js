const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    id: { type: String, unique: true, index: true, required: true },
    access_token: { type: String, required: true },
    refresh_token: { type: String, required: true },
    date: { type: String, required: false },
    lang: { type: String, required: false },
    flags: { type: String, required: false }
});

module.exports = mongoose.model('User', userSchema);