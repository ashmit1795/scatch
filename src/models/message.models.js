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
        required: true,
        trim: true,
        maxlength: 500 // Limit message length to 500 characters
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        default: null
    },
    status: {
        type: String,
        enum: ['unresolved', 'resolved', 'rejected'],
        default: 'unresolved',
    },
}, { 
    timestamps: true 
});

// Add index for optimized querying based on recipient and status
messageSchema.index({ recipient: 1, status: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
