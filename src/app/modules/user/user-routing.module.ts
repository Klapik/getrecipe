import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserComponent } from './pages/user/user.component';


export const routes: Routes = [
  { path: ':id', component: UserComponent }
 ];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
