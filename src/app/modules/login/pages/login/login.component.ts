import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  model: any = {};
  loading = false;
  returnUrl: string;

  constructor(
      private authenticationService: AuthService) { }

  ngOnInit() {
  }

  login() {
    this.authenticationService.login(this.model.username, this.model.password);
  }

  logout() {
    this.authenticationService.logout();
  }

}
