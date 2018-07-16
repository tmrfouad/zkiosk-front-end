import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { of } from 'rxjs/_esm2015/operators';
import { catchError, last, map, merge, tap, take, switchMap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { FileUpload } from '../../models/file-upload';
import { UploadService } from '../../services/upload.service';
import { ImageEditorComponent, ImageEditorData, ImageEditorResult } from '../image-editor/image-editor.component';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 100 })),
      transition('* => void', [
        animate(300, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class UploadComponent implements OnInit {
  file: FileUpload;
  imgSrc: string;
  apiUrl: string;
  oldkey;

  @Input() key = '-1';
  @Input() param = 'file';
  @Input() target = this.apiUrl + '/upload';
  @Input() accept = 'image/*';
  @Output() complete = new EventEmitter<FileUpload>();

  constructor(
    private uploadSvc: UploadService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.apiUrl = environment.apiUrl;
    this.imgSrc = this.key ? `${this.apiUrl}/uploads/${this.key}` : `${this.apiUrl}/images/no-image.jpg`;
  }

  onClick() {
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.onchange = async () => {
      const file = fileUpload.files[0];
      this.file = {
        id: this.key,
        data: file,
        state: 'in',
        inProgress: false,
        progress: 0,
        canRetry: false,
        canCancel: true
      };
      this.uploadFile(this.file);
    };
    fileUpload.click();
  }

  private async uploadFile(file: FileUpload) {
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.value = '';

    const upload$ = await this.uploadSvc.upload(this.param, file, true);
    file.sub = upload$
      .subscribe(
        (event: any) => {
          if (typeof (event) === 'object') {
            this.key = file.id;
            this.dialog.open(ImageEditorComponent, {
              data: <ImageEditorData>{
                imageName: this.key,
                imageUrl: `${this.apiUrl}/uploads/temp/${file.id}`
              }
            }).afterClosed().subscribe(async (res: ImageEditorResult) => {
              if (res && res.action === 'ok') {
                this.file.data = res.file;
                const upload1$ = await this.uploadSvc.upload(this.param, this.file);
                upload1$.subscribe(async () => {
                  this.key = file.id;
                  const delete$ = await this.uploadSvc.delete('temp');
                  delete$.subscribe();
                  this.imgSrc = `${this.apiUrl}/uploads/${file.id}`;
                  this.complete.emit(this.file);
                });
              } else {
                const delete$ = await this.uploadSvc.delete('temp');
                delete$.subscribe();
              }
            });
          }
        }
      );
  }

  openEditor() {

  }
}
