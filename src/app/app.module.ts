import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AngularFirestoreModule, AngularFirestore } from 'angularfire2/firestore';
import { AngularFireModule } from 'angularfire2';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { HeaderComponent } from './components/header/header.component';
import { AngularFireAuth } from 'angularfire2/auth';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';  // Reactive Form Module
import { AngularFireStorage } from 'angularfire2/storage';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    ToastrModule.forRoot(), // ToastrModule added
    ReactiveFormsModule,
    BrowserAnimationsModule,
    SharedModule
  ],
  providers: [AngularFirestore, AngularFireAuth, AngularFireStorage],
  bootstrap: [AppComponent]
})
export class AppModule { }
