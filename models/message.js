const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        senderId: {
            type: String,
        },
        recieverId: {
            type: String,
        },
        text: {
            message: {
                type: String,
            },
            image: {
                type: String,
            }
        },
    },
    {
        timestamps: true,
    }
);

const MessageModel = mongoose.model("Message", MessageSchema);
module.exports = MessageModel