import debug from "debug";
import { asyncHandler } from "../utils/AsyncHandler.js";
import Message from "../models/message.models.js";

const messageDebug = debug("app:controller:message");

const sendMessage = asyncHandler(async (req, res, next) => {
    const { managerId, productId, message } = req.body;
    
    messageDebug('Validating message data');
    if(!managerId || !message) {
       req.flash('error_msg', 'Please provide a recipient and message');
       return res.redirect('/app/admin/all-managers');
    }

    // If productId is null or undefined, set it to undefined
    let validProductId = productId;
    if (productId === undefined || productId === 'undefined' || productId === null || productId === 'null') {
        validProductId = undefined; // Mongoose will treat undefined as "no value"
    }

    const newMessage = await Message.create({
        sender: req.user._id,
        recipient: managerId,
        productId: validProductId,
        message,
    });
    if(!newMessage) {
        req.flash('error_msg', 'Failed to send message');
        return res.redirect('/app/admin/all-managers');
    }

    req.flash('success_msg', 'Message sent successfully');
    return res.redirect('/app/admin/all-managers');
});

export { sendMessage };