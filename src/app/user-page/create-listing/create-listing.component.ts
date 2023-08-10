import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AfterDialogCloseData, CreatProductDTO, DataToCropperDialog, ImageCropperDialogCloseData, LookupEntry, Product, UpdateProductDTO } from 'src/app/shared/shared.model';
import { DataService } from 'src/app/shared/data.service';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/auth/auth.service';
import { filter, Subject, takeUntil } from 'rxjs';
import { DatePipe } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ImageCropperDialogComponent } from 'src/app/shared/image-cropper-dialog/image-cropper-dialog.component';
import { Profile } from 'src/app/app.model';

@Component({
  selector: 'app-create-listing',
  templateUrl: './create-listing.component.html',
  styleUrls: ['./create-listing.component.scss']
})
export class CreateListingComponent implements OnInit, OnDestroy {

  images = [];
  selectedType = '';
  createProduct: FormGroup;
  timeOfCut: string;
  evt: any;
  maxDate: any = new Date();

  itemTypes: Array<LookupEntry> = [];
  coralGroups: Array<LookupEntry> = [];
  itemSpecies: Array<LookupEntry> = [];
  flowIntensities: Array<LookupEntry> = [];
  LightingIntensities: Array<LookupEntry> = [];

  _unsubscribeAll: Subject<void> = new Subject();
  productId!: string;
  action: string = 'Create';
  isLoading: boolean = false;

  editor = ClassicEditor as {
    create: any;
  };

  editorData = 'hi'
  data: any;
  dialogRef: any;

  profileObj: Profile = new Profile;
  showSpinner = true;

  constructor(private _formBuilder: FormBuilder,
    public _dataService: DataService,
    public _authService: AuthService,
    public _router: Router,
    public datepipe: DatePipe,
    private _route: ActivatedRoute,
    private _location: Location,
    private _matDialog: MatDialog,) {
    this.initForm();
  }

  ngOnInit(): void {
    this.getLookups();
    this.checkQueryParams();

    this.createProduct.get('groupId').valueChanges.subscribe(data => {
      this.getCoralSpecies();
    });

    this._authService.loggedInUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        if (data) {
          this.profileObj = data;
        }
      }
    );

    setTimeout(() => {
      if (!this.profileObj || !this.profileObj.memberId) {
        this._router.navigate(['/landing']);
      } else {
        this.showSpinner = false;
      }
    }, 2000)
  }

  getLookups() {
    this._dataService.getListingLookups('ITEM_TYPE').pipe(takeUntil(this._unsubscribeAll)).subscribe(
      (data: Array<LookupEntry>) => {
        this.itemTypes = data;
      }
    );

    this._dataService.getListingLookups('CORAL_GROUP').pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        this.coralGroups = data;
      }
    );

    // this._dataService.getListingLookups('CORAL_SPECIES').pipe(takeUntil(this._unsubscribeAll)).subscribe(
    //   data => {
    //     this.itemSpecies = data;
    //   }
    // );

    this.getCoralSpecies();

    this._dataService.getListingLookups('FLOW_INTENSITY').pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        this.flowIntensities = data;
      }
    );

    this._dataService.getListingLookups('LIGHTING_INTENSITY').pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        this.LightingIntensities = data;
      }
    );
  }

  getCoralSpecies() {
    let val = this.createProduct.get('groupId').value;
    this._dataService.getCoralSpeciesLookup(val).pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        this.itemSpecies = data;
      }
    )
  }

  checkQueryParams() {
    this._route.queryParams.subscribe(params => {
      if (params['productId']) {
        this.getProductDetails(params['productId']);
        this.action = 'Update';
        this.productId = params['productId'];
      }
    })
  }

  getProductDetails(productId: string) {
    this._dataService.getProductDetails(productId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        switch (data.howLongCutoff) {
          case 0: {
            this.createProduct.get('howLongCutoff').setValue('FRESH');
            break;
          }
          case 1: {
            this.createProduct.get('howLongCutoff').setValue('NEW');
            break;
          }
          case 2: {
            this.createProduct.get('howLongCutoff').setValue('SEASONED');
            break;
          }
        }

        this.createProduct.get('ageOfFrag').setValue(data.ageOfFrag = data.ageOfFrag ? new Date(data.ageOfFrag).toISOString() : null);
        this.images = data.productImages ? JSON.parse(data.productImages) : [];

        this.createProduct.patchValue({
          productName: data.productName,
          price: data.price,
          groupId: data.groupId,
          coralSpecies: data.coralSpecies,
          flowIntensity: data.flowIntensity,
          lightingIntensity: data.lightingIntensity,
          itemType: data.itemType,
          alkalinity: data.alkalinity,
          nitrate: data.nitrate,
          phosphate: data.phosphate,
          calcium: data.calcium,
          magnesium: data.magnesium,
          description: data.description,
          productImages: data.productImages,
        });

        this.getCoralSpecies();

      }
    )
  }


  calculateTimeOfCut() {
    let selectedDate = this.createProduct.get('ageOfFrag').value;

    let today: any = new Date();
    let twoWeeks: any = new Date().setDate(today.getDate() - 14);
    let twoMonths: any = new Date().setMonth(today.getMonth() - 2)

    today = this.datepipe.transform(today, 'MM/dd/yyyy')
    twoWeeks = this.datepipe.transform(twoWeeks, 'MM/dd/yyyy')
    twoMonths = this.datepipe.transform(twoMonths, 'MM/dd/yyyy')
    selectedDate = this.datepipe.transform(selectedDate, 'MM/dd/yyyy')

    today = new Date(today);
    twoWeeks = new Date(twoWeeks);
    twoMonths = new Date(twoMonths);
    selectedDate = new Date(selectedDate);

    if (selectedDate.getTime() > twoWeeks.getTime()) {
      this.timeOfCut = "FRESH";
    } else if ((selectedDate.getTime() <= twoWeeks.getTime()) && (selectedDate.getTime() >= twoMonths.getTime())) {
      this.timeOfCut = "NEW";
    } else if (selectedDate.getTime() < twoMonths.getTime()) {
      this.timeOfCut = "SEASONED";
    }

    this.createProduct.get('howLongCutoff').setValue(this.timeOfCut);

  }

  initForm() {
    this.createProduct = this._formBuilder.group({
      productName: new FormControl('', Validators.required),
      price: new FormControl('', Validators.required),
      groupId: new FormControl(''),
      coralSpecies: new FormControl(''),
      flowIntensity: new FormControl<number>(null),
      lightingIntensity: new FormControl<number>(null),
      itemType: new FormControl('', Validators.required),
      alkalinity: new FormControl('', [Validators.min(3), Validators.max(15)]),
      nitrate: new FormControl('', [Validators.min(0), Validators.max(100)]),
      phosphate: new FormControl('', [Validators.min(0), Validators.max(10)]),
      calcium: new FormControl('', [Validators.min(300), Validators.max(600)]),
      magnesium: new FormControl('', [Validators.min(1200), Validators.max(1700)]),
      description: new FormControl(''),
      productImages: this.images,
      howLongCutoff: new FormControl(''),
      ageOfFrag: new FormControl(''),
    })
  }


  /**
     * Function for cropping image
     */
  cropImage(event: any) {
    let _data: DataToCropperDialog = new DataToCropperDialog();
    _data.event = event;
    _data.aspect_ratio = 7 / 5;
    _data.resize_to_width = 400;
    _data.need_resize = false;
    _data.blobname = "products"
    this.dialogRef = this._matDialog.open(ImageCropperDialogComponent, {
      data: _data,
      panelClass: 'custom-dialog-container',
      autoFocus: false,
      disableClose: true,
      // width: '600px'
    });
    this.dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll), filter((value: AfterDialogCloseData<ImageCropperDialogCloseData>) => value.result)).subscribe(
      (value: AfterDialogCloseData<ImageCropperDialogCloseData>) => {
        console.log('cropped value ==>> ', value);
        this.createProduct.patchValue({ thumbnail: value.data.image_url });

        this.images.push(value.data.image_url);

        // this.onFileChange(event)

      }
    );
  }

  removeSelectedFile(index) {
    this.images.splice(index, 1);
  }

  //  TAKE THE VALUE FROM SELECTED OPTION IN CORAL SPECIES SECTION
  onSelectedType(value: string): void {
    this.selectedType = value;
  }

  postListing() {
    this.isLoading = true;
    //let product: CreatProductDTO | UpdateProductDTO;
    let product = this.action == 'Create' ? new CreatProductDTO() : new UpdateProductDTO();
    product.productName = this.createProduct.get('productName').value;
    product.price = this.createProduct.get('price').value;
    product.groupId = this.createProduct.get('groupId').value && this.createProduct.get('groupId').value != '' ? this.createProduct.get('groupId').value : null;
    product.coralSpecies = this.createProduct.get('coralSpecies').value && this.createProduct.get('coralSpecies').value != '' ? this.createProduct.get('coralSpecies').value : null;
    product.flowIntensity = this.createProduct.get('flowIntensity').value;
    product.lightingIntensity = this.createProduct.get('lightingIntensity').value;
    product.itemType = this.createProduct.get('itemType').value;
    product.alkalinity = this.createProduct.get('alkalinity').value;
    product.alkalinity = product.alkalinity ? product.alkalinity.toString() : null;
    product.nitrate = this.createProduct.get('nitrate').value;
    product.nitrate = product.nitrate ? product.nitrate.toString() : null;
    product.phosphate = this.createProduct.get('phosphate').value;
    product.phosphate = product.phosphate ? product.phosphate.toString() : null;
    product.calcium = this.createProduct.get('calcium').value;
    product.calcium = product.calcium ? product.calcium.toString() : null;
    product.magnesium = this.createProduct.get('magnesium').value;
    product.isSold = product.isSold ? product.isSold : false;
    product.magnesium = product.magnesium ? product.magnesium.toString() : null;
    let ageOfFrag = this.createProduct.get('ageOfFrag').value ? this.createProduct.get('ageOfFrag').value : null;
    product.ageOfFrag = this.datepipe.transform(ageOfFrag, 'yyyy-MM-dd');
    product.description = this.createProduct.get('description').value && this.createProduct.get('description').value != 'Description' ? this.createProduct.get('description').value : null;
    product.productImages = this.images.length > 0 ? JSON.stringify(this.images) : null;
    switch (this.createProduct.get('howLongCutoff').value) {
      case 'FRESH': {
        product.howLongCutoff = 0;
        break;
      }
      case 'NEW': {
        product.howLongCutoff = 1;
        break;
      }
      case 'SEASONED': {
        product.howLongCutoff = 2;
        break;
      }
    }

    if (this.action == 'Create') {
      this._dataService.createProduct(product).subscribe(
        data => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Product was succefully created!',
            showConfirmButton: false,
            timer: 2000,
            willClose: () => {
              this._router.navigate(['/user'])
            },
          });
        }, error => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! Please try again',
            showConfirmButton: false,
            timer: 3000,
            willClose: () => {
            }
          });
        }
      )
    } else {

      (product as UpdateProductDTO).productId = this.productId;
      this._dataService.updateProduct(product).subscribe(
        data => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Product was succefully updated!',
            showConfirmButton: false,
            timer: 2000,
            willClose: () => {
              this._router.navigate(['/user'])
            },
          });
        }, error => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! Please try again',
            showConfirmButton: false,
            timer: 3000,
            willClose: () => {
            }
          });
        }
      )
    }

  }

  twoDecimalFilter(event: any) {
    const reg = /^-?\d*(\.\d{0,2})?$/;
    let input = event.target.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  oneDecimalFilter(event: any) {
    const reg = /^-?\d*(\.\d{0,1})?$/;
    let input = event.target.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  goBack() {
    this._location.back();
  }
}
