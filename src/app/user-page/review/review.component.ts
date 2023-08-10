import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { DataService } from 'src/app/shared/data.service';
import { Review } from 'src/app/shared/shared.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {

  
  public postReview: FormGroup;
  review: Review = new Review;
  productId: string;

  constructor(private dialog: MatDialog, private fb: FormBuilder, public _dataService: DataService, public _authService: AuthService, @Inject(MAT_DIALOG_DATA) data, private dialogRef: MatDialogRef<ReviewComponent>,){
    this.productId = data.productId;
    this.postReview = this.fb.group({
      feedbackMessage: new FormControl('', Validators.required),
      ratingValue: ['', Validators.required],
      
    });
  }

  ngOnInit(): void {
  }

  leaveReview() {
    this._authService.loggedInUser.subscribe(data => {
      this.review.memberId = data.memberId;
    })
    this.review.productId = this.productId;
    this.review.feedbackMessage = this.postReview.get('feedbackMessage').value;
    this.review.ratingValue = this.postReview.get('ratingValue').value;
    Swal.fire({
      title: 'Are you sure you want to leave this review?',
      showDenyButton: false,
      showCancelButton: true,
      denyButtonText: `Cancel`,
      confirmButtonText: 'Yes',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this._dataService.postFeedback(this.review).subscribe(
          data => {
            console.log(data)
            Swal.fire('Thank you for the review!', '', 'success');
            this.dialog.closeAll();
        })
      }
    })
  }

  closeDialog() {
    this.dialog.closeAll();
  }
}
