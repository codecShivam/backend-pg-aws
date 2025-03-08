const multer = require('multer');
const path = require('path');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const multerS3 = require('multer-s3');

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = process.env.S3_BUCKET_NAME || 'email-otp-auth-profiles';

// Configure multer for S3 storage
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: bucketName,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const email = req.session.user.email;
      const fileExtension = path.extname(file.originalname);
      const fileName = `profile-images/${email}/${uuidv4()}${fileExtension}`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Get the URL for an S3 object
const getPublicUrl = async (filename, email) => {
  const key = `profile-images/${email}/${filename}`;
  
  // For public objects, you can use a direct URL
  // return `https://${bucketName}.s3.amazonaws.com/${key}`;
  
  // For private objects, generate a signed URL
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  });
  
  try {
    // URL will be valid for 1 hour (3600 seconds)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
};

module.exports = {
  upload,
  getPublicUrl,
  s3Client,
  bucketName
}; 