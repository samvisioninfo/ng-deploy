import { Router, RouterStateSnapshot } from '@angular/router';
import { AppService } from './app.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Location } from '@angular/common';
import { loginResponse } from './auth/auth.model';
import { debounceTime, takeUntil } from 'rxjs';
import { SplashScreenStateService } from './shared/splash/splash-screen-state.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DataService } from './shared/data.service';
import { Product } from './shared/shared.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('rightPanel', [
      state('in', style({
        width: '100%',
        opacity: '1',
      })),
      state('out', style({
        opacity: '0',
        visibility: 'hidden',
        width: '0',
      })),
      transition('in => out', animate('100ms ease-in-out')),
      transition('out => in', animate('100ms ease-in-out'))
    ]),
  ],
})
export class AppComponent implements OnInit {
  title = 'aquarium_corals';

  showHeader: boolean = true;

  activeUser: loginResponse = new loginResponse();
  @ViewChild('scrollable', { read: ElementRef }) public scrollable: ElementRef<any>;

  chatProduct: Product = new Product();
  rightPanelSection: string = null;

  constructor(
    private _authService: AuthService,
    private _location: Location,
    private _router: Router,
    private _splashScreenStateService: SplashScreenStateService,
    private _dataService: DataService,
    ) {
  }

  ngOnInit(): void {
    this.rightPanelSection = 'out';

    this.toggleHeaderView();

    this._router.events.subscribe((val) => {
      setTimeout(() => {
        this.scrollable.nativeElement.scrollTop = 0;
      })
    })

    setTimeout(() => {
      this._splashScreenStateService.stop();
    }, 1000);

    // Check if User has saved data in LocalStorage ( if yes - do autologin)
    let user = this._authService.checkLocalStorageUserData();
    if (user) {
      this.activeUser = user;
      this._authService.loggedInUser.next(this.activeUser);
    } else {
      let token = this._authService.checkLocalStorageAccessToken();
      if (token) {
        this._authService.authorizeUser(token).subscribe(
          data => {
            this._authService.isAuthorized = true;
            this._authService.loggedInUser.next(data);
            this._authService.storeAccessTokenToLocalStorage(data.accessToken);
          }
        )
      }

    }

    this._dataService.toggleChatPanel.subscribe(
      data => {
        if (data) {
          this.chatProduct = data.product ? data.product : this.chatProduct;
          this.rightPanelSection = data.action;
        }
      }
    )
  }


  toggleHeaderView() {
    // Check URL on site open ( first time )
    this.showHeader = this._location.path().includes('auth') ? false : true;

    // Check URL on every navigation ( afterwards )
    this._router.events.subscribe(
      (val) => {
        this.showHeader = this._location.path().includes('auth') ? false : true
    });
  }
}
