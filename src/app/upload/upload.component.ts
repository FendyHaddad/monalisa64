import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  standalone: true,
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);  // Verify file selection
  }

  onUpload(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('image', this.selectedFile, this.selectedFile.name);

      this.http.post<{ fileUrl: string }>('http://localhost:3000/api/upload', formData)
        .subscribe({
          next: response => {
            console.log('File available at:', response.fileUrl);
            window.open(response.fileUrl); // Open the file in a new tab
          },
          error: err => {
            console.error(err);  // Log errors
          }
        });
    } else {
      console.error('No file selected');  // Log if no file is selected
    }
  }
}
