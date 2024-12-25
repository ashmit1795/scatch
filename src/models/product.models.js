import mongoose, { Schema } from "mongoose";

// Product schema
const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    categories: [
        {
            type: String,
            required: true
        }
    ],
    image: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    bgColor: {
        type: String,
        default: "#ffffff"
    },
    rating: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    }
}, {timestamps: true});

// Product model
const Product = mongoose.model("Product", productSchema);
export default Product;
