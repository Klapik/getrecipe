import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../../../../services/recipe.service';    // CRUD services API
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms'; // Reactive form services
import { ToastrService } from 'ngx-toastr'; // Alert message using NGX toastr
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.scss'],
  animations: [
    trigger('items', [
      transition(':enter', [
        style({
          transform: 'scale(0.5)', opacity: 0,
          height: '0px', margin: '0px', padding: '0px'
        }),  // initial
        animate('0.2s ease-in-out',
          style({
            transform: 'scale(1)', opacity: 1,
            height: '*', padding: '*', margin: '*'
          }))  // final
      ]),
      transition(':leave', [
        style({
          transform: 'scale(1)', opacity: 1,
          height: '*', margin: '*', padding: '*'
        }),
        animate('0.2s ease-in-out',
          style({
            transform: 'scale(0.5)', opacity: 0,
            height: '0px', margin: '0px', padding: '0px'
          }))
      ])
    ])
  ]
})
export class AddRecipeComponent implements OnInit {
  public recipeForm: FormGroup;  // Define FormGroup to recipe's form
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  image: string;
  file: any;


  constructor(
    private storage: AngularFireStorage,
    private auth: AuthService,
    public crudApi: RecipeService,  // CRUD API services
    public fb: FormBuilder,       // Form Builder service for Reactive forms
    public toastr: ToastrService,
    private router: Router  // Toastr service for alert message
  ) { }

  ngOnInit() {
    this.recipeeForm();              // Call recipe form when component is ready
  }

  // Reactive recipe form
  recipeeForm() {
    this.recipeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      ingredients: this.fb.array([]),
      steps: this.fb.array([]),
      published: [],
      userId: [''],
      description: [''],
      time: [''],
      image: [''],
      author: [''],
      nameToSearch: [''],
      avgRating: [0],
      category: ['Breakfast'],
      ingredientsNames: this.fb.array([]),
      qtyRating: [0],
      sumRating: [0]
    });
  }

  get ingredientForms() {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  addIngredient() {

    const ingredient = this.fb.group({
      name: ['', Validators.required],
      quantity: ['', Validators.required],
      unit: [''],
    });

    this.ingredientForms.push(ingredient);
  }

  deleteIngredient(i) {
    this.ingredientForms.removeAt(i);
  }

  get stepForms() {
    return this.recipeForm.get('steps') as FormArray;
  }

  get ingredientNamesForms() {
    return this.recipeForm.get('ingredientsNames') as FormArray;
  }

  addStep() {

    const step = this.fb.group({
      description: ['', Validators.required]
    });

    this.stepForms.push(step);
  }

  deleteStep(i) {
    this.stepForms.removeAt(i);
  }

  // Reset recipe form's values
  ResetForm() {
    this.recipeForm.reset();
    this.image = null;
  }

  createRecipe() {
    const array = new Array();

    this.recipeForm.value.ingredients.forEach(function (value) {
      array.push(value.name.toLowerCase());
    });
    while (this.ingredientNamesForms.length < array.length) {
      this.ingredientNamesForms.push(new FormControl());
    }

    this.recipeForm.patchValue({
      'userId': this.auth.currentUserId, 'published': new Date(),
      'author': this.auth.authState.name, 'nameToSearch': this.recipeForm.value.title.toLowerCase(),
      'ingredientsNames': array
    });

    const path = `recipes/${this.file.name}`;
    if (this.file.type.split('/')[0] !== 'image') {
      return alert('only image files');
    } else {
      const task = this.storage.upload(path, this.file);
      this.uploadPercent = task.percentageChanges();
      task.snapshotChanges().pipe(
        finalize(() => {
          const fileRef = this.storage.ref(path); // Add this line to get the path as a ref
          this.downloadURL = fileRef.getDownloadURL();
          console.log('Image Uploaded!');
          this.downloadURL.subscribe(url => {
          this.image = url;
            this.recipeForm.patchValue({ 'image': url });
            this.crudApi.create(this.recipeForm.value, this.auth.currentUserId).then(res => {
              this.toastr.success(this.recipeForm.controls['title'].value + ' successfully added!');
              this.ResetForm();  // Reset form when clicked on reset button
              this.router.navigate(['/home']);
            }); // Submit recipe data using CRUD API
          });
        })
      ).subscribe();

    }
  }

  onFileChanged(event) {
    const file = event.target.files[0];
    if (file.type.split('/')[0] !== 'image') {
      return alert('only image files');
    } else {
      if (event.target.files && event.target.files[0]) {
        this.file = file;
        const reader = new FileReader();

        reader.readAsDataURL(event.target.files[0]); // read file as data url

        reader.onload = (e: any) => { // called once readAsDataURL is completed
          this.image = e.target.result;
        };
      }
    }
  }


}
