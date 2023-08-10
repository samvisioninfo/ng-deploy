import { AuthService } from './../auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { loginResponse } from '../auth/auth.model';
import { DataService } from '../shared/data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  activeUser: loginResponse = new loginResponse();

  constructor(
    private _authService: AuthService,
    private _dataService: DataService
    ) {
  }

  ngOnInit(): void {
    // Login response
    this._authService.loggedInUser.subscribe(
    (data: loginResponse) => {
      this.activeUser = data;
    });
  }

  logOut(){
    this._authService.logOut();
  }

  showMyAccount() {
    this._dataService.switchToOwnerAccount.next();
  }

}
