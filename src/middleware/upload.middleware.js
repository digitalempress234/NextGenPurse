import multer from "multer";

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
    if (
        file.mimetype &&
        (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf")
    ) {
        return cb(null, true);
    }
    const err = new Error("Only image or PDF files are allowed");
    err.statusCode = 400;
    return cb(err);
};

export const uploadVendorAvatar = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFileFilter
}).single("avatar");

export const uploadVendorDocuments = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: imageFileFilter
}).array("documents", 10);
