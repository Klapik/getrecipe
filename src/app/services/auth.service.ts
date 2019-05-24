import { Injectable } from '@angular/core';

import { AngularFireAuth } from 'angularfire2/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument
} from 'angularfire2/firestore';

import * as firebase from 'firebase/app';

import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  error: any;
  user: Observable<any>;
  userDetails: firebase.User = null;
  authState: any = null;


  constructor(private firebaseAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    public toastr: ToastrService) {

      this.user = this.firebaseAuth.authState
        .pipe(switchMap(user => {
          if (user) {
            this.userDetails = user;
            return this.afs.doc<any>(`users/${user.uid}`).valueChanges();
          } else {
            this.userDetails = null;
            return of(null);
          }
        }));
        this.user.subscribe( data => {
          this.authState = data;
        });

  }

  signup(email: string, password: string, username: string) {
    this.firebaseAuth
      .auth
      .createUserWithEmailAndPassword(email, password)
      .then(value => {
        console.log('Success!', value);
        this.setUserData(value.user, username);
        this.router.navigate(['']);
      })
      .catch(err => {
        this.toastr.error('Something went wrong: ' + err.message);
        console.log('Something went wrong:', err.message);
      });
  }

  login(email: string, password: string) {
    this.firebaseAuth
      .auth
      .signInWithEmailAndPassword(email, password).then(
        (success) => {
        this.router.navigate(['']);
      }).catch(
        (err) => {
        this.toastr.error('Something went wrong: ' + err.message);
        console.log('Something went wrong:', err.message);
        this.error = err;
      });
  }

  isLoggedIn() {
    if (this.userDetails == null ) {
        return false;
      } else {
        return true;
      }
    }

    setUserData(user, username) {
      // Sets user data to firestore on register
      const data: any = {
        uid: user.uid,
        name: username,
        posts: 0,
        followingCount: 0,
        followersCount: 0,
        description: '',
        image: ''
      };

      this.afs.doc<any>(`users/${user.uid}`).set(data);
    }

  logout() {
    this.firebaseAuth
      .auth
      .signOut().then(
        (success) => {
        this.router.navigate(['/login']);
      }).catch(
        (err) => {
        this.error = err;
      });
  }

  get authenticated(): boolean {
    return this.authState !== null;
  }


  get currentUserId(): string {
    return this.authenticated ? this.authState.uid : null;
  }

  get currentUserObservable(): any {
    return this.firebaseAuth.authState;
  }

}
