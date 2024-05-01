const mongoose = require('mongoose');

const wlSchema = mongoose.Schema({
    id: { type: String, unique: true, index: true, required: true },
});

module.exports = mongoose.model('WL', wlSchema);