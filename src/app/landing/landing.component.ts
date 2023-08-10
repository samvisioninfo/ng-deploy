import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../shared/data.service';
import { Product, ProductCategory } from '../shared/shared.model';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {

  productList: Array<Product>;
  categoryList: Array<ProductCategory>;
  showPageSpinner: boolean;
  productsEmpty: boolean;
  categoriesEmptry: boolean;
  bubbles = Array.from({length: 30}, (_, i) => ({id: i}));

  constructor(private _dataService:DataService, private _router: Router, private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.showPageSpinner = true;
    this.getProductListLandingLatest();
    this.getProductCategoriesLanding();
    
  }
  ngAfterViewInit() {
    this.fishTank();
  }

  showDetails(product) {
    this._router.navigate(
      ['/user/listing-details'],
      { queryParams: { productId: `${product.productId}`} }
    );
  }

  getProductListLandingLatest() {
    this._dataService.getProductListLandingLatest().subscribe(
      data => {
        this.productList = data;
        this.productList.forEach(product => {
          product.productImages =product.productImages ? JSON.parse(product.productImages) : [];
        });
        this.showPageSpinner = false;

        this.productsEmpty = this.productList && this.productList.length > 0 ? false : true;
      }
    )
  }

  getProductCategoriesLanding() {
    this._dataService.getProductCategoriesLanding().subscribe(
      data => {
        this.categoryList= data;
        this.showPageSpinner = false;

        this.categoriesEmptry = this.categoryList && this.categoryList.length > 0 ? false : true;
      }
    )
  }

  filterCategory(categoryId: string, groupId: string) {
    this._router.navigate(
      ['/all-listings'],
      { queryParams: { categoryId: categoryId, groupId: groupId} }
    );
  }

  fishTank() {
    const bubbleElements = this.elementRef.nativeElement.querySelectorAll('.bubble-rise');
    bubbleElements.forEach(bubbleElement => {
      const randNum = Math.floor(Math.random() * 20) + 1;
      const animationDuration = 2 + (0.5 * randNum);
      bubbleElement.setAttribute('style', `animation-duration: ${animationDuration}s`);
    });
  }
}
