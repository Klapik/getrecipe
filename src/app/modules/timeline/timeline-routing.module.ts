import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TimelineComponent } from './pages/timeline/timeline.component';


export const routes: Routes = [
  { path: '', component: TimelineComponent }
 ];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
