import cloudinary from "cloudinary";

const ensureCloudinaryConfig = () => {
    if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
    ) {
        const err = new Error("Cloudinary config missing");
        err.statusCode = 500;
        throw err;
    }
};

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export const uploadImageBuffer = (fileBuffer, folder) => {
    ensureCloudinaryConfig();

    return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
            {
                folder,
                resource_type: "image"
            },
            (error, result) => {
                if (error) return reject(error);
                return resolve(result);
            }
        );

        stream.end(fileBuffer);
    });
};
