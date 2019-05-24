import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { Recipe } from '../models/recipe';
import { Review } from '../models/review';
import { Rating } from '../models/rating';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  products: AngularFirestoreCollection<Recipe[]>;
  product: Recipe;

  constructor(private afs: AngularFirestore) { }

  getRecipeReviews(recipeId: string) {

    return this.afs.collection<Review>('reviews', ref => ref.where('recipeId', '==', recipeId).orderBy('published', 'desc')
    .limit(5)).valueChanges();

  }

  postReview(comment: Review) {
    return this.afs.collection('reviews').add(comment);
  }

  postRating(rating: Rating) {
    return this.afs.collection('ratings').doc(rating.recipeId + '-' + rating.userId).set({
      userId: rating.userId,
      ratingValue: rating.ratingValue,
      recipeId: rating.recipeId
    }).then(() => {
      const documentReference = this.afs.collection('recipes').doc(rating.recipeId);

      // running the transaction
      return this.afs.firestore.runTransaction(t => {

        // returning the transaction function
        return t.get(documentReference.ref)
          .then(doc => {

            // read the current "value" field of the document
            const newSum = doc.data().sumRating + rating.ratingValue;
            const newQuantity = doc.data().qtyRating + 1;

            const avgRating = newSum / newQuantity;

            const newAvgRating = Number((Math.round(avgRating * 2) / 2).toFixed(1));
            t.update(documentReference.ref, {
              sumRating: newSum,
              qtyRating: newQuantity,
              avgRating: newAvgRating
            });
          });
      }).then(res => console.log('Transaction completed!'), err => console.error(err));
    });
  }

  setProductRating(productId, rating) {
    this.afs.doc(`products/${productId}`).update({ avRating: rating });
  }

  isRated(recipeId, userId) {
    return this.afs.firestore.collection('ratings').doc(recipeId + '-' + userId).get().then(value => {
      return value.exists;
    });
  }
}
