import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from '@abacritt/angularx-social-login';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './landing/landing.component';
import { SharedModule } from './shared/shared.module';
import { UserPageComponent } from './user-page/user-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { HeaderComponent } from './header/header.component';
import { NgxGalleryModule } from '@kolkov/ngx-gallery';
import { FooterComponent } from './footer/footer.component';
import { AllListingsComponent } from './all-listings/all-listings.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { SplashComponent } from './shared/splash/splash.component';
import { SplashScreenStateService } from './shared/splash/splash-screen-state.service';
import { HomepageResolver } from './resolvers/homepage.resolver';

@NgModule({
  declarations: [AppComponent, LandingComponent, UserPageComponent, SignUpComponent, SignInComponent, HeaderComponent, FooterComponent, AllListingsComponent,SplashComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocialLoginModule,
    CommonModule,
    SharedModule,
    BrowserAnimationsModule,
    NgxGalleryModule,
    NgxSliderModule,
  ],
  providers: [{
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: false,
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          //provider: new GoogleLoginProvider('528961187921-ld24b25466u4t2lacn9r35asg000lfis.apps.googleusercontent.com')
          provider: new GoogleLoginProvider('263732112184-kgemu4kfgubd2kocahg0ookgqrdf3du2.apps.googleusercontent.com')
        }
      ]
    } as SocialAuthServiceConfig,
  },
  SplashScreenStateService,
  HomepageResolver
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
