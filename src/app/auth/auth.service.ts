import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { APIResponse, AuthenticateRequest, loginResponse, registerObj } from './auth.model';
import { environment } from 'src/environments/environment';
import { Profile } from '../app.model';
import { SocialAuthService } from 'angularx-social-login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  API_URL = environment.API_BASE_URL;
  userDetails: Profile;
  isAuthorized: boolean;

  loggedInUser: BehaviorSubject<loginResponse> = new BehaviorSubject(null);
  tokenBSubject: BehaviorSubject<string> = new BehaviorSubject(null);
  constructor(
    private httpClient: HttpClient,
    private _router: Router
  ) { }

  // Login
  getPublicKey(): Observable<loginResponse> {
    return this.httpClient.get<APIResponse<loginResponse>>(`https://api.npoint.io/2b549890e0319ac56908`).pipe(
      map((data: APIResponse<loginResponse>) => data.response),
      catchError(this.handleError)
      );
  }

  userLogin(googleToken: any) {
    return this.httpClient.get<APIResponse<loginResponse>>(this.API_URL + `user/login?token=` + googleToken).pipe(
      map((data: APIResponse<loginResponse>) => data.response),
      catchError(this.handleError)
      );
  }

  userRegister(obj: registerObj) {
    return this.httpClient.post<APIResponse<loginResponse>>(this.API_URL + `user/signup`, obj).pipe(
      map((data: APIResponse<loginResponse>) => data.response),
      catchError(this.handleError)
      );
  }

  // LogOut User
  logOut() {
    //this.socialAuthService.signOut();

    localStorage.removeItem('aquarium-user');
    localStorage.removeItem('aquarium-user-token');
    this.loggedInUser.next(null);
    this._router.navigate(['./landing'])
  }

  // Authorize
  public authorizeUser(AccessToken: string): Observable<any> {
    let header = new HttpHeaders({
      'accept': 'application/json',
      "Authorization": AccessToken
    });
    return this.httpClient.get<APIResponse<any>>(this.API_URL + `user/authorize`, {headers: header}).pipe(
      map((data: APIResponse<any>) => {data.response; return data.response}, this));
  }

  // Authenticate
  public AuthenticateUser(authReq: AuthenticateRequest): Observable<any> {

    return this.httpClient.post<APIResponse<string>>(this.API_URL + `user/authenticate`, authReq).pipe(
      map((data: APIResponse<string>) => data.response),
      catchError(this.handleError)
      );
  }


  storeAccessTokenToLocalStorage(token: string){
    if (token) {
      localStorage.setItem('aquarium-user-token', token);
      this.tokenBSubject.next(token);
    }
  }

  // Save User data in LocalStorage
  storeDataToLocalStorage(data: loginResponse) {
    localStorage.setItem('aquarium-user', JSON.stringify(data));
  }

  // Check AccessToken
  checkLocalStorageAccessToken() {
    let token = localStorage.getItem('aquarium-user-token');
    return token && token != '' ? token : null;
  }

  // Check LocalStorage
  checkLocalStorageUserData() {
    let user = localStorage.getItem('aquarium-user');
    if (user) {
      return JSON.parse(user);
    } else {
      return null;
    }
  }

  // Store User Details
  storeUserDetails(data: Profile) {
    this.userDetails = data;
  }

  // Get User Details
  getUserDetails() {
    return this.userDetails;
  }

  /**
   * Function to return token header
   */
  tokenHeader() {
    let accessToken = localStorage.getItem('aquarium-user-token');
    if (typeof accessToken !== 'undefined' && accessToken !== '') {
      let header = new HttpHeaders({
        'accept': 'application/json',
        "Authorization": accessToken
      });
      return header;
    }
    return new HttpHeaders();
  }

  /**
  * Function to handle error when the server return an error
  *
  * @param { HttpErrorResponse } error
  *
  */
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error("An error occurred:", error.error.message);
    } else {
      // The backend returned an unsuccessful response code. The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // return an observable with a user-facing error message
    return throwError(error);
  }

  private handleErrorAuthorization(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}
