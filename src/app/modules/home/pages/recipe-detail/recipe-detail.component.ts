import { Component, OnInit } from '@angular/core';
import { Recipe } from 'src/app/models/recipe';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from 'src/app/services/recipe.service';
import { AuthService } from 'src/app/services/auth.service';
import { take, first } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Review } from 'src/app/models/review';
import { Observable } from 'rxjs';
import { RatingService } from 'src/app/services/rating.service';
import { ToastrService } from 'ngx-toastr'; // Alert message using NGX toastr

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent implements OnInit {

  post: Recipe;
  editing = false;
  public reviewFormGroup: FormGroup;
  reviews: Review[];
  productLoaded = false;
  ratings: Observable<any>;
  avgRating: Observable<any>;
  starList: string[] = [];
  isUserChecked = false;
  recipeId: string;
  isRated = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: RecipeService,
    public auth: AuthService,
    private ratingService: RatingService,
    private fb: FormBuilder,
    public toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.recipeId = this.route.snapshot.paramMap.get('id');
    this.auth.user.pipe(first()).subscribe(value => {
      this.isUserChecked = true;
      this.checkIfAlreadyRated();
    });
    this.getPost();
    this.getReviews();
    this.initializeForm();
  }


  getPost(): void {
    this.postService.getRecipeData(this.recipeId).pipe(take(1)).subscribe(post => {
      this.post = post;
      let i = 5;
      for (i = 5; i >= 1; i--) {
        if (i <= this.post.avgRating) {
          this.starList.push('full-star-checked');
        } else if (i <= this.post.avgRating + 0.5) {
          this.starList.push('half-star-checked');
        } else {
          this.starList.push('star-empty');
        }
      }
    });
  }

  getReviews() {
    this.ratingService.getRecipeReviews(this.recipeId).subscribe((data) => {
      this.reviews = data;
    });
  }

  initializeForm() {
    this.reviewFormGroup = this.fb.group({
      author: [''],
      published: [''],
      review: ['', Validators.required],
      userId: [''],
      recipeId: ['']
    });
  }

  postReview() {
    this.reviewFormGroup.patchValue({
      'userId': this.auth.currentUserId, 'published': new Date(),
      'author': this.auth.authState.name, 'recipeId': this.recipeId
    });

    const body: Review = this.reviewFormGroup.value;
    this.ratingService.postReview(body).then(res => {
      this.toastr.success('Review successfully added!');
      this.initializeForm();  // Reset form when clicked on reset button
    });
  }

  updatePost() {
    const formData = {
      title: this.post.title,
      content: this.post.description
    };
    this.postService.update(this.recipeId, formData);
    this.editing = false;
  }

  delete() {
    this.postService.delete(this.recipeId, this.post.userId).then( x => {
      this.toastr.success('Recipe successfully deleted!');
      this.postService.reset().then( () => {
        this.router.navigate(['']);
      });
    });
  }

  starHandler(value) {
    this.ratingService.postRating({
      userId: this.auth.currentUserId,
      ratingValue: value,
      recipeId: this.recipeId
    }).then(() => {
      this.getPost();
      this.starList = [];
    });
    this.isRated = true;
    // Math.round(rating * 2) / 2).toFixed(1);
  }

  checkIfAlreadyRated() {
    this.ratingService.isRated(this.recipeId, this.auth.currentUserId).then(
      value => {
        this.isRated = value;
      }
    );
  }

}
