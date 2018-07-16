import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { DataService } from './data.service';
import { Product } from '../models/product';
import { AccountService } from './account.service';

@Injectable()
export class ProductService extends DataService<Product> {
  constructor(
    http: HttpClient,
    accountSvc: AccountService
  ) {
    super(http, accountSvc);
    this.url = '/product';
  }
}
