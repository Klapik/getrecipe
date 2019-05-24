import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './user-routing.module';
import { UserComponent } from './pages/user/user.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    routing,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [UserComponent]
})
export class UserModule { }
