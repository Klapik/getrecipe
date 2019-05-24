import { Component, OnInit, OnDestroy } from '@angular/core';
import { RecipeService } from '../../../../services/recipe.service';
import { Recipe } from '../../../../models/recipe';   // Recipe interface class for Data types.
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, OnDestroy {

  orderBy = 'published';

  constructor(public recipeService: RecipeService, public auth: AuthService) {

    }

  ngOnInit() {
    this.auth.user.pipe(first()).subscribe(value => {
      if (value) {
        this.recipeService.init(this.orderBy, { path: `user-data/${this.auth.currentUserId}/timeline`, reverse: false, prepend: false });
      }
    });
  }

  scrollHandler(e) {
    if (e === 'bottom') {
        this.recipeService.more(this.orderBy);
    }
  }

  ngOnDestroy(): void {
    this.recipeService.reset();
  }

}
