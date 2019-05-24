import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './pages/register/register.component';


export const routes: Routes = [
  { path: '', component: RegisterComponent }
 ];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
