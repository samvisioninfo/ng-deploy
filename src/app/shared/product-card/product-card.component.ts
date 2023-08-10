import { Component, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { DataService } from '../data.service';
import { Subject, takeUntil } from 'rxjs';
import { ChatSidebar, LookupEntry, Product, ProductUpdateStatus } from '../shared.model';
import { MenuCloseReason } from '@angular/material/menu/menu';
import { FormBuilder, FormControl } from '@angular/forms';



@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit, OnDestroy {

  /**
  * Public Variables
  */
  showStatus: Array<LookupEntry> = [];
  showSaveButton: boolean = false;
  status_name: FormControl = new FormControl('')
  update_status: ProductUpdateStatus = new ProductUpdateStatus()
  @Input() product: any;
  @Input() showActions: boolean;

  /**
  * Private Variables
  */
  private _unsubscribeAll: Subject<void> = new Subject();

  /**
  * Constructor
  * 
  * @param { AuthService } _authService 
  * @param { MatDialog } dialog
  * @param { DataService } _dataService
  * @param { FormBuilder } _formBuilder
  */

  constructor(
    public _authService: AuthService,
    private dialog: MatDialog,
    private _dataService: DataService,
    private _formBuilder: FormBuilder,

  ) { }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
    * On init
    */

  ngOnInit(): void {
    this.getProductStatus()
  }

  /**
    * On destroy
    */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
    * Function to delete producta
    */
  deleteProduct(productId: string) {
    Swal.fire({
      title: 'Are you sure you want to delete this listing?',
      showDenyButton: false,
      showCancelButton: true,
      denyButtonText: `No`,
      confirmButtonText: 'Yes',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this._dataService.deleteProduct(productId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
          data => {
            Swal.fire('Successfully deleted!', '', 'success');
            this._dataService.refreshUProfileProducts.next();
          }, error => {
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
    })
  }

  // onViewRightPanel(product: Product) {
  //   let obj: ChatSidebar = new ChatSidebar();
  //   obj.product = product;
  //   obj.action = 'in';
  //   obj.showPurchase = false;
  //   this._dataService.toggleChatPanel.next(obj);
  // }

  /**
    * Function to get the product status
    */
  getProductStatus() {
    this._dataService.getListingLookups('PRODUCT_STATUS').pipe(takeUntil(this._unsubscribeAll)).subscribe(
      (data: Array<LookupEntry>) => {
        this.showStatus = data;
      }
    );
  }

  /**
    * Function for Getting Status Name
    */
  get status() {
    return this.status_name.get('status_name');
  }

  /**
  * Function on menu item click show value 
  */
  onMenuItemClick(selected_item: any) {
    if (selected_item) {
      this.showSaveButton = true
      this.product.status = selected_item.name;
      this.status_name.setValue(selected_item)
    }
    // else{
    //   this.showSaveButton = false
    // }
  }

  /**
  * Function to change product sttaus
  */
  saveChangedStatus() {
    let status_update: ProductUpdateStatus = new ProductUpdateStatus();
    this.showSaveButton = true
    status_update.productId = this.product.productId;;
    status_update.status = this.status_name.value.name;

    this._dataService.ProductUpdateStatus(status_update).subscribe(
      data => {
        Swal.fire({
          icon: 'success',
          title: 'Status was succefully updated!',
          showConfirmButton: false,
          timer: 2000,
          // willClose: () => {
          //   this.showSaveButton  = false
          // }
        });
        this.showSaveButton  = false

      }, error => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong! Please try again',
          showConfirmButton: false,
          timer: 3000,
        });
      }
    )
  }
}
