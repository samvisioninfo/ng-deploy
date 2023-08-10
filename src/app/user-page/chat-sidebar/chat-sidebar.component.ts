import { DatePipe } from '@angular/common';
import { Component, ElementRef, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Profile } from 'src/app/app.model';
import { AuthService } from 'src/app/auth/auth.service';
import { DataService } from 'src/app/shared/data.service';
import { ChatMessage, ChatMessageObj, ChatSidebar, Product, Sale } from 'src/app/shared/shared.model';
import Swal from 'sweetalert2';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-chat-sidebar',
  templateUrl: './chat-sidebar.component.html',
  styleUrls: ['./chat-sidebar.component.scss']
})
export class ChatSidebarComponent implements OnInit, OnDestroy {

  _unsubscribeAll: Subject<void> = new Subject();
  profileObj: Profile = new Profile;
  messagesList: Array<ChatMessage> = [];
  chatInput: FormControl = new FormControl();
  @Input() product: Product;
  showSpinner: boolean;
  contactName: string;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  showPurchaseBtn: boolean = false;
  customerId: string;
  isSold: boolean;
  aestTime = new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" });

  constructor(
    private _dataService: DataService,
    private _authService: AuthService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    this._authService.loggedInUser.subscribe(data => {
      this.profileObj = data;
    });

    this._dataService.toggleChatPanel.subscribe(data => {
      if (data) {
        // this.showPurchaseBtn = data.showPurchase;
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      if (this.product && this.product.productId) {
        this.showSpinner = true;
        this.messagesList = [];
        this.contactName = null;

        if (this.profileObj && (this.product.member.memberId == this.profileObj.memberId)) {
          this.showPurchaseBtn = true;
        } else {
          this.showPurchaseBtn = false;
        }
        this.getMessages();
      }
    }
  }

  getMessages() {
    if (this.product && this.product.productId) {
      this._dataService.getProductChatMessageList(this.product.productId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
        data => {
          data.isSold?this.showPurchaseBtn=false:null;

          this.isSold = data.isSold;
          this.messagesList = data.messages;
          this.messagesList.forEach(el => {
            if (el.senderId == this.profileObj.memberId) {
              this.contactName = this.messagesList[0].memberName;
            } else {
              this.customerId = el.senderId;
            }

            el.dateAu = moment(el.dateCreated).tz('Australia/Sydney').format('LLL');;
          });

          this.scrollToBottom();
          this.showSpinner = false;
        }, error => {
          this.showSpinner = false;
        }
      );
    }
  }

  onShowFullProfile() {
    let obj: ChatSidebar = new ChatSidebar();
    obj.product = null;
    obj.action = 'out';
    obj.showPurchase = false;
    this._dataService.toggleChatPanel.next(obj);
  }

  sendMessage() {
      let obj: ChatMessageObj = new ChatMessageObj();
      obj.message = this.chatInput.value;
      obj.productId = this.product.productId;
      this.chatInput.setValue(null);
      this._dataService.createProductMessage(obj).pipe(takeUntil(this._unsubscribeAll)).subscribe(
        data => {
          this.getMessages();
        }
      )
  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
    }, 500)
  }


  buyProductFunction() {
    let sale: Sale = new Sale;
    sale.buyerId = this.customerId;
    sale.productId = this.product.productId;
    sale.quantity = 1;
    this._dataService.createSale(sale).subscribe(
      data => {
        Swal.fire({
          icon: 'success',
          title: 'Thank you for your purchase!',
          showConfirmButton: false,
          timer: 2000,
          willClose: () => {
            this.onShowFullProfile();
            this._router.navigate(['/user/public-profile'],
            { queryParams: { memberId: this.profileObj.memberId, activeTab : 2} })
          },
        });
      })
  }


  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
