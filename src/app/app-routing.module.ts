import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
    { path: 'login', loadChildren: './modules/login/login.module#LoginModule' },
    { path: '', loadChildren: './modules/home/home.module#HomeModule' },
    { path: 'register', loadChildren: './modules/register/register.module#RegisterModule' },
    { path: 'user', loadChildren: './modules/user/user.module#UserModule' },
    { path: 'timeline', loadChildren: './modules/timeline/timeline.module#TimelineModule', canActivate: [AuthGuard] },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
