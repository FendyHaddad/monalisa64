import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],  // Import CommonModule for using Angular built-in pipes
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFiles: File[] = [];  // Store the selected files
  fileInfos: { fileUrl: string, originalFileSize: number, compressedFileSize: number }[] = [];  // Store info for each uploaded file

  constructor(private http: HttpClient) {}  // Inject HttpClient for making HTTP requests

  // Handle file selection event
  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);  // Get the selected files from the event
    this.fileInfos = this.selectedFiles.map(file => ({
      fileUrl: '',
      originalFileSize: file.size,
      compressedFileSize: 0
    }));  // Initialize fileInfos for each selected file
  }

  // Handle file upload event
  onUpload(): void {
    if (this.selectedFiles.length > 0) {
      const formData = new FormData();  // Create a new FormData object
      this.selectedFiles.forEach(file => formData.append('images', file, file.name));  // Append each selected file to the FormData object

      // Make a POST request to the backend to upload the files
      this.http.post<{ fileUrl: string, compressedSize: number }[]>('http://localhost:3000/api/upload', formData)
        .subscribe({
          next: responses => {
            responses.forEach((response, index) => {
              this.fileInfos[index].fileUrl = response.fileUrl;  // Store the URL of the uploaded file
              this.fileInfos[index].compressedFileSize = response.compressedSize;  // Store the compressed file size
            });
          },
          error: err => {
            console.error(err);  // Log errors to the console
            alert('Error uploading files. Please try again.');  // Show an alert message if an error occurs
          }
        });
    } else {
      console.error('No files selected');  // Log a message if no files are selected
      alert('Please select files to upload.');  // Show an alert message if no files are selected
    }
  }

  // Handle file download event
  onDownload(fileUrl: string): void {
    if (fileUrl) {
      const a = document.createElement('a');  // Create a new anchor element
      a.href = fileUrl;  // Set the href attribute to the file URL
      a.download = fileUrl.split('/').pop() || 'download';  // Set the download attribute to the file name
      document.body.appendChild(a);  // Append the anchor element to the document body
      a.click();  // Programmatically click the anchor element to trigger the download
      document.body.removeChild(a);  // Remove the anchor element from the document body
    }
  }

  // Handle cancel event
  onCancel(): void {
    this.selectedFiles = [];  // Reset the selected files
    this.fileInfos = [];  // Reset the file infos
  }
}
