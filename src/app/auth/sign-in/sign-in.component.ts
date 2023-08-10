import { Component, OnDestroy, OnInit } from '@angular/core';
import {SocialAuthService} from '@abacritt/angularx-social-login';
import { AuthService } from '../auth.service';
import { AuthenticateRequest, loginResponse } from '../auth.model';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit, OnDestroy {

  _unsubscribeAll: Subject<void> = new Subject();
  environmentCondition = environment.production;
  googleId: any;

  constructor(
    private socialAuthService: SocialAuthService,
    private _authService: AuthService,
    private _router: Router,
    ) {

    }

  ngOnInit(): void {
    this.socialAuthService.authState.pipe(takeUntil(this._unsubscribeAll)).subscribe((user) => {
      if (user && user.id) {
        //checl existing user
        this.userLogin(user);
      }
    });
  }

  userLogin(user: any) {
    let _AuthenticateRequest= new AuthenticateRequest();
    _AuthenticateRequest.IdToken = user.idToken;
    this._authService.AuthenticateUser(_AuthenticateRequest).pipe(takeUntil(this._unsubscribeAll)).subscribe(
      (data: loginResponse) => {
        if(data.memberId){

          this._authService.loggedInUser.next(data);
          this._authService.storeAccessTokenToLocalStorage(data.accessToken);

          //set timeout to show loading message
          setTimeout(()=>{
            // Navigate user to User Profile
            this._router.navigate(['./user']);
          }, 1000);
        }
        else{
          //Invalid User
        }
      },
      error => {
        //Invalid User
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
