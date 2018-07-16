import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { FileUpload } from '../models/file-upload';
import { DataService } from './data.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class UploadService {
  url: string;
  baseUrl: string;

  constructor(
    private http: HttpClient) {

    const apiUrl = environment.apiUrl;
    this.baseUrl = apiUrl;
    this.url = '/upload';
  }

  async upload(param: string, file: FileUpload, temp?: boolean) {
    const fd = new FormData();
    fd.append(param, file.data);

    file.id = Guid.newGuid() + file.data.name.substring(file.data.name.lastIndexOf('.'));

    let tempUrl = '';
    if (temp) {
      tempUrl = '/temp';
    }

    return this.http.post<any>(this.baseUrl + this.url + tempUrl + '/' + file.id, fd).catch(error => {
      throw new Error(JSON.stringify(error));
    });

  }

  async delete(id: string) {
    return this.http.delete<any>(this.baseUrl + this.url + '/' + id).catch(error => {
      throw new Error(JSON.stringify(error));
    });
  }
}

class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      // tslint:disable-next-line:no-bitwise
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
