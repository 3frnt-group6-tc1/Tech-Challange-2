import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { apiConfig } from '../../../app.config';
import { AuthService } from '../Auth/auth.service';
import {
  FileUploadRequest,
  S3SignedUrlResponse,
  S3UploadResult,
} from '../../models/file';

@Injectable({
  providedIn: 'root',
})
export class S3UploadService {
  private readonly bucketName = 'fiap-3frnt-group6-bytebank';
  private readonly apiUrl = apiConfig.baseUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Get a signed URL for uploading a file to S3
   */
  getSignedUrlForUpload(
    fileRequest: FileUploadRequest
  ): Observable<S3SignedUrlResponse> {
    const payload = {
      bucket: this.bucketName,
      key: this.generateFileKey(fileRequest.fileName),
      contentType: fileRequest.fileType,
      operation: 'putObject',
    };

    return this.http.post<S3SignedUrlResponse>(
      `${this.apiUrl}/s3/signed-url`,
      payload
    );
  }

  /**
   * Get a signed URL for downloading/viewing a file from S3
   */
  getSignedUrlForDownload(key: string): Observable<S3SignedUrlResponse> {
    const payload = {
      bucket: this.bucketName,
      key: key,
      operation: 'getObject',
    };

    return this.http.post<S3SignedUrlResponse>(
      `${this.apiUrl}/s3/signed-url`,
      payload
    );
  }

  /**
   * Upload a file to S3 using signed URL
   */
  uploadFile(file: File): Observable<S3UploadResult> {
    const fileRequest: FileUploadRequest = {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    };

    return this.getSignedUrlForUpload(fileRequest).pipe(
      switchMap((response) => {
        return this.uploadFileToS3(file, response.signedUrl, response.key);
      }),
      catchError((error) => {
        console.error('File upload error:', error);
        return of({
          success: false,
          key: '',
          url: '',
          error: error.message || 'Failed to get signed URL',
        });
      })
    );
  }

  /**
   * Upload multiple files to S3
   */
  uploadMultipleFiles(files: File[]): Observable<S3UploadResult[]> {
    const uploadObservables = files.map((file) => this.uploadFile(file));
    return forkJoin(uploadObservables);
  }

  /**
   * Delete a file from S3
   */
  deleteFile(key: string): Observable<any> {
    const payload = {
      bucket: this.bucketName,
      key: key,
    };

    return this.http.delete(`${this.apiUrl}/s3/file`, {
      body: payload,
    });
  }

  /**
   * Upload file directly to S3 using signed URL
   */
  private uploadFileToS3(
    file: File,
    signedUrl: string,
    key: string
  ): Observable<S3UploadResult> {
    // Don't set custom headers as they may conflict with the signed URL
    // The signed URL already includes the necessary parameters
    // Add Skip-Auth header to prevent auth interceptor from adding Authorization header
    return this.http
      .put(signedUrl, file, {
        observe: 'response',
        headers: {
          'Skip-Auth': 'true',
        },
      })
      .pipe(
        map((response) => {
          if (response.status === 200 || response.status === 204) {
            return {
              success: true,
              key: key,
              url: this.getPublicUrl(key),
            };
          } else {
            return {
              success: false,
              key: key,
              url: '',
              error: `Upload failed with status: ${response.status}`,
            };
          }
        }),
        catchError((error) => {
          console.error('S3 Upload Error:', error);
          return of({
            success: false,
            key: key,
            url: '',
            error: error.message || 'Upload failed',
          });
        })
      );
  }

  /**
   * Generate a unique file key for S3
   */
  private generateFileKey(fileName: string): string {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split('.').pop();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');

    return `uploads/${timestamp}_${randomString}_${cleanFileName}`;
  }

  /**
   * Get public URL for a file (if bucket is public)
   */
  private getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }

  /**
   * Convert file to base64 for preview or storage
   */
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  }

  /**
   * Validate file before upload
   */
  validateFile(
    file: File,
    maxSizeInMB: number = 10,
    allowedTypes: string[] = []
  ): { valid: boolean; error?: string } {
    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeInMB}MB limit`,
      };
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    return { valid: true };
  }
}
