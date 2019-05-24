import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './timeline-routing.module';
import { TimelineComponent } from './pages/timeline/timeline.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    routing,
    SharedModule
  ],
  declarations: [TimelineComponent]
})
export class TimelineModule { }
