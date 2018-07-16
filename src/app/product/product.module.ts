import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AdminAuthGuard } from '../shared/services/admin-auth-guard';
import { AuthGuard } from '../shared/services/auth-guard.service';
import { SharedModule } from '../shared/shared.module';
import { OptionComponent } from './components/option/option.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { ProductComponent } from './components/product/product.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forRoot([
      { path: 'product', component: ProductComponent, canActivate: [AuthGuard, AdminAuthGuard] }
    ])
  ],
  declarations: [
    ProductComponent,
    ProductDetailsComponent,
    OptionComponent,
    PricingComponent
  ],
  entryComponents: [
    ProductDetailsComponent,
    OptionComponent,
    PricingComponent
  ]
})
export class ProductModule { }
