import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from 'src/app/services/recipe.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { first, take, takeWhile, finalize } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { FollowService } from 'src/app/services/follow.service';
import { AngularFireStorage } from 'angularfire2/storage';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {

  editing = false;
  user: User;
  userId: string;
  isFollowing = null;
  isUserChecked = false;
  orderBy = 'published';
  loading = false;
  alive = true;
  file: any;
  image: '';

  constructor(
    private storage: AngularFireStorage,
    private route: ActivatedRoute,
    private router: Router,
    public recipeService: RecipeService,
    public auth: AuthService,
    public toastr: ToastrService,
    public userService: UserService,
    public followService: FollowService
  ) { }

  ngOnInit() {
    this.recipeService.init(this.orderBy, { path: 'recipes', reverse: false, prepend: false });
    
    this.route.params.subscribe(
      (params) => {
        this.userId = this.route.snapshot.paramMap.get('id');
        this.auth.user.pipe(first()).subscribe(value => {
          if (value) {
            this.checkIfAlreadyFollowed();
          }
        });
        this.getUser();
        this.getRecipes();
    });
    

  }


  getUser(): void {
    this.userService.getUser(this.userId).pipe(takeWhile(() => this.alive)).subscribe(value => {
      this.user = value;
    });
  }

  getRecipes() {
    this.recipeService.getRecipesOfUser('published', this.userId);
  }

  checkIfAlreadyFollowed() {
    this.followService.getFollowing(this.auth.currentUserId, this.userId).then(
      value => {
        this.isFollowing = value;
        this.isUserChecked = true;
      }
    );
  }

  changeOrderBy() {
    this.recipeService.getRecipesOfUser(this.orderBy, this.userId);
  }

  scrollHandler(e) {
    if (e === 'bottom') {
      this.recipeService.more(this.orderBy);
    }
  }

  follow() {
    this.loading = true;
    this.followService.follow(this.auth.currentUserId, this.userId).then( () => {
      this.loading = false;
      this.isFollowing = !this.isFollowing;
    });
  }

  unfollow() {
    this.loading = true;
    this.followService.unfollow(this.auth.currentUserId, this.userId).then( () => {
      this.loading = false;
      this.isFollowing = !this.isFollowing;
    });
  }

  edit() {
    this.editing = !this.editing;
    this.image = '';
  }

  updateProfile() {
    if ( this.file ) {
      const path = `users/${this.file.name}`;
      if (this.file.type.split('/')[0] !== 'image') {
        return alert('only image files');
      } else {
        const task = this.storage.upload(path, this.file);
        task.snapshotChanges().pipe(
          finalize(() => {
            const fileRef = this.storage.ref(path); // Add this line to get the path as a ref
            const downloadURL = fileRef.getDownloadURL();
            console.log('Image Uploaded!');
            downloadURL.subscribe(url => {
            this.user.image = url;
            this.userService.updateUser(this.userId, this.user).then(res => {
              this.editing = !this.editing;
              this.image = '';
                this.toastr.success('Profile successfully updated!');
              });
            });
          })
        ).subscribe();
      }
    } else {
      this.userService.updateUser(this.userId, this.user).then(res => {
        this.toastr.success('Profile successfully updated!');
      });
    }
  }

  ngOnDestroy(): void {
    this.alive = false;
    this.recipeService.reset();
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
          this.user.image = this.image;
        };
      }
    }
  }

}
