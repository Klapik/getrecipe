import { Component, OnInit, OnDestroy } from '@angular/core';
import { RecipeService } from '../../../../services/recipe.service';
import { Recipe } from '../../../../models/recipe';   // Recipe interface class for Data types.
import { ToastrService } from 'ngx-toastr';      // Alert message using NGX toastr
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, Validators, FormArray, FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  public filterForm: FormGroup;  // Define FormGroup to recipe's form
  posts: Observable<Recipe[]>;
  orderBy = 'published';
  searchValue = '';
  ingredientValue = '';
  lastSearch = '';

  constructor(public recipeService: RecipeService, public auth: AuthService,
    public fb: FormBuilder,
    public toastr: ToastrService) {

    }

  ngOnInit() {
    this.recipeService.init(this.orderBy, { reverse: false, prepend: false });
    this.createFilterForm();
    this.recipeService.filter(this.orderBy, this.filterForm.value);
  }

  // Reactive recipe form
  createFilterForm() {
    this.filterForm = this.fb.group({
      ingredients: this.fb.array([]),
      searchValue: [''],
      category: ['']
    });
  }

  get ingredientForms() {
    return this.filterForm.get('ingredients') as FormArray;
  }

  addIngredient() {
    const ingredient =  new FormControl();
    ingredient.setValue(this.ingredientValue.toLowerCase());
    this.ingredientForms.push(ingredient);
  }

  deleteIngredient(i) {
    this.ingredientForms.removeAt(i);
  }

  changeOrderBy() {
      this.recipeService.filter(this.orderBy, this.filterForm.value);
  }

  searchByName() {
    this.lastSearch = 'byName';
    if (this.searchValue) {
      this.recipeService.searchRecipes(this.orderBy, this.searchValue.toLowerCase());
    } else {
      this.recipeService.getRecipes(this.orderBy);
    }
  }

  filter() {
    this.lastSearch = 'byFilter';
    this.recipeService.filter(this.orderBy, this.filterForm.value);
  }

  scrollHandler(e) {
    if (e === 'bottom') {
        this.recipeService.moreFilteredRecipes(this.orderBy, this.filterForm.value);
    }

    // if (e === 'top') {
    //   this.page.more()
    // }
  }

  ngOnDestroy(): void {
    this.recipeService.reset();
  }

}
