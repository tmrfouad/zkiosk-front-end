import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Option } from '../models/option';
import { DataService } from './data.service';
import { OptionValue } from '../models/option-value';
import { AccountService } from './account.service';

@Injectable()
export class OptionService extends DataService<Option> {

  constructor(
    http: HttpClient,
    accountSvc: AccountService
  ) {
    super(http, accountSvc);
    this.url = '/option';
  }

  async getByProduct(productId) {
    return this.http.get<Option[]>(this.baseUrl + this.url + '/product/' + productId, { headers: this.headers }).catch(error => {
      throw new Error(JSON.stringify(error));
    });
  }
}
