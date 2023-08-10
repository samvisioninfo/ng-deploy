import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { DataToCropperDialog, DialogAfterCloseData, ImageCropperDialogCloseData, MediaBlobImage, MediaBlobImageObject,} from '../shared.model';
import { DataService } from '../data.service';



@Component({
  selector: 'app-image-cropper-dialog',
  templateUrl: './image-cropper-dialog.component.html',
  styleUrls: ['./image-cropper-dialog.component.scss']
})
export class ImageCropperDialogComponent implements OnInit, OnDestroy {

  /**
    * Public Variables
    */
  imageChangedEvent: any = null;
  cropped_image: any = null;
  is_loading_results: boolean = false;
  aspect_ratio: number = null;
  main_tain_aspect_ratio: boolean = null;
  resize_to_width: number = null;
  resize_to_height: number = null;
  round_cropper: boolean = false;



  /**
    * Private Variables
    */
  private _unsubscribeAll: Subject<void> = new Subject<void>();

  /**
    * Constructor
    *
    * @param { MatDialogRef } _matDialogRef
    * @param { MAT_DIALOG_DATA } _event
    * @param { DataService } _dataService
    *
    */
  constructor(public _matDialogRef: MatDialogRef<ImageCropperDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: DataToCropperDialog,
    private _dataService: DataService) {
    this.checkFileType();
    this.is_loading_results = true;
    this.imageChangedEvent = this._data.event;
    this.aspect_ratio = this._data.aspect_ratio;
    this.main_tain_aspect_ratio = this._data.main_tain_aspect_ratio
    this.resize_to_width = this._data.resize_to_width;
    this.resize_to_height = this._data.resize_to_height;
    this.round_cropper = this._data.round_cropper;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
    * On init
    */
  ngOnInit(): void { }

  /**
    * On destroy
    */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this.is_loading_results = false;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
    * Function for Checking if the File Type is NOT Image to Close the Dialog
    */
  private checkFileType() {
    if (!this._data.event.target ||
      !this._data.event.target.files ||
      !this._data.event.target.files[0] ||
      !this._data.event.target.files[0].type.includes('image') ||
      this._data.event.target.files[0].type.includes('svg')) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'The selected file is not image!',
        showConfirmButton: false,
        timer: 2000,
        willClose: () => {
          this.is_loading_results = false;
          this._matDialogRef.close({ result: false, data: null });
        }
      });
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
    * Image Cropped Event
    */
  imageCropped(event: ImageCroppedEvent) {
    this.cropped_image = event.base64;
    this.is_loading_results = false;
  }

  /**
    * Function for saving image
    */
  saveImage() {
    this.is_loading_results = true;
    let image: MediaBlobImage = new MediaBlobImage();

    image.blobname = this._data.blobname;
    image.bytedata = (<string>this.cropped_image).split(",", 2)[1];
    image.needresize = this._data.need_resize;
    image.name = this._data.event.target.files[0].name;
    image.type = this._data.event.target.files[0].type;
    this._dataService.UploadMediaBlobImage(image).pipe(takeUntil(this._unsubscribeAll)).subscribe(
      (data: MediaBlobImageObject) => {
        Swal.fire({
          icon: 'success',
          title: 'Image was uploaded!',
          showConfirmButton: false,
          timer: 3000,
          willClose: () => {
            let image_data: ImageCropperDialogCloseData = new ImageCropperDialogCloseData();
            image_data.image_url = data.docurl;
            image_data.resized_image_url = data.resizedurl;

            let data_for_closing: DialogAfterCloseData = new DialogAfterCloseData();
            data_for_closing.result = true;
            data_for_closing.data = image_data;

            this._matDialogRef.close(data_for_closing)
            this.is_loading_results = false;
          }
        });
      },
      () => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
          showConfirmButton: false,
          timer: 2000,
          willClose: () => {
            this.is_loading_results = false;
          }
        });
      }
    );
  }
  
  /**
    * Function for Closing Dialog
    */
  closeDialog(){
    this._matDialogRef.close(new DialogAfterCloseData());
  }

}
