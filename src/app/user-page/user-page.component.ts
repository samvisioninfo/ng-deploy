import { ReviewComponent } from './review/review.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConnectableObservable, Subject, takeUntil } from 'rxjs';
import { loginResponse } from '../auth/auth.model';
import { AuthService } from '../auth/auth.service';
import { DataService } from '../shared/data.service';
import { CarouselComponent } from './carousel/carousel.component';
import { Profile } from '../app.model';
import { ChatSidebar, Product, ProductFeedbackDetailsDTO, ProductListEntry, Review } from '../shared/shared.model'
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, Location } from '@angular/common';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss']
})
export class UserPageComponent implements OnInit {

 listingEmpty : boolean = false;
 reviewEmpty : boolean = false;
 purachaseEmpty: boolean = false;
 activeUser: loginResponse = new loginResponse();
 private _unsubscribeAll: Subject<void> = new Subject();
 userData: any = null;
 user: Profile = new Profile();
 showPageSpinner: boolean = true;
 product: Array<ProductListEntry>;
 reviewsList: Array<ProductFeedbackDetailsDTO>= [];
 purchases: any;
 dateValue: any;
 nameOfFrag: string;
 productId: string;
 memberId: string;
 queryParamsChecked: boolean;
 isOwnerProfile: boolean;
 tabIndex: number = 0;
 emptyAvatar: string = '../../assets/images/empty_avatar.jpg';
 rating: number;
 userRating: number;
 productsLoaded: boolean = false;
 reviewsLoaded: boolean = false;
 purchasesLoaded: boolean = false;

  constructor(
    private dialog: MatDialog,
    public _authService: AuthService,
    public _dataService: DataService,
    private _router: Router,
    private datepipe: DatePipe,
    private _route: ActivatedRoute,
    private location: Location,
    ) {
      this._authService.loggedInUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(
        data => {
          if (data) {
            this.userData = data;
          }
        }
      )
    }

  ngOnInit(): void {
    this._route.queryParams.subscribe(params => {
      if (!this.queryParamsChecked) {
        if (params['memberId']) {
          this.memberId = params['memberId'];
          this.getUserDetails();
          this.queryParamsChecked = true;
        }
        if (params['activeTab']) {
          setTimeout(() => {
            if (!this.memberId) {
              this.tabIndex = 0;
            } else {
              this.tabIndex = params['activeTab'];
            }
          },2500)

        }
      }
      this.setQueryParams();
    })

    // Login response
    this._authService.loggedInUser.subscribe(
      (data: loginResponse) => {
        this.activeUser = data;
        if (!this.memberId) {
          this.memberId = this.activeUser.memberId;
          this.getUserDetails();
          this.setQueryParams();
          this.isOwnerProfile = true;
        } else {
          if (this.activeUser && this.activeUser.memberId == this.memberId) {
            this.isOwnerProfile = true;
          }
        }
    });

    this._dataService.refreshUProfileProducts.pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        this.getProductList();
      }
    );

    this._dataService.switchToOwnerAccount.pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        this.memberId = this.activeUser.memberId;
        this.isOwnerProfile = true;

        this.productsLoaded = false;
        this.reviewsLoaded = false;
        this.purchasesLoaded = false;

        this.product = [];
        this.reviewsList = [];
        this.purchases = [];
        this.tabIndex = 0;

        this.setActiveTab();
        this.getUserDetails();
      }
    )

    this.setActiveTab();
    // this.tabIndex = parseInt(sessionStorage.getItem('lastSelectedTabIndex'), 10) || 0;
    // this.setQueryParams();
    // if (this.tabIndex === 0) {
    //   this.getProductList();
    //   this.productsLoaded = true;
    // }
    // if (this.tabIndex === 1) {
    //   this.getPreviousReviews();
    //   this.reviewsLoaded = true;
    // }
    // if (this.tabIndex === 2) {
    //   this.getUserPurchases();
    //   this.purchasesLoaded = true;
    // }
  }

  images:Array<string> = ['../../assets/images/coral-reef-aquarium-scaled-1.jpg', '../../assets/images/9937-1-i8Qn6g.jpg', '../../assets/images/IMG_7244-scaled.jpeg', '../../assets/images/leather.jpg', '../../assets/images/hammers.jpg']


  setQueryParams() {
    const queryParams = {
      memberId: this.memberId,
      activeTab: this.tabIndex
    };
    this.location.replaceState(this._router.createUrlTree([], { queryParams }).toString());
  }

  openDialog(index: number) {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    let dialogWidth: string = '100%';
    let dialogHeight: string;

    if (window.innerWidth < 768) {
      dialogWidth = '100%';
      dialogHeight = dialogHeight;
    } else {
      dialogWidth = '600px';
      dialogHeight = dialogHeight;
    }

    const dialogRef = this.dialog.open(CarouselComponent, {
      height: dialogHeight,
      width: dialogWidth,
      maxWidth: '600px',
      maxHeight: dialogHeight,
      panelClass: 'custom-modalbox',
      data: {
        imageIndex: index,
        images: this.user.images
      }
    });

  }

  dialogReview() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(ReviewComponent, {
      height: '500px',
      width: '90%',
      maxWidth: '1100px',
      maxHeight: '500px',
      panelClass: 'custom-modalbox',
          data: {
            productId: this.productId
          }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getProductList();
    })
}

  getUserDetails() {
    this._dataService.getUserDetails(this.memberId).subscribe(
      (data: Profile) => {
        this.showPageSpinner = false;
        this.user = data;
        this.user.images = this.user.images ? JSON.parse(this.user.images) : [];
        this.rating = this.user.rating;
        this.userRating = Math.round(this.rating * 10) / 10

        // this.getProductList();
      },
      error => {
        this.showPageSpinner = false;
      }
    )
  }

  getUserPurchases() {
    this._dataService.getUserPurchases().subscribe(
      data => {
        this.showPageSpinner = false;
        this.purchases = data;
        this.purchases = this.purchases.response;
        console.log(this.purchases)
        this.purchases.forEach(purchase => {
          purchase.product.productImages = purchase.product.productImages ? JSON.parse(purchase.product.productImages) : [];
          this.productId = purchase.product.productId
        });
        this.purachaseEmpty = this.purchases.length < 1 ? true : false;
      },
      error => {
        this.showPageSpinner = false;
      }
    )
  }

  getProductList() {
    this._dataService.getProductList(this.memberId).subscribe(
      data => {
        this.showPageSpinner = false;
        this.product = data;

        this.product.forEach(element => {
          element.flowIntensity = element.flowIntensity == 91 ? 'Low' : element.flowIntensity == 91 ? 'Medium' : 'High';
          element.howLongCutoff = element.howLongCutoff == 0 ? 'FRESH' : element.howLongCutoff == 1 ? 'NEW' : 'SEASONED';
          element.productImages = element.productImages ? JSON.parse(element.productImages) : [];
        });
        this.listingEmpty = this.product.length < 1 ? true : false;
      },
      error => {
        this.showPageSpinner = false;
        this.listingEmpty = true;
      }
    )
  }

  getPreviousReviews() {
    let reviewData;
    this._dataService.getFeedback(this.memberId).subscribe(data => {
      if (data) {
        reviewData = data;
        this.reviewsList = reviewData.response;
        this.reviewEmpty = this.reviewsList.length < 1 ? true : false;
        this.reviewsList = this.reviewsList.map((review: ProductFeedbackDetailsDTO) => {
          review.product.productImages = review.product.productImages ? JSON.parse(review.product.productImages) :[];
          return review;
        })
      }
    });
  }

  tabChanged(event: any) {
    this.tabIndex = event.index;
    this.setQueryParams();
    this.setActiveTab();
  }

  setActiveTab() {
    if (this.tabIndex == 0 && !this.productsLoaded) {
      this.getProductList();
      this.productsLoaded = true;
    }
    if (this.tabIndex == 1 && !this.reviewsLoaded) {
      this.getPreviousReviews();
      this.reviewsLoaded = true;
    }
    if (this.tabIndex == 2 && !this.purchasesLoaded) {
      this.getUserPurchases();
      this.purchasesLoaded = true;
    }
  }

  // onViewRightPanel(product: Product) {
  //   let obj: ChatSidebar = new ChatSidebar();
  //   obj.product = product;
  //   obj.action = 'in';
  //   obj.showPurchase = false;
  //   this._dataService.toggleChatPanel.next(obj);
  // }
}
