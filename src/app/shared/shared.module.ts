import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingComponent } from './components/loading/loading.component';
import { ScrollableDirective } from './components/scrollable.directive';

@NgModule({
  imports: [CommonModule, FormsModule, MaterialModule, RouterModule, ReactiveFormsModule],
  declarations: [LoadingComponent, ScrollableDirective],
  exports: [CommonModule, FormsModule, MaterialModule, RouterModule, ReactiveFormsModule, LoadingComponent, ScrollableDirective],
})
export class SharedModule {}
