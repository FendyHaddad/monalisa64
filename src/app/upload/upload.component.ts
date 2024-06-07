import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import imageCompression from 'browser-image-compression';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFiles: File[] = [];
  fileInfos: { fileName: string, fileUrl: string, originalFileSize: number, estimatedFileSize: number, compressedFileSize: number }[] = [];

  constructor(private http: HttpClient) {}

  async onFileSelected(event: any): Promise<void> {
    this.selectedFiles = Array.from(event.target.files);
    this.fileInfos = await Promise.all(this.selectedFiles.map(async file => {
      const compressedFile = await this.estimateCompressedSize(file);
      return {
        fileName: file.name,
        fileUrl: '',
        originalFileSize: file.size,
        estimatedFileSize: compressedFile.size,
        compressedFileSize: 0  // Initially set to 0
      };
    }));
  }

  async estimateCompressedSize(file: File): Promise<File> {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
      initialQuality: 0.6
    };
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  }

  onUpload(): void {
    if (this.selectedFiles.length > 0) {
      const formData = new FormData();
      this.selectedFiles.forEach(file => formData.append('images', file, file.name));

      this.http.post<{ fileUrl: string, compressedSize: number }[]>('http://localhost:3000/api/upload', formData)
        .subscribe({
          next: responses => {
            responses.forEach((response, index) => {
              this.fileInfos[index].fileUrl = response.fileUrl;
              this.fileInfos[index].compressedFileSize = response.compressedSize;  // Update the actual compressed size
            });
          },
          error: err => {
            console.error(err);
            alert('Error uploading files. Please try again.');
          }
        });
    } else {
      console.error('No files selected');
      alert('Please select files to upload.');
    }
  }

  onDownload(fileUrl: string): void {
    if (fileUrl) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileUrl.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  onDownloadAll(): void {
    this.fileInfos.forEach(fileInfo => {
      if (fileInfo.fileUrl) {
        this.onDownload(fileInfo.fileUrl);
      }
    });
  }

  onCancel(): void {
    this.selectedFiles = [];
    this.fileInfos = [];
  }
}
