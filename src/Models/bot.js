const mongoose = require('mongoose');

const botSchema = mongoose.Schema({
    id: { type: String, unique: true, index: true, required: true },
    last_refresh: { type: String, default: Date.now() }
});

module.exports = mongoose.model('Bot', botSchema);