import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  model: any = {};
  loading = false;
  returnUrl: string;

  constructor(
      private authenticationService: AuthService) { }

  ngOnInit() {
  }

  signup() {
    this.authenticationService.signup(this.model.email, this.model.password, this.model.username);
  }
}
