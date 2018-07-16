import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatCheckboxChange, MatDialog, MatDialogRef, MatTableDataSource } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { environment } from '../../../../environments/environment';
import { ConfirmDeleteComponent } from '../../../shared/components/confirm-delete/confirm-delete.component';
import { FileUpload } from '../../../shared/models/file-upload';
import { Option } from '../../../shared/models/option';
import { Product } from '../../../shared/models/product';
import { Variant } from '../../../shared/models/variant';
import { OptionService } from '../../../shared/services/option.service';
import { ProductService } from '../../../shared/services/product.service';
import { UploadService } from '../../../shared/services/upload.service';
import { VariantService } from '../../../shared/services/variant.service';
import { OptionComponent, OptionDialogResult } from '../option/option.component';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  product: Product = {};
  options: Option[] = [];
  variants: Variant[] = [];
  generatedVariants: Variant[] = [];
  variantsDataSource: MatTableDataSource<Variant>;
  new: boolean;
  orgImageId: string;
  newImageId: string;


  displayedColumns = ['variant', 'price', 'sku', 'barcode', 'active'];

  selectAllVariants: boolean;

  apiUrl = environment.apiUrl;

  editorConfig = {
    'editable': true,
    'spellcheck': true,
    'height': '150px',
    'minHeight': '0',
    'width': 'auto',
    'minWidth': '0',
    'translate': 'yes',
    'enableToolbar': true,
    'showToolbar': true,
    'placeholder': 'Enter description here...',
    // 'imageEndPoint': '',
    'toolbar': [
      ['bold', 'italic', 'underline', 'strikeThrough', 'superscript', 'subscript'],
      ['fontName', 'fontSize', 'color'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent'],
      [
        // 'cut', 'copy', 'delete',
        'removeFormat', 'undo', 'redo'],
      [
        // 'paragraph', 'blockquote', 'removeBlockquote', 'horizontalLine',
        'orderedList', 'unorderedList'],
      [
        'link', 'unlink'
        // , 'image', 'video'
      ]
    ]
  };

  productPostSubs: Subscription;
  productPutSubs: Subscription;

  optionGetSubs: Subscription;
  optionPostSubs: Subscription;
  optionPutSubs: Subscription;
  optionDeleteSubs: Subscription;
  optionCurrentItemsSubs: Subscription;

  variantGenerateSubs: Subscription;
  variantGetByProductSubs: Subscription;
  variantPutSubs: Subscription;
  variantPostSubs: Subscription;
  variantDeleteSubs: Subscription;
  variantCurrentItemsSubs: Subscription;
  variantPossibleVariantsSubs: Subscription;

  saveSubs: Subscription;
  uploadDeleteSubs: Subscription;

  constructor(
    private dialogRef: MatDialogRef<ProductDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { new: boolean, item: Product },
    private productSvc: ProductService,
    private optionSvc: OptionService,
    private variantSvc: VariantService,
    private dialog: MatDialog,
    private uploadSvc: UploadService) {
  }

  async ngOnInit() {
    if (this.data.item) {
      this.product = JSON.parse(JSON.stringify(this.data.item));
    }
    this.new = this.data.new;
    const get$ = await this.optionSvc.getByProduct(this.product.id);
    this.optionGetSubs = get$.subscribe(options => {
      this.optionSvc.changeCurrentItems(options as Option[]);
    });

    this.optionCurrentItemsSubs = this.optionSvc.currentItems.subscribe(options => {
      this.options = options;
    });

    if (this.new) {
      this.variantSvc.changePossibleVariants([]);
    } else {
      const generateProductVariants$ = await this.generateProductVariants();
      this.variantGenerateSubs = generateProductVariants$.subscribe(gVariants => {
        this.generatedVariants = gVariants as Variant[];
        this.variantSvc.changePossibleVariants(this.generatedVariants);
      });
    }

    const getVariants$ = await this.variantSvc.getByProduct(this.product.id);
    this.variantGetByProductSubs = getVariants$.subscribe(async variants => {
      this.variants = variants as Variant[];
      this.variantSvc.changeCurrentItems(this.variants);
    });

    this.variantPossibleVariantsSubs = this.variantSvc.possibleVariants.subscribe(variants => {
      this.generatedVariants = variants;
      this.setActiveProductVariants();
      this.variantsDataSource = new MatTableDataSource<Variant>(this.generatedVariants);
    });

    this.variantCurrentItemsSubs = this.variantSvc.currentItems.subscribe(variants => {
      this.variants = variants;
      this.setActiveProductVariants();
      this.variantsDataSource = new MatTableDataSource<Variant>(this.generatedVariants);
    });
  }

  ngOnDestroy(): void {
    if (this.productPostSubs) { this.productPostSubs.unsubscribe(); }
    if (this.productPutSubs) { this.productPutSubs.unsubscribe(); }

    if (this.optionGetSubs) { this.optionGetSubs.unsubscribe(); }
    if (this.optionPostSubs) { this.optionPostSubs.unsubscribe(); }
    if (this.optionPutSubs) { this.optionPutSubs.unsubscribe(); }
    if (this.optionDeleteSubs) { this.optionDeleteSubs.unsubscribe(); }
    if (this.optionCurrentItemsSubs) { this.optionCurrentItemsSubs.unsubscribe(); }

    if (this.variantGenerateSubs) { this.variantGenerateSubs.unsubscribe(); }
    if (this.variantGetByProductSubs) { this.variantGetByProductSubs.unsubscribe(); }
    if (this.variantPutSubs) { this.variantPutSubs.unsubscribe(); }
    if (this.variantPostSubs) { this.variantPostSubs.unsubscribe(); }
    if (this.variantDeleteSubs) { this.variantDeleteSubs.unsubscribe(); }
    if (this.variantCurrentItemsSubs) { this.variantCurrentItemsSubs.unsubscribe(); }
    if (this.variantPossibleVariantsSubs) { this.variantPossibleVariantsSubs.unsubscribe(); }

    if (this.saveSubs) { this.saveSubs.unsubscribe(); }
    if (this.uploadDeleteSubs) { this.uploadDeleteSubs.unsubscribe(); }
  }

  setActiveProductVariants() {
    if (this.generatedVariants && this.variants) {
      for (let i = 0; i < this.generatedVariants.length; i++) {
        const variant = this.generatedVariants[i];
        const foundVariant = this.variants
          .find(pp => pp.productId === variant.productId &&
            pp.valuesId === variant.valuesId);
        if (foundVariant) {
          foundVariant.active = true;
          this.generatedVariants.splice(i, 1, foundVariant);
        } else {
          variant.active = false;
          variant.id = undefined;
        }
      }
    }
    this.selectAllVariants = this.isAllVariantsActive();
  }

  async save() {
    const product: Product = JSON.parse(JSON.stringify(this.product));
    if (this.new) {
      const post$ = await this.productSvc.post(product);
      return post$;
    } else {
      const put$ = await this.productSvc.put(this.product.id, product);
      return put$;
    }
  }

  async saveAndClose() {
    const save$ = await this.save();
    this.saveSubs = save$.subscribe(async (product: Product) => {
      // delete previous image
      if (this.orgImageId) {
        const delete$ = await this.uploadSvc.delete(this.orgImageId);
        this.uploadDeleteSubs = delete$.subscribe();
      }
      // update variants
      product.variants = [];
      this.generatedVariants.forEach(async variant => {
        if (variant.active) {
          product.variants.push(variant);
          if (variant.id && variant.id > 0) {
            const variantPut$ = await this.variantSvc.put(variant.id, variant);
            this.variantPutSubs = variantPut$.subscribe();
          } else {
            variant.id = undefined;
            variant.productId = product.id;
            variant.values.forEach(val => val.id = undefined);
            const variantPost$ = await this.variantSvc.post(variant);
            this.variantPostSubs = variantPost$.subscribe();
          }
        } else {
          if (variant.id && variant.id > 0) {
            const variantDelete$ = await this.variantSvc.delete(variant.id);
            this.variantDeleteSubs = variantDelete$.subscribe();
          }
        }
      });
      this.dialogRef.close({ action: 'save', product: product });
    });
  }

  async cancel() {
    if (this.newImageId) {
      const delete$ = await this.uploadSvc.delete(this.newImageId);
      this.uploadDeleteSubs = delete$.subscribe(() => this.dialogRef.close({ action: 'cancel' }));
    } else {
      this.dialogRef.close({ action: 'cancel' });
    }
  }

  async newOption() {
    this.dialog.open(OptionComponent, {
      width: '400px',
      data: {
        new: true,
        productId: this.product.id
      }
    }).afterClosed().subscribe(async (result: OptionDialogResult) => {
      if (result && result.action && result.action === 'save') {
        const save$ = await this.save();
        this.saveSubs = save$.subscribe(async (product: Product) => {
          this.new = false;
          this.product = product;
          result.option.productId = product.id;
          const post$ = await this.optionSvc.post(result.option);
          this.optionPostSubs = post$.subscribe(async (resOption: Option) => {
            result.option.id = resOption.id;
            this.options.push(result.option);
            this.optionSvc.changeCurrentItems(this.options);
            this.refreshVariants();
          });
        });
      }
    });
  }

  editOption(option: Option) {
    this.dialog.open(OptionComponent, {
      width: '400px',
      data: {
        new: false,
        productId: this.product.id,
        option: option
      }
    }).afterClosed().subscribe(async (result: OptionDialogResult) => {
      if (result && result.action && result.action === 'save') {
        const put$ = await this.optionSvc.put(result.option.id, result.option);
        this.optionPutSubs = put$.subscribe(async (resOption: Option) => {
          result.option.id = resOption.id;
          const indx = this.options.findIndex(v => v === option);
          this.options.splice(indx, 1, result.option);
          this.optionSvc.changeCurrentItems(this.options);
          this.refreshVariants();
        });
      }
    });
  }

  async deleteOption(option: Option) {
    this.dialog.open(ConfirmDeleteComponent).afterClosed()
      .subscribe(async result => {
        if (result && result === 'ok') {
          const delete$ = await this.optionSvc.delete(option.id);
          this.optionDeleteSubs = delete$.subscribe(delOption => {
            const indx = this.options.findIndex(v => v === option);
            this.options.splice(indx, 1);
            this.optionSvc.changeCurrentItems(this.options);
            this.refreshVariants();
          });
        }
      });
  }

  async refreshVariants() {
    const getAvailableVariants$ = await this.generateProductVariants();
    this.variantGenerateSubs = getAvailableVariants$.subscribe(variants => {
      this.variantSvc.changePossibleVariants(variants as Variant[]);
    });
  }

  async generateProductVariants() {
    return await this.variantSvc.generateByProduct(this.product.id);
  }

  selectDeselectAllVariants(e: MatCheckboxChange) {
    this.generatedVariants.forEach(variant => {
      variant.active = e.checked;
    });
  }

  isAllVariantsActive() {
    let allChecked = true;
    for (let i = 0; i < this.generatedVariants.length; i++) {
      const variant = this.generatedVariants[i];
      if (!variant.active) {
        allChecked = false;
        break;
      }
    }
    return allChecked;
  }

  variantActiveChanged(e: MatCheckboxChange, variant: Variant) {
    variant.active = e.checked;
    const i = this.generatedVariants.indexOf(variant);
    const variantInput = document.querySelector('#variant' + i);
    const skuInput = document.querySelector('#sku' + i);
    const barcodeInput = document.querySelector('#barcode' + i);

    if (!e.checked) {
      variant.price = this.product.price;
      variant.sku = this.product.sku;
      variant.barcode = this.product.barcode;
      variantInput.setAttribute('disabled', 'disabled');
      skuInput.setAttribute('disabled', 'disabled');
      barcodeInput.setAttribute('disabled', 'disabled');
    } else {
      variantInput.removeAttribute('disabled');
      skuInput.removeAttribute('disabled');
      barcodeInput.removeAttribute('disabled');
    }
    this.selectAllVariants = this.isAllVariantsActive();
  }

  variantPropertyChanged(e, variant: Variant) {
    const prop = e.target.name;
    variant[prop] = e.target.value;
  }


  imageUploadComplete(file: FileUpload) {
    if (file) {
      this.orgImageId = this.product.imageId;
      this.newImageId = file.id;
      this.product.imageId = file.id;
    }
  }
}

export class VariantsDataSource extends DataSource<Variant> {

  constructor(private variantSvc: VariantService) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<Variant[]> {
    return this.variantSvc.possibleVariants;
  }

  disconnect(collectionViewer: CollectionViewer): void {
  }
}
