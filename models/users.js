const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    password: String,
    balanceAmount: Number,
    transactions: [{ type: Schema.Types.ObjectId, ref: 'transaction' }],
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    },

});

const User = mongoose.model("User", userSchema);

module.exports = User;