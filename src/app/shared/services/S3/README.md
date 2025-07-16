# S3 Upload Service

This service provides functionality to upload files to Amazon S3 using signed URLs. It's designed to work with the bucket `3frnt-group6-bytebank`.

## Features

- Upload single or multiple files to S3
- Generate signed URLs for secure file access
- File validation (size, type)
- File management (delete files)
- Base64 conversion for previews
- TypeScript support with proper typing
- JWT token authentication for secure API access

## Authentication

The service includes JWT token authentication. A default token is set, but you can update it dynamically:

```typescript
// Set a new token
this.s3Service.setToken("your-new-jwt-token");

// Get the current token
const currentToken = this.s3Service.getToken();
```

All API requests to your backend will include the JWT token in the Authorization header:

```
Authorization: Bearer your-jwt-token
```

## Configuration

Update your `app.config.ts` to include the S3 API endpoint:

```typescript
export const apiConfig = {
  baseUrl: "http://localhost:8080",
  usersEndpoint: "/users",
  transactionsEndpoint: "/transactions",
  baseUrl: "https://your-api-endpoint.com/api", // Your S3 API endpoint
};
```

## Usage

### Basic File Upload

```typescript
import { S3UploadService } from './shared/services/S3/s3-upload.service';

constructor(private s3Service: S3UploadService) {}

async uploadFile(file: File) {
  try {
    const result = await this.s3Service.uploadFile(file).toPromise();
    if (result.success) {
      console.log('File uploaded:', result.url);
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

### Multiple Files Upload

```typescript
async uploadMultipleFiles(files: File[]) {
  try {
    const results = await this.s3Service.uploadMultipleFiles(files).toPromise();
    const successfulUploads = results.filter(r => r.success);
    console.log(`${successfulUploads.length} files uploaded successfully`);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

### File Validation

```typescript
validateFile(file: File) {
  const validation = this.s3Service.validateFile(
    file,
    10, // Max 10MB
    ['image/jpeg', 'image/png', 'application/pdf'] // Allowed types
  );

  if (!validation.valid) {
    console.error('Validation failed:', validation.error);
    return false;
  }
  return true;
}
```

### Get Signed URL for Download

```typescript
viewFile(fileKey: string) {
  this.s3Service.getSignedUrlForDownload(fileKey).subscribe({
    next: (response) => {
      window.open(response.signedUrl, '_blank');
    },
    error: (err) => console.error('Error:', err)
  });
}
```

### Delete File

```typescript
deleteFile(fileKey: string) {
  this.s3Service.deleteFile(fileKey).subscribe({
    next: () => console.log('File deleted successfully'),
    error: (err) => console.error('Delete failed:', err)
  });
}
```

## API Endpoints Required

Your backend API should provide these endpoints:

### POST /s3/signed-url

Generate signed URL for upload or download

**Request:**

```json
{
  "bucket": "3frnt-group6-bytebank",
  "key": "uploads/filename.jpg",
  "contentType": "image/jpeg",
  "operation": "putObject" // or "getObject"
}
```

**Response:**

```json
{
  "signedUrl": "https://s3.amazonaws.com/presigned-url",
  "key": "uploads/filename.jpg",
  "bucket": "3frnt-group6-bytebank"
}
```

### DELETE /s3/file

Delete a file from S3

**Request:**

```json
{
  "bucket": "3frnt-group6-bytebank",
  "key": "uploads/filename.jpg"
}
```

## File Structure

Files are uploaded with the following naming convention:

```
uploads/{timestamp}_{randomString}_{sanitizedFileName}
```

Example: `uploads/1642678800000_abc123_document.pdf`

## Security Considerations

- Files are validated on the client side (size, type)
- Signed URLs have expiration times (configured on backend)
- File names are sanitized to prevent path traversal
- Only specific file types are allowed (configurable)

## Error Handling

The service includes comprehensive error handling:

- Network errors
- S3 upload failures
- File validation errors
- Invalid file types/sizes

## Integration with New Transaction Component

The `new-transaction.component.ts` has been updated to use this S3 service:

```typescript
// Files are uploaded to S3 instead of converted to base64
const uploadResults = await this.s3UploadService.uploadMultipleFiles(this.selectedFiles).toPromise();

// Attachments now store S3 references instead of base64 data
attachments = uploadResults.map((result) => ({
  name: result.key.split("/").pop(),
  key: result.key,
  url: result.url,
  type: "s3",
}));
```

## Testing

Run the tests with:

```bash
ng test
```

The service includes comprehensive unit tests covering:

- File upload functionality
- Signed URL generation
- File validation
- Error handling
- Multiple file uploads
