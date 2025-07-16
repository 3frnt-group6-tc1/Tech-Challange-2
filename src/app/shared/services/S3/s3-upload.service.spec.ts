import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  S3UploadService,
  S3SignedUrlResponse,
  S3UploadResult,
} from './s3-upload.service';

describe('S3UploadService', () => {
  let service: S3UploadService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [S3UploadService],
    });
    service = TestBed.inject(S3UploadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get token', () => {
    const newToken = 'new-test-token';
    service.setToken(newToken);
    expect(service.getToken()).toBe(newToken);
  });

  it('should include authorization header in signed URL request', () => {
    const mockResponse: S3SignedUrlResponse = {
      signedUrl: 'https://test-signed-url.com',
      key: 'uploads/test-file.jpg',
      bucket: '3frnt-group6-bytebank',
    };

    const fileRequest = {
      fileName: 'test.jpg',
      fileType: 'image/jpeg',
      fileSize: 1024,
    };

    service.setToken('test-token');
    service.getSignedUrlForUpload(fileRequest).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/s3/signed-url`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.bucket).toBe('3frnt-group6-bytebank');
    expect(req.request.body.operation).toBe('putObject');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush(mockResponse);
  });

  it('should get signed URL for download', () => {
    const mockResponse: S3SignedUrlResponse = {
      signedUrl: 'https://test-signed-url.com',
      key: 'uploads/test-file.jpg',
      bucket: '3frnt-group6-bytebank',
    };

    const key = 'uploads/test-file.jpg';

    service.getSignedUrlForDownload(key).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/s3/signed-url`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.bucket).toBe('3frnt-group6-bytebank');
    expect(req.request.body.key).toBe(key);
    expect(req.request.body.operation).toBe('getObject');
    req.flush(mockResponse);
  });

  it('should validate file correctly', () => {
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const largeFile = new File(['test'.repeat(1000000)], 'large.jpg', {
      type: 'image/jpeg',
    });

    const validResult = service.validateFile(validFile, 10, ['image/jpeg']);
    expect(validResult.valid).toBe(true);

    const invalidSizeResult = service.validateFile(largeFile, 1);
    expect(invalidSizeResult.valid).toBe(false);
    expect(invalidSizeResult.error).toContain('File size exceeds');

    const invalidTypeResult = service.validateFile(validFile, 10, [
      'image/png',
    ]);
    expect(invalidTypeResult.valid).toBe(false);
    expect(invalidTypeResult.error).toContain('File type');
  });

  it('should delete file', () => {
    const key = 'uploads/test-file.jpg';

    service.deleteFile(key).subscribe();

    const req = httpMock.expectOne(`${service['apiUrl']}/s3/file`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body.bucket).toBe('3frnt-group6-bytebank');
    expect(req.request.body.key).toBe(key);
    expect(req.request.headers.get('Authorization')).toContain('Bearer');
    req.flush({});
  });

  it('should convert file to base64', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const base64 = await service.convertFileToBase64(file);

    expect(base64).toContain('data:text/plain;base64,');
  });
});
