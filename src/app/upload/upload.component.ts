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
  selectedFile: File | null = null;  // Store the selected file
  fileUrl: string | null = null;  // Store the URL of the uploaded file
  originalFileSize: number | null = null;  // Store the original file size
  compressedFileSize: number | null = null;  // Store the compressed file size

  constructor(private http: HttpClient) {}  // Inject HttpClient for making HTTP requests

  // Handle file selection event
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];  // Get the selected file from the event
    if (this.selectedFile) {
      this.originalFileSize = this.selectedFile.size;  // Store the original file size
    }
  }

  // Handle file upload event
  onUpload(): void {
    if (this.selectedFile) {
      const formData = new FormData();  // Create a new FormData object
      formData.append('image', this.selectedFile, this.selectedFile.name);  // Append the selected file to the FormData object

      // Make a POST request to the backend to upload the file
      this.http.post<{ fileUrl: string, compressedSize: number }>('http://localhost:3000/api/upload', formData)
        .subscribe({
          next: response => {
            this.fileUrl = response.fileUrl;  // Store the URL of the uploaded file
            this.compressedFileSize = response.compressedSize;  // Store the compressed file size
          },
          error: err => {
            console.error(err);  // Log errors to the console
            alert('Error uploading file. Please try again.');  // Show an alert message if an error occurs
          }
        });
    } else {
      console.error('No file selected');  // Log a message if no file is selected
      alert('Please select a file to upload.');  // Show an alert message if no file is selected
    }
  }

  // Handle file download event
  onDownload(): void {
    if (this.fileUrl) {
      const a = document.createElement('a');  // Create a new anchor element
      a.href = this.fileUrl;  // Set the href attribute to the file URL
      a.download = this.fileUrl.split('/').pop() || 'download';  // Set the download attribute to the file name
      document.body.appendChild(a);  // Append the anchor element to the document body
      a.click();  // Programmatically click the anchor element to trigger the download
      document.body.removeChild(a);  // Remove the anchor element from the document body
    }
  }

  // Handle cancel event
  onCancel(): void {
    this.selectedFile = null;  // Reset the selected file
    this.fileUrl = null;  // Reset the file URL
    this.originalFileSize = null;  // Reset the original file size
    this.compressedFileSize = null;  // Reset the compressed file size
  }
}
