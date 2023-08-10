import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms'
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Profile } from 'src/app/app.model';
import { AuthService } from 'src/app/auth/auth.service';
import { DataService } from 'src/app/shared/data.service';
import Swal from 'sweetalert2';
import {Location} from '@angular/common';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit, OnDestroy {

 imgPreviewSrc: any;
 isImgSelected: boolean = false;
 profileForm: FormGroup;
 profileObj: Profile = new Profile;
 photos = [];
 showSpinner = true;
 private _unsubscribeAll: Subject<void> = new Subject();

  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    public _dataService: DataService,
    private _authService: AuthService,
    private _location: Location) {
    this.initFormGroup();
   }

  ngOnInit(): void {
    this._authService.loggedInUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        if (data) {
          this.profileObj = data;
          this.patchFormData();
          this.getUserDetails();
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

  patchFormData(){
    this.profileForm.patchValue({
      memberId: this.profileObj.memberId,
      firstName: this.profileObj.firstName,
      lastName: this.profileObj.lastName,
      email: this.profileObj.email,
      zipCode: this.profileObj.zipCode,
      addressName: this.profileObj.addressName,
      description: this.profileObj.description,
      images: this.profileObj.images,
      googleToken: this.profileObj.googleToken,
    });
    this.imgPreviewSrc = this.profileObj.memberAvatar;
    this.isImgSelected = true;
    this.photos = this.profileObj.images;
  }

  getUserDetails() {
    this._dataService.getUserDetails(this.profileObj.memberId).subscribe(
      (data: Profile) => {
        this.profileObj = data;
        this.profileObj.images = this.profileObj.images ? JSON.parse(this.profileObj.images) : [];
        this.patchFormData();
      }
    )
  }

  showAvatar(event) {
    if (event.target.files.length > 0) {
      const file: File = (
        (event.target as HTMLInputElement).files as FileList
      )[0];

      let form_data: FormData = new FormData();
      form_data.append('file', file, file.name);

      this._dataService
        .mediaImage(form_data)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(
          (data: any) => {
            if (data && data.response) {
              this.imgPreviewSrc = data.response;
              this.isImgSelected = true
              event.target.value = null;
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again',
                showConfirmButton: false,
                timer: 2000,
                willClose: () => {
                  event.target.value = null;
                },
              });
            }
          },
          () => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Something went wrong! Please try again',
              showConfirmButton: false,
              timer: 2000,
              willClose: () => {
                event.target.value = null;
              },
            });
          }
        );
    }
  }

  onFileChange(event) {
    if (event.target.files && event.target.files[0]) {
        var filesAmount = event.target.files.length;
        for (let i = 0; i < filesAmount; i++) {
                var reader = new FileReader();

                reader.onload = (event:any) => {
                   this.photos.push(event.target.result);
                }

                reader.readAsDataURL(event.target.files[i]);
        }
    }
  }

  uploadImage(event: any) {
    if (event.target.files.length > 0) {
      const file: File = (
        (event.target as HTMLInputElement).files as FileList
      )[0];

      let form_data: FormData = new FormData();
      form_data.append('file', file, file.name);

      this._dataService
        .mediaImage(form_data)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(
          (data: any) => {
            if (data && data.response) {
              this.photos.push(data.response);
              event.target.value = null;
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again',
                showConfirmButton: false,
                timer: 2000,
                willClose: () => {
                  event.target.value = null;
                },
              });
            }
          },
          () => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Something went wrong! Please try again',
              showConfirmButton: false,
              timer: 2000,
              willClose: () => {
                event.target.value = null;
              },
            });
          }
        );
    }
  }

  initFormGroup() {
    this.profileForm = this._formBuilder.group({
      firstName: new FormControl ('', Validators.required),
      lastName: new FormControl ('', Validators.required),
      zipCode: new FormControl ('', Validators.required),
      description: new FormControl (''),
      images: new FormControl (''),
      googleToken: new FormControl (''),
      });

    }

    saveChanges() {
      this._authService.loggedInUser.subscribe(data => {
        this.profileObj.email = data.email;
      });

      this.profileObj.memberId = this.profileObj.memberId;
      this.profileObj.firstName = this.profileForm.get('firstName').value;
      this.profileObj.lastName = this.profileForm.get('lastName').value;
      this.profileObj.zipCode = this.profileForm.get('zipCode').value;
      this.profileObj.addressName = this.profileObj.addressName ? this.profileObj.addressName : 'Blagoj Gjorev 89';
      this.profileObj.description = this.profileForm.get('description').value;
      this.profileObj.images = this.photos.length > 0 ? JSON.stringify(this.photos) : null;
      this.profileObj.googleToken = this.profileObj.googleToken;
      this.profileObj.memberAvatar = this.imgPreviewSrc;

      this._dataService.updateUserDetails(this.profileObj).subscribe(
        data => {
          Swal.fire({
            icon: 'success',
            title: 'Profile was succefully updated!',
            showConfirmButton: false,
            timer: 2000,
            willClose: () => {
              let accessToken = this._authService.checkLocalStorageAccessToken();
              if (accessToken) {
                this._authService.authorizeUser(accessToken).subscribe(
                  data => {
                    this._authService.loggedInUser.next(data);
                    this._authService.storeAccessTokenToLocalStorage(data.accessToken);
                    this._router.navigate(['/user']);
                  }
                )
              }
            },
          });
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

    removeSelectedFile(index) {
      this.photos.splice(index, 1);
  }

  goBack() {
    this._location.back();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
