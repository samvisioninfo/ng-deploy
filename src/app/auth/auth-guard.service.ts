import { AuthService } from './auth.service';
import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of as observableOf, throwError, } from 'rxjs';
import {catchError, map, tap,  } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private router: Router, private _authService: AuthService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let accessToken = this._authService.checkLocalStorageAccessToken();
    if (accessToken) {
      if (this._authService.isAuthorized) {
        return true
      } else {
        return this._authService.authorizeUser(accessToken).pipe(map (data => {
          this._authService.isAuthorized = true;
          this._authService.loggedInUser.next(data);
          this._authService.storeAccessTokenToLocalStorage(data.accessToken);
          return true;
        }),
        catchError(this.handleErrorAuthorization))
      }
    } else {
      if (state.url === '/landing' || state.url.includes('/all-listings') || state.url.includes('/user/listing-details') || state.url.includes('/user/public-profile')) {
        return true
      } else {
        this.router.navigate(['auth/sign-up']);
        return false
      }
    }
  }

  handleError() {
    this.router.navigate(['auth/sign-up']);
    return throwError(() => new Error('Your error'));
  }

  handleErrorAuthorization(error: HttpErrorResponse) {
    return throwError('')
  }
}
