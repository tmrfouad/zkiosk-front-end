import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxEditorModule } from 'ngx-editor';

import { MaterialModule } from '../material/material.module';
import { ConfirmDeleteComponent } from './components/confirm-delete/confirm-delete.component';
import { ImageEditorComponent } from './components/image-editor/image-editor.component';
import { UploadComponent } from './components/upload/upload.component';
import { AccountService } from './services/account.service';
import { AdminAuthGuard } from './services/admin-auth-guard';
import { AuthGuard } from './services/auth-guard.service';
import { OptionService } from './services/option.service';
import { ProductService } from './services/product.service';
import { UploadService } from './services/upload.service';
import { VariantService } from './services/variant.service';
import { ZkioskErrorHandler } from './services/zkiosk-error-handler';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    NgxEditorModule,
    MaterialModule
  ],
  declarations: [
    ConfirmDeleteComponent,
    UploadComponent,
    ImageEditorComponent
  ],
  providers: [
    ProductService,
    OptionService,
    VariantService,
    UploadService,
    AccountService,
    AuthGuard,
    AdminAuthGuard,
    [{
      provide: ErrorHandler,
      useClass: ZkioskErrorHandler
    }]
  ],
  exports: [
    FormsModule,
    UploadComponent,
    NgxEditorModule,
    MaterialModule
  ],
  entryComponents: [
    ConfirmDeleteComponent,
    ImageEditorComponent
  ]
})
export class SharedModule { }
