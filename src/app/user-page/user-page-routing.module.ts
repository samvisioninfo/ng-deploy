import { AuthGuardService } from './../auth/auth-guard.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateListingComponent } from './create-listing/create-listing.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ListingDetailsComponent } from './listing-details/listing-details.component';
import { UserPageComponent } from './user-page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'public-profile',
    pathMatch: 'full'
  },
  {
    path: 'public-profile',
    component: UserPageComponent,
    children: [

    ]
  },
  {
    path: 'create-listing',
    component: CreateListingComponent
  },
  {
    path: 'listing-details',
    component: ListingDetailsComponent
  },
  {
    path: 'edit-profile',
    component: EditProfileComponent
  },
  {
    path: '**',
    redirectTo: '',
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserPageRoutingModule {}
