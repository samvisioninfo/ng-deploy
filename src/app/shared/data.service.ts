import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Product, Review, LookupEntry, ProductListEntry, Sale, allProductsFilter, allProductsEntry, ProductCategory, ChatMessageObj, ChatMessage, ChatSidebar, MediaBlobImageObject, MediaBlobImage, ProductUpdateStatus } from './shared.model';
import { Profile } from '../app.model';
import { BehaviorSubject, catchError, map, Observable, Subject, takeUntil, throwError } from 'rxjs';
import { APIResponse } from '../auth/auth.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  API_URL=environment.API_BASE_URL;

  private header_token: HttpHeaders = this._authService.tokenHeader();
  refreshUProfileProducts: Subject<void> = new Subject();
  toggleChatPanel: BehaviorSubject<ChatSidebar> = new BehaviorSubject(null);
  switchToOwnerAccount: Subject<void> = new Subject();

  constructor(private httpClient: HttpClient,
    private _authService : AuthService) {
      this._authService.tokenBSubject.subscribe(
        data => {
          this.header_token = this._authService.tokenHeader();
        }
      )
     }

// USER REQUESTS
  getUserDetails(memberId: string) {
    return this.httpClient.get(`${this.API_URL}user/details/by/id?memberId=${encodeURIComponent(memberId)}`).pipe(
      map((data: APIResponse<Profile>) => data.response),
      catchError(this.handleError)
      );
  }

  updateUserDetails(obj: Profile) {
    return this.httpClient.put<Profile>(`${this.API_URL}user/update`, obj, {headers: this.header_token})
  }

  createProduct(obj: Product) {
    return this.httpClient.post<Product>(`${this.API_URL}product/create`, obj, {headers: this.header_token});
  }

  updateProduct(obj: Product) {
    return this.httpClient.put<Product>(`${this.API_URL}product/update`, obj, {headers: this.header_token});
  }

  deleteProduct(productId: string) {
    return this.httpClient.delete<Product>(`${this.API_URL}product/delete?productId=${encodeURIComponent(productId)}`, {headers: this.header_token});
  }

  getUserPurchases() {
      return this.httpClient.get(`${this.API_URL}user/my/purchases`, {headers: this.header_token});
  }

  getProductDetails(productId: string) {
    return this.httpClient.get(`${this.API_URL}product/details/by/id?productId=${encodeURIComponent(productId)}`).pipe(
      map((data: APIResponse<Product>) => data.response),
      catchError(this.handleError)
      );
  }

  getProductList(memberid: string) {
    return this.httpClient.get(`${this.API_URL}product/list/by/memberid?memberId=${encodeURIComponent(memberid)}`).pipe(
      map((data: APIResponse<Array<ProductListEntry>>) => data.response),
      catchError(this.handleError)
    );
  }

  getProductListLandingLatest() {
    return this.httpClient.get(`${this.API_URL}product/list/landing`).pipe(
      map((data: APIResponse<Array<Product>>) => data.response),
      catchError(this.handleError)
    );
  }

  getProductCategoriesLanding() {
    return this.httpClient.get(`${this.API_URL}product/categories/landing`).pipe(
      map((data: APIResponse<Array<ProductCategory>>) => data.response),
      catchError(this.handleError)
    );
  }

  // PRODUCT FEEDBACK REQUESTS
  postFeedback(obj: Review) {
    return this.httpClient.post<Review>(`${this.API_URL}product/feedback/create`, obj, {headers: this.header_token});
  }

  getFeedback(memberId: string) {
    return this.httpClient.get(`${this.API_URL}product/feedback/list/by/memberid?memberId=${encodeURIComponent(memberId)}`, {headers: this.header_token})
  }

  // SALE REQUEST
  createSale(obj: Sale) {
    return this.httpClient.post<Sale>(`${this.API_URL}sale/create`, obj, {headers: this.header_token});
  }

  public mediaImage(form_data: FormData): Observable<string> {
		return this.httpClient.post<string>(`${this.API_URL}media/image/upload`, form_data).pipe();
	}

    /**
    * Post cropped image
    * 
    *  @param { MediaImage } image
    * 
    */
    public UploadMediaBlobImage(image: MediaBlobImage): Observable<MediaBlobImageObject> {
      return this.httpClient.post<APIResponse<MediaBlobImageObject>>(`${this.API_URL}media/blob/image`, image).pipe(
        map((data: APIResponse<MediaBlobImageObject>) => data.response),
        catchError(this.handleError)
      );
    }

  getListingLookups(type: string) {
    return this.httpClient.get(`${this.API_URL}lookup/list?programeCode=${encodeURIComponent(type)}`).pipe(
      map((data: APIResponse<Array<LookupEntry>>) => data.response),
      catchError(this.handleError)
      );
  }

  getCoralSpeciesLookup(groupId: string) {
    let url = groupId ? `${this.API_URL}lookup/coral/species/list?value=${encodeURIComponent(groupId)}` : `${this.API_URL}lookup/coral/species/list`;
    return this.httpClient.get(url).pipe(
      map((data: APIResponse<Array<LookupEntry>>) => data.response),
      catchError(this.handleError)
      );
  }

  getAllListingProducts(obj: allProductsFilter) {
    return this.httpClient.post(`${this.API_URL}product/filter`, obj).pipe(
      map((data: APIResponse<any>) => data.response),
      catchError(this.handleError)
    );
  }

  getProductChatMessageList(productId: string) {
    return this.httpClient.get(`${this.API_URL}message/comunication/list/by/product?productId=${encodeURIComponent(productId)}`, {headers: this.header_token}).pipe(
      map((data: APIResponse<any>) => data.response),
      catchError(this.handleError)
    );
  }

  createProductMessage(obj: ChatMessageObj) {
    return this.httpClient.post(`${this.API_URL}message/comunication/create`, obj, {headers: this.header_token}).pipe(
      map((data: APIResponse<any>) => data.response),
      catchError(this.handleError)
    );
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

  ProductUpdateStatus(obj: ProductUpdateStatus) {
    return this.httpClient.put<ProductUpdateStatus>(`${this.API_URL}product/update/status`, obj, {headers: this.header_token});
  }
}
