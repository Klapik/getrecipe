import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isMenu = false;

  constructor(private authService: AuthService,
    private router: Router,
    public afAuth: AngularFireAuth) { }

  ngOnInit() {
    this.authService.user.pipe(first()).subscribe(value => {
      this.isMenu = true;
    });
  }

  public logout() {
    this.authService.logout();
  }

  public login() {
    this.router.navigate(['/login']);
  }

  public register() {
    this.router.navigate(['/register']);
  }

  // public profile() {
  //   this.router.navigate(['/user/' + this.authService.currentUserId]);
  //   window.location.reload();
  // }

}
