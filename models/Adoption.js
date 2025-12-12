const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema({
    child_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
    adopter_name: { type: String, required: true },
    adopter_contact: { type: String, required: true },
    adopter_nid: { type: String, required: true },
    adoption_date: { type: Date, required: true }
});

module.exports = mongoose.model('Adoption', adoptionSchema);