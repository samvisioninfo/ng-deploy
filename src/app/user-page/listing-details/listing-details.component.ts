import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {NgxGalleryOptions} from '@kolkov/ngx-gallery';
import {NgxGalleryImage} from '@kolkov/ngx-gallery';
import {NgxGalleryAnimation} from '@kolkov/ngx-gallery';
import { Profile } from 'src/app/app.model';
import { AuthService } from 'src/app/auth/auth.service';
import { DataService } from 'src/app/shared/data.service';
import { ChatSidebar, Product, ProductDetailsFeedbackDTO, Sale } from 'src/app/shared/shared.model';
import Swal from 'sweetalert2';
import {Location} from '@angular/common';

@Component({
  selector: 'app-listing-details',
  templateUrl: './listing-details.component.html',
  styleUrls: ['./listing-details.component.scss']
})
export class ListingDetailsComponent implements OnInit {

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  tooltipText: string;
  sale: Sale = new Sale;
  productId: string;
  product: Product = new Product();
  dateValue: any;
  dateValueNew: any;
  nameOfFrag: string;
  flowLow: boolean = false;
  flowMed: boolean = false;
  flowHigh: boolean = false;
  lightLow: boolean = false;
  lightMed: boolean = false;
  lightHigh: boolean = false;
  showContactBtn: boolean = false;
  rating: number;
  userRating: number;

  profileObj: Profile = new Profile;

  reviewsList:Array<ProductDetailsFeedbackDTO> =new Array<ProductDetailsFeedbackDTO>();

  constructor(
    public _dataService: DataService,
    private dialog: MatDialog,
    public _authService: AuthService,
    private _route: ActivatedRoute,
    private _router: Router,
    private datepipe: DatePipe,
    private _location: Location) { }

  ngOnInit(): void {
    this._authService.loggedInUser.subscribe(data => {
      this.profileObj = data;
    })

    this.galleryImages = [
    ];

    this.setNgxCarousel();

    this._route.queryParams.subscribe(params => {
      if(params['productId']) {
        this.productId = params['productId']
        this.getProductDetails();
      }
    });

  }

  setNgxCarousel() {
    this.galleryOptions = [
      {
        width: '600px',
        height: '400px',
        thumbnailsColumns: 5,
        arrowPrevIcon: 'fa fa-chevron-left',
        arrowNextIcon: 'fa fa-chevron-right',
        imageAnimation: NgxGalleryAnimation.Slide,
        previewCloseOnClick: true,
        previewKeyboardNavigation: true,
        preview: false,
        imageArrows: true,
        imageSwipe: true,
        thumbnailsArrows: true,
        thumbnailsSwipe: true,
        previewArrows: true,
        previewSwipe: true,
      },
      {
        breakpoint: 1200,
        width: '100%'
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '600px',
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20,
        imageArrows: true,
        imageSwipe: true,
        thumbnailsArrows: true,
        thumbnailsSwipe: true,
        previewArrows: true,
        previewSwipe: true,
        thumbnailsColumns: 3,
      },
      // max-width 400
      {
        breakpoint: 400,
        preview: false,
        imageArrows: true,
        imageSwipe: true,
        thumbnailsArrows: true,
        thumbnailsSwipe: true,
        previewArrows: true,
        previewSwipe: true,
        thumbnailsColumns: 2,
      }
    ];
  }

  getTextForTooltip(text: string) {
    if (text === 'Fresh') {
      this.tooltipText = 'Fresh: < 2 weeks';
    } else if (text === 'New') {
      this.tooltipText = 'New: 2 weeks - 2 months';
    } else if (text === 'Seasoned') {
      this.tooltipText = 'Seasoned: > 2 months';
    }
  }

  getProductDetails(){
    this._dataService.getProductDetails(this.productId).subscribe(data => {
      this.product = data;
      this.rating = this.product.member.rating;
      this.userRating = Math.round(this.rating * 10) / 10
      this.product.productImages = this.product.productImages ? JSON.parse(this.product.productImages) : [];
      this.product.productImages.forEach(el => {
        let obj = {
          small: el,
          medium: el,
          big: el
        }
        this.galleryImages.push(obj);
      })

      this.setNgxCarousel();

      this.reviewsList=this.product.feedbackList;

      this.dateValue = this.product.dateCreated;
      this.dateValueNew = this.datepipe.transform(this.dateValue, 'yyyy/MM/dd');
      this.dateValueNew = this.dateValueNew.split('/').join('-');

      if(this.product.howLongCutoff == 0){
        this.nameOfFrag = "Fresh"
      } else if (this.product.howLongCutoff == 1){
        this.nameOfFrag = "New"
      } else if (this.product.howLongCutoff == 2){
        this.nameOfFrag = "Seasoned"
      }

      if(this.product.flowIntensityName == 'Low'){
        this.flowLow = true;
      } else if(this.product.flowIntensityName == 'Medium'){
        this.flowMed = true;
      } else if(this.product.flowIntensityName == 'High'){
        this.flowHigh = true;
      }

      if(this.product.lightingIntensityName == 'Low (PAR of 30-75)'){
        this.lightLow = true;
      } else if(this.product.lightingIntensityName == 'Medium (PAR of 75-150)'){
        this.lightMed = true;
      } else if(this.product.lightingIntensityName == 'High (PAR of 150+)'){
        this.lightHigh = true;
      }

      if (!this.profileObj || this.profileObj.memberId != this.product.member.memberId) {
        this.showContactBtn = true;
      } else {
        this.showContactBtn = false;
      }

      console.log(this.product)
    })
  }

  showDetails(p) {
    this._router.navigate(
      ['/user/public-profile'],
      { queryParams: { memberId: `${p}`} }
    );
  }

  // onViewRightPanel(product: Product) {
  //   let obj: ChatSidebar = new ChatSidebar();
  //   obj.product = product;
  //   obj.action = 'in';
  //   obj.showPurchase = true;
  //   this._dataService.toggleChatPanel.next(obj);
  // }

  goBack() {
    this._location.back();
  }

}
