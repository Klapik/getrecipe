import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './home-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { AddRecipeComponent } from './pages/add-recipe/add-recipe.component';
import { SharedModule } from '../../shared/shared.module';
import { RecipeDetailComponent } from './pages/recipe-detail/recipe-detail.component';

@NgModule({
  imports: [
    CommonModule,
    routing,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [HomeComponent, AddRecipeComponent, RecipeDetailComponent]
})
export class HomeModule { }
