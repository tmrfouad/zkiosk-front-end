import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { Option } from '../../../shared/models/option';
import { ProductService } from '../../../shared/services/product.service';
import { OptionService } from '../../../shared/services/option.service';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { MatDialog, MatTableDataSource, MatTable, MatPaginator, MatSort, MatDialogModule } from '@angular/material';
import { ProductDetailsComponent } from '../product-details/product-details.component';
import { DataSource } from '@angular/cdk/table';
import { CollectionViewer } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { ConfirmDeleteComponent } from '../../../shared/components/confirm-delete/confirm-delete.component';
import { environment } from '../../../../environments/environment';
import { UploadService } from '../../../shared/services/upload.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  productDataSource: MatTableDataSource<Product>;
  products: Product[] = [];
  visibleProducts: Product[] = [];

  productGetSubs: Subscription;
  currentProductSubs: Subscription;
  productDeleteSubs: Subscription;

  searchFilter = '';

  displayedColumns = ['image', 'title', 'price', 'sku', 'barcode', 'variantCount', 'actions'];
  apiUrl: string;

  constructor(
    private productSvc: ProductService,
    private uploadSvc: UploadService,
    private dialog: MatDialog) { }

  async ngOnInit() {
    this.apiUrl = environment.apiUrl;
    const get$ = await this.productSvc.get();
    this.productGetSubs = get$.subscribe(products => {
      this.products = JSON.parse(JSON.stringify(products));
      this.searchProducts();
      this.productSvc.changeCurrentItems(this.products);
    });

    this.currentProductSubs = this.productSvc.currentItems.subscribe(products => {
      this.products = products;
      this.productDataSource = new MatTableDataSource<Product>(products);
      this.productDataSource.paginator = this.paginator;
      this.productDataSource.sort = this.sort;
    });
  }

  ngOnDestroy() {
    if (this.productGetSubs) {
      this.productGetSubs.unsubscribe();
    }

    if (this.currentProductSubs) {
      this.currentProductSubs.unsubscribe();
    }
  }

  searchProducts() {
    if (this.productDataSource) {
      this.productDataSource.filter = this.searchFilter;
    }
  }

  newProduct() {
    this.dialog.open(ProductDetailsComponent, {
      width: '70%',
      height: '90%',
      disableClose: true,
      data: {
        new: true
      }
    }).afterClosed().subscribe(result => {
      if (result && result.action === 'save') {
        this.products.push(result.product);
        this.productSvc.changeCurrentItems(this.products);
      }
    });
  }

  editProduct(product: Product) {
    this.dialog.open(ProductDetailsComponent, {
      width: '70%',
      height: '90%',
      disableClose: true,
      data: {
        new: false,
        item: product
      }
    }).afterClosed().subscribe(result => {
      if (result && result.action === 'save') {
        const indx = this.products.findIndex(p => p === product);
        this.products.splice(indx, 1, result.product);
        this.productSvc.changeCurrentItems(this.products);
      }
    });
  }

  async deleteProduct(product: Product) {
    this.dialog.open(ConfirmDeleteComponent).afterClosed()
      .subscribe(async result => {
        if (result && result === 'ok') {
          const delete$ = await this.productSvc.delete(product.id);
          this.productDeleteSubs = delete$.subscribe(async (delProduct: Product) => {
            const indx = this.products.findIndex(p => p === product);
            this.products.splice(indx, 1);
            this.productSvc.changeCurrentItems(this.products);
            const deleteImg$ = await this.uploadSvc.delete(delProduct.imageId);
            deleteImg$.subscribe();
          });
        }
      });
  }

  async refreshProducts() {
    const get$ = await this.productSvc.get();
    this.productGetSubs = get$.subscribe(products => {
      this.products = JSON.parse(JSON.stringify(products));
      this.searchProducts();
      this.productSvc.changeCurrentItems(this.products);
    });
  }
}
