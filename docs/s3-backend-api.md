# S3 Backend API Specification

This document describes the backend API endpoints required to support the S3 Upload Service.

## Prerequisites

- AWS SDK for your backend language (Node.js, Python, Java, etc.)
- AWS credentials configured
- S3 bucket `3frnt-group6-bytebank` created with appropriate permissions
- JWT authentication middleware to validate tokens

## Authentication

All API endpoints require JWT authentication. Requests should include the Authorization header:

```
Authorization: Bearer <jwt-token>
```

Your backend should validate the JWT token before processing any S3 operations.

## Required Endpoints

### 1. Generate Signed URL

**Endpoint:** `POST /api/s3/signed-url`

**Description:** Generates a pre-signed URL for S3 operations (upload or download)

**Request Body:**

```json
{
  "bucket": "3frnt-group6-bytebank",
  "key": "uploads/1642678800000_abc123_document.pdf",
  "contentType": "application/pdf",
  "operation": "putObject"
}
```

**Response:**

```json
{
  "signedUrl": "https://3frnt-group6-bytebank.s3.amazonaws.com/uploads/1642678800000_abc123_document.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
  "key": "uploads/1642678800000_abc123_document.pdf",
  "bucket": "3frnt-group6-bytebank"
}
```

### 2. Delete File

**Endpoint:** `DELETE /api/s3/file`

**Description:** Deletes a file from S3

**Request Body:**

```json
{
  "bucket": "3frnt-group6-bytebank",
  "key": "uploads/1642678800000_abc123_document.pdf"
}
```

**Response:**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## Sample Implementation (Node.js/Express)

```javascript
const express = require("express");
const AWS = require("aws-sdk");
const router = express.Router();

// Configure AWS
const s3 = new AWS.S3({
  region: "us-east-1", // Your AWS region
  signatureVersion: "v4",
});

// Middleware to check JWT
const checkAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  // Verify the token (implementation depends on your auth setup)
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Generate signed URL
router.post("/s3/signed-url", checkAuth, async (req, res) => {
  try {
    const { bucket, key, contentType, operation } = req.body;

    const params = {
      Bucket: bucket,
      Key: key,
      Expires: 3600, // URL expires in 1 hour
    };

    if (operation === "putObject") {
      params.ContentType = contentType;
      params.ACL = "private"; // or 'public-read' if needed
    }

    const signedUrl = await s3.getSignedUrlPromise(operation, params);

    res.json({
      signedUrl,
      key,
      bucket,
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
});

// Delete file
router.delete("/s3/file", checkAuth, async (req, res) => {
  try {
    const { bucket, key } = req.body;

    const params = {
      Bucket: bucket,
      Key: key,
    };

    await s3.deleteObject(params).promise();

    res.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

module.exports = router;
```

## Sample Implementation (Python/FastAPI)

```python
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError
import logging
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()

# Configure AWS S3 client
s3_client = boto3.client(
    's3',
    region_name='us-east-1'  # Your AWS region
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class SignedUrlRequest(BaseModel):
    bucket: str
    key: str
    contentType: str = None
    operation: str

class DeleteFileRequest(BaseModel):
    bucket: str
    key: str

# Dependency to verify JWT token
async def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/s3/signed-url")
async def generate_signed_url(request: SignedUrlRequest, token: str = Depends(oauth2_scheme)):
    try:
        params = {
            'Bucket': request.bucket,
            'Key': request.key
        }

        if request.operation == 'put_object':
            params['ContentType'] = request.contentType

        signed_url = s3_client.generate_presigned_url(
            request.operation,
            Params=params,
            ExpiresIn=3600  # URL expires in 1 hour
        )

        return {
            "signedUrl": signed_url,
            "key": request.key,
            "bucket": request.bucket
        }
    except ClientError as e:
        logging.error(f"Error generating signed URL: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate signed URL")

@router.delete("/s3/file")
async def delete_file(request: DeleteFileRequest, token: str = Depends(oauth2_scheme)):
    try:
        s3_client.delete_object(
            Bucket=request.bucket,
            Key=request.key
        )

        return {
            "success": True,
            "message": "File deleted successfully"
        }
    except ClientError as e:
        logging.error(f"Error deleting file: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete file")
```

## S3 Bucket Configuration

### CORS Configuration

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:4200", "https://your-frontend-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Bucket Policy (Example)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowDirectUploads",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/YOUR-IAM-USER"
      },
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::3frnt-group6-bytebank/*"
    }
  ]
}
```

## Environment Variables

Set these environment variables in your backend:

```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=3frnt-group6-bytebank
```

## Security Best Practices

1. **Use IAM roles with minimal permissions**
2. **Set appropriate CORS policies**
3. **Use signed URLs with short expiration times**
4. **Validate file types and sizes on the backend**
5. **Implement rate limiting**
6. **Log all S3 operations for auditing**

## Testing

You can test the endpoints using curl:

```bash
# Generate signed URL for upload
curl -X POST http://localhost:3000/api/s3/signed-url \
  -H "Content-Type: application/json" \
  -d '{
    "bucket": "3frnt-group6-bytebank",
    "key": "uploads/test.jpg",
    "contentType": "image/jpeg",
    "operation": "putObject"
  }'

# Delete file
curl -X DELETE http://localhost:3000/api/s3/file \
  -H "Content-Type: application/json" \
  -d '{
    "bucket": "3frnt-group6-bytebank",
    "key": "uploads/test.jpg"
  }'
```
