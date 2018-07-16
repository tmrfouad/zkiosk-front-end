import { Injectable } from '@angular/core';
import { Variant } from '../models/variant';
import { DataService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AccountService } from './account.service';

@Injectable()
export class VariantService extends DataService<Variant> {
  possibleVariantsSource = new BehaviorSubject<Variant[]>([]);

  possibleVariants = this.possibleVariantsSource.asObservable();

  constructor(
    http: HttpClient,
    accountSvc: AccountService
  ) {
    super(http, accountSvc);
    this.url = '/variant';
  }

  async getByProduct(productId) {
    return this.http.get<Variant[]>(this.baseUrl + this.url + '/product/' + productId, { headers: this.headers }).catch(error => {
      throw new Error(JSON.stringify(error));
    });
  }

  async generateByProduct(productId) {
    return this.http.get<Variant[]>(this.baseUrl + this.url + '/generate/' + productId, { headers: this.headers }).catch(error => {
      throw new Error(JSON.stringify(error));
    });
  }

  async postRange(variantValues) {
    return this.http.post<Variant[]>(this.baseUrl + this.url + '/range/', variantValues, { headers: this.headers }).catch(error => {
      throw new Error(JSON.stringify(error));
    });
  }

  async deleteByProduct(id) {
    return this.http.delete<Variant[]>(this.baseUrl + this.url + '/product/' + id, { headers: this.headers }).catch(error => {
      throw new Error(JSON.stringify(error));
    });
  }

  changePossibleVariants(items: Variant[]) {
    this.possibleVariantsSource.next(items);
  }

}
