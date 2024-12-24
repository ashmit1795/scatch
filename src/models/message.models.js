import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    status: {
        type: String,
        enum: ['unresolved', 'resolved'],
        default: 'unresolved',
    },
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;