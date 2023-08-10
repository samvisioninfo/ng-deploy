import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllListingsComponent } from './all-listings/all-listings.component';
import { AuthGuardService } from './auth/auth-guard.service';
import { LandingComponent } from './landing/landing.component';
import { HomepageResolver } from './resolvers/homepage.resolver';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    component: LandingComponent,
    resolve: {'itemsList': HomepageResolver},
    // canActivate: [AuthGuardService]
    //resolve: {'productList': HomepageResolver}
  },
  {
    path: 'all-listings',
    component: AllListingsComponent,
    // canActivate: [AuthGuardService]
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./user-page/user-page.module').then(
        (m) => m.UserPageModule
      ),
    // canActivate: [AuthGuardService]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
