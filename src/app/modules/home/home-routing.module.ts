import { HomeComponent } from './pages/home/home.component';
import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddRecipeComponent } from './pages/add-recipe/add-recipe.component';
import { RecipeDetailComponent } from './pages/recipe-detail/recipe-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'add-recipe', component: AddRecipeComponent},
  { path: 'recipe/:id', component: RecipeDetailComponent}
 ];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
