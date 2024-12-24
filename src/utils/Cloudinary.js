import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import debug from "debug";

// Namespace for debugging
const cloudinaryDebug = debug("app:utils:cloudinary");

cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
});

// Function to upload a file to Cloudinary
export const uploadToCloudinary = async (localFilePath) => {
    try {
        // Check if the file exists
        if (!localFilePath) return;
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // File uploaded successfully
        // Delete the file from the local storage
        fs.unlinkSync(localFilePath || '');
        // Return the url of the uploaded file
        return response;
    } catch (error) {
        // An error occurred while uploading the file to Cloudinary
        fs.unlinkSync(localFilePath || '');
        cloudinaryDebug('Error uploading file to Cloudinary:', error);
    }
};

// Function to delete a file from Cloudinary
export const deleteFileFromCloudinary = async (url) => {
    try {
        const publicId = getPublicIdFromUrl(url);
        // Delete the file from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);
        cloudinaryDebug('Deleted file from Cloudinary:', result);
    } catch (error) {
        cloudinaryDebug('Error deleting file from Cloudinary:', error);
    }
};

// Function to get the public id of a file from its cloudinary url
function getPublicIdFromUrl(url) {
    if (typeof url !== 'string') {
        url = String(url); // Convert the url to a string
    }
    const parts = url.split('/'); // Split the url by '/'
    const publicIdWithExtension = parts.slice(-1)[0]; // Get the last part of the url
    const publicId = publicIdWithExtension.split('.')[0]; // Remove the file extension
    return publicId;
}

  
  