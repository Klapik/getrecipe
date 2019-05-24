import { Injectable } from '@angular/core';
import { Recipe } from '../models/recipe';  // Recipe data type interface class
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument
} from 'angularfire2/firestore';
import { map, filter, scan, tap, take, takeWhile } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

import * as algoliasearch from 'algoliasearch';



// Options to reproduce firestore queries consistently
interface QueryConfig {
  path: 'recipes'; // path to collection
  limit?: number; // limit per query
  reverse?: boolean; // reverse order?
  prepend?: boolean; // prepend to source?
  offset?: number;
}

@Injectable({
  providedIn: 'root'
})

export class RecipeService {
  recipesCollection: AngularFirestoreCollection<Recipe>;
  recipeDoc: AngularFirestoreDocument<Recipe>;
  orderBy = 'published';
  mainQuery: firebase.firestore.Query;

  // Source data
  private _done = new BehaviorSubject(false);
  private _loading = new BehaviorSubject(false);
  private _data = new BehaviorSubject([]);
  private subscription;

  // Initialize the Algolia Client
  client = algoliasearch('', '');
  index: any;
  replicaIndex: any;

  private query: QueryConfig;

  // Observable data
  data: Observable<any>;
  done: Observable<boolean> = this._done.asObservable();
  loading: Observable<boolean> = this._loading.asObservable();

  constructor(private afs: AngularFirestore) {
    this.recipesCollection = this.afs.collection('recipes');
  }

  // Initial query sets options and defines the Observable
  init(orderBy, opts?) {
    this.index = this.client.initIndex('recipes');
    this.replicaIndex = this.client.initIndex('recipes_rating_desc');
    this.query = {
      path: 'recipes',
      limit: 10,
      reverse: false,
      prepend: false,
      offset: 0,
      ...opts
    };

    this.recipesCollection = this.afs.collection(this.query.path, ref => {
      this.mainQuery = ref
        .orderBy(orderBy, 'desc')
        .limit(this.query.limit);
      return this.mainQuery;
    });

    this.subscription = this.mapAndUpdate(this.recipesCollection, orderBy);

    // Create the observable array for consumption in components
    this.data = this._data.asObservable().pipe(scan((acc, val) => {
      return this.query.prepend ? val.concat(acc) : acc.concat(val);
    }));
  }

  // Retrieves additional data from firestore
  more(orderBy, body?) {
    const cursor = this.getCursor();

    this.recipesCollection = this.afs.collection<Recipe>(this.query.path, ref => {
      this.mainQuery = this.mainQuery.startAfter(cursor);
      return this.mainQuery;
    });
    this.mapAndUpdate(this.recipesCollection, orderBy, body);
  }

  // Determines the doc snapshot to paginate query
  private getCursor() {
    const current = this._data.value;
    if (current.length) {
      return this.query.prepend ? current[0].doc : current[current.length - 1].doc;
    }
    return null;
  }

  // Maps the snapshot to usable format the updates source
  private mapAndUpdate(col: AngularFirestoreCollection<any>, orderBy, body?) {

    if (this._done.value || this._loading.value) {
      return;
    }

    // loading
    this._loading.next(true);
    // Map snapshot with doc ref (needed for cursor)
    return col.snapshotChanges().pipe(
      tap(arr => {
        let values = arr.map(snap => {
          const data = snap.payload.doc.data();
          const doc = snap.payload.doc;
          return { ...data, doc };
        });

        const beforeFilter = values.length;

        values = values.filter(x => {
          if (body && body.ingredients) {
            let allIngrednietsAvailable = true;
            body.ingredients.forEach(element => {
              if (!x.ingredientsNames.includes(element)) {
                allIngrednietsAvailable = false;
                return false;
              }
            });
            if (allIngrednietsAvailable) {
              return true;
            }
            return false;
          } else {
            return true;
          }
        });
        // If prepending, reverse array
        values = this.query.prepend ? values.reverse() : values;

        // update source with new values, done loading
        this._data.next(values);
        this._loading.next(false);

        if (beforeFilter !== 0 && !values.length) {
          this.more(orderBy, body);
        }

        // no more values, mark done
        if (!values.length) {
          this._done.next(true);
        }
      }),
      take(1)
    )
      .subscribe(value => {
      });
  }

  // Reset the page
  async reset() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.query.offset = 0;
    this._done = new BehaviorSubject(false);
    this._loading = new BehaviorSubject(false);
    this._data = new BehaviorSubject([]);
    // Observable data
    this.done = this._done.asObservable();
    this.loading = this._loading.asObservable();

    this.data = new Observable;
    this.data = this._data.asObservable().pipe(scan((acc, val) => {
      return this.query.prepend ? val.concat(acc) : acc.concat(val);
    }));

    this.recipesCollection = null;

    this.mainQuery = null;
    return true;
  }

  getRecipes(orderBy: string) {
    this.reset();
    this.recipesCollection = this.afs.collection(this.query.path, ref => {
      this.mainQuery =
        ref.orderBy(orderBy, 'desc')
          .limit(this.query.limit);
      return this.mainQuery;
    }
    );
    this.mapAndUpdate(this.recipesCollection, orderBy);
  }

  searchRecipes(orderBy, searchValue) {
    this.reset();
    this.recipesCollection = this.afs.collection(this.query.path, ref => {
      this.mainQuery = ref.where('nameToSearch', '>=', searchValue)
        .where('nameToSearch', '<=', searchValue + '\uf8ff')
        .orderBy('nameToSearch', 'desc')
        .orderBy(orderBy, 'desc')
        .limit(this.query.limit);
      return this.mainQuery;
    }
    );

    this.mapAndUpdate(this.recipesCollection, orderBy);
  }

  filter(orderBy, body) {
    // loading
    this._loading.next(true);
    this.reset();
    // this.recipesCollection = this.afs.collection<Recipe>(this.query.path, ref => {
    //   this.mainQuery = ref;
    //   if (body.nameToSearch) {
    //     this.mainQuery = this.mainQuery.where('nameToSearch', '>=', body.nameToSearch)
    //       .where('nameToSearch', '<=', body.nameToSearch + '\uf8ff');
    //   }
    //   // if (body.author) { this.mainQuery = this.mainQuery.where('author', '==', body.author); }
    //   if (body.category) { this.mainQuery = this.mainQuery.where('category', '==', body.category); }
    //   // if (body.nameToSearch) { this.mainQuery = this.mainQuery.orderBy('nameToSearch', 'desc'); }
    //   this.mainQuery = this.mainQuery.orderBy(orderBy, 'desc');
    //   this.mainQuery = this.mainQuery.limit(this.query.limit);
    //   return this.mainQuery;
    // });

    let filters = '';

    if (body.category) {
      filters += 'category:'.concat(body.category);
    }

    if (body.ingredients) {
      body.ingredients.forEach(function (value, index) {
        if (index === 0) {
          if (body.category) {
            filters += ' AND ingredientsNames:'.concat(value);
          } else {
            filters += 'ingredientsNames:'.concat(value);
          }
        } else {
          filters += ' AND ingredientsNames:'.concat(value);
        }
      });
    }

    (orderBy === 'published' ? this.index : this.replicaIndex).search('', {
      query: body.searchValue,
      filters: filters,
      offset: this.query.offset,
      length: this.query.limit,
    }).then(res => {
      this._data.next(res.hits);
      if (this._done.value || this._loading.value) {
        return;
      }
      this.query.offset += res.hits.length;
          this._loading.next(false);
          // no more values, mark done
          if (!res.hits.length) {
            this._done.next(true);
          }
    });

    //this.mapAndUpdate(this.recipesCollection, orderBy, body);
  }

  moreFilteredRecipes(orderBy, body) {
    if (this._done.value || this._loading.value) {
      return;
    }
     // loading
     this._loading.next(true);
     let filters = '';

     if (body.category) {
       filters += 'category:'.concat(body.category);
     }

     if (body.ingredients) {
       body.ingredients.forEach(function (value, index) {
         if (index === 0) {
           if (body.category) {
             filters += ' AND ingredientsNames:'.concat(value);
           } else {
             filters += 'ingredientsNames:'.concat(value);
           }
         } else {
           filters += ' AND ingredientsNames:'.concat(value);
         }
       });
     }

     return (orderBy === 'published' ? this.index : this.replicaIndex).search('', {
      query: body.searchValue,
      filters: filters,
      offset: this.query.offset,
      length: this.query.limit,
    }).then(res => {
      this.query.offset += res.hits.length;
      this._data.next(res.hits);
          this._loading.next(false);
          // no more values, mark done
          if (!res.hits.length) {
            this._done.next(true);
          }
    });

  }

  getRecipesOfUser(orderBy, userId) {
    this.reset().then(x => {
      this.recipesCollection = this.afs.collection(this.query.path, ref => {
        this.mainQuery = ref.where('userId', '==', userId)
          .orderBy(orderBy, 'desc')
          .limit(this.query.limit);
        return this.mainQuery;
      }
      );
      this.mapAndUpdate(this.recipesCollection, orderBy);
    });
  }

  getRecipeData(id: string) {
    this.recipeDoc = this.afs.doc<Recipe>(`recipes/${id}`);
    return this.recipeDoc.valueChanges();
  }

  getRecipe(id: string) {
    return this.afs.doc<Recipe>(`recipes/${id}`);
  }

  create(data: Recipe, userId: string) {
    return this.afs.collection('recipes').add(data).then(val => {
      return this.updateUserRecipes(userId, 1);
    });
  }

  updateUserRecipes(userId: string, quantity: number) {
    const documentReference = this.afs.collection('users').doc(userId);
    // running the transaction
    return this.afs.firestore.runTransaction(t => {

      // returning the transaction function
      return t.get(documentReference.ref)
        .then(doc => {

          // read the current "value" field of the document
          const count = doc.data().posts + quantity;
          t.update(documentReference.ref, {
            posts: count
          });
        });
    });
  }

  delete(id: string, userId: string) {
    return this.getRecipe(id).delete().then(() => {
      return this.updateUserRecipes(userId, -1);
    });
  }

  update(id: string, formData) {
    return this.getRecipe(id).update(formData);
  }


}
