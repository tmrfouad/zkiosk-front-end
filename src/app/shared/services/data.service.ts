import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { environment } from '../../../environments/environment';
import { SharedDataService } from './shared-data.service';
import { AccountService } from './account.service';

@Injectable()
export class DataService<T> implements SharedDataService<T> {
  currentItemSource = new BehaviorSubject<T>(null);
  currentItemsSource = new BehaviorSubject<T[]>([]);

  currentItem = this.currentItemSource.asObservable();
  currentItems = this.currentItemsSource.asObservable();

  protected baseUrl: string;
  protected headers: HttpHeaders;
  private token: string;

  protected url: string;

  constructor(
    protected http: HttpClient,
    private accountSvc: AccountService
  ) {

    const apiUrl = environment.apiUrl;
    this.baseUrl = apiUrl;

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', 'bearer ' + this.accountSvc.userToken);

  }

  async get() {
    return this.http.get<T[]>(this.baseUrl + this.url, { headers: this.headers }).catch(error => {
      throw new Error(JSON.stringify(error));
    });
  }

  async getById(Id) {
    return this.http.get<T>(this.baseUrl + this.url + '/' + Id, { headers: this.headers }).catch(error => {
      throw new Error(JSON.stringify(error));
    });
  }

  async post(item) {
    return this.http.post<T>(this.baseUrl + this.url, item, { headers: this.headers }).catch(error => {
      throw new Error(JSON.stringify(error));
    });
  }

  async put(id, item) {
    return this.http.put<T>(this.baseUrl + this.url + '/' + id, item, { headers: this.headers }).catch(error => {
      throw new Error(JSON.stringify(error));
    });
  }

  async delete(id) {
    return this.http.delete<T>(this.baseUrl + this.url + '/' + id, { headers: this.headers }).catch(error => {
      throw new Error(JSON.stringify(error));
    });
  }

  changeCurrentItem(item: T) {
    this.currentItemSource.next(item);
  }

  changeCurrentItems(items: T[]) {
    this.currentItemsSource.next(items);
  }
}
