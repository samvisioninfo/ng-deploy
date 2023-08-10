import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocialAuthService} from '@abacritt/angularx-social-login';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../auth.service';
import { AuthenticateRequest, loginResponse, registerObj } from '../auth.model';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit, OnDestroy {

  signupLoadingMessage:string ='Sign Up';
  googleSignupDetails:boolean = false;
  _unsubscribeAll: Subject<void> = new Subject();
  signupDetails: registerObj = new registerObj();
  form: FormGroup;

  constructor(
    private socialAuthService: SocialAuthService,
    private _authService: AuthService,
    private _router: Router,
    private _fb: FormBuilder,
    ) {
      this.initForm();
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
          // Navigate user to User Profile
          this.signupLoadingMessage='Existing users... <br> Redirecting to your profile...';
          this._authService.loggedInUser.next(data);

          //set timeout to show loading message
          setTimeout(()=>{
              this._router.navigate(['./user']);
          }, 1000);
        }
        else{
          this.patchUserForm(user);
        }
      },
      error => {
        this.patchUserForm(user);
      });
  }

  patchUserForm(user) {
    this.googleSignupDetails = true;
    this.signupDetails.googleToken = user.id;
    this.signupDetails.email= user.email;
    this.signupDetails.photoUrl = user.photoUrl;

    this.form.patchValue({
      'token': user.id,
      'firstName': user.firstName,
      'lastName': user.lastName,
    })
  }

  submit() {
    this.signupLoadingMessage='Loading...';
    this.signupDetails.firstName = this.form.get('firstName').value;
    this.signupDetails.lastName = this.form.get('lastName').value;
    this.signupDetails.zipCode = this.form.get('zipCode').value;

    this._authService.userRegister(this.signupDetails).pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        this.signupLoadingMessage='You are registered successfully! <br> Redirecting to login...';
          setTimeout(()=>{
            this._router.navigate(['./auth/sign-in']);
        }, 1000);
      }
    )
  }

  initForm() {
    this.form = this._fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      zipCode: [null, Validators.required],
      token: [null, Validators.required]
    })
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
