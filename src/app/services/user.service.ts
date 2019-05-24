import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private afs: AngularFirestore) { }

  getUser(id: string) {
    return this.afs.doc<any>(`users/${id}`).valueChanges();
  }

  updateUser(id: string, body) {
    return this.afs.doc<any>(`users/${id}`).update(body);
  }
}
