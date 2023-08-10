import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UserPageRoutingModule } from './user-page-routing.module';
import { ListingDetailsComponent } from './listing-details/listing-details.component';
import { CarouselComponent } from './carousel/carousel.component';
import { SharedModule } from '../shared/shared.module';
import { CreateListingComponent } from './create-listing/create-listing.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { RouterModule } from '@angular/router';
import { ReviewComponent } from './review/review.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@NgModule({
  declarations: [
    ListingDetailsComponent,
    CarouselComponent,
    CreateListingComponent,
    EditProfileComponent,
    ReviewComponent
  ],
  imports: [CommonModule, UserPageRoutingModule, SharedModule, RouterModule, CKEditorModule ],
  providers: [DatePipe]
})
export class UserPageModule {}
