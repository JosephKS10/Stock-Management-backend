const s3 = require('../config/awsConfig');
const { v4: uuidv4 } = require('uuid');
const stream = require('stream');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {  // Changed from req.files.image to req.file
      console.error("No file found in request");
      return res.status(400).json({ message: "Image file is required" });
    }

    const image = req.file;  // Multer puts single file in req.file
    const folder = req.body.folder;

    // Validate folder
    if (!folder || !['room-photos', 'product-photos'].includes(folder)) {
      return res.status(400).json({ message: "Invalid folder specified" });
    }

    // Get file extension from originalname
    const ext = image.originalname.split('.').pop().toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    
    if (!validExtensions.includes(ext)) {
      return res.status(400).json({ message: "Invalid image format" });
    }

    // Create upload stream
    const pass = new stream.PassThrough();
    pass.end(image.buffer);  // Use buffer from multer

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${folder}/${uuidv4()}.${ext}`,
      Body: pass,
      ContentType: image.mimetype,
    };

    const uploadResult = await s3.upload(params).promise();
    
    res.status(200).json({ imageUrl: uploadResult.Location });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Failed to upload image" });
  }
};