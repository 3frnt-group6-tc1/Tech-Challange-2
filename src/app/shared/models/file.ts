export interface S3SignedUrlResponse {
  signedUrl: string;
  key: string;
  bucket: string;
}

export interface S3UploadResult {
  success: boolean;
  key: string;
  url: string;
  error?: string;
}

export interface FileUploadRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
}
