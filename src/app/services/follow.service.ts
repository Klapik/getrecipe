import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

@Injectable({
  providedIn: 'root'
})
export class FollowService {

  constructor(private afs: AngularFirestore) { }

  getFollowers(userId: string) {
    // Used to build the follower count
    return this.afs.collection(`user-data/${userId}/followers`);
  }

  getFollowing(followerId: string, followedId: string) {
    // Used to see if UserFoo if following UserBar
    return this.afs.firestore.collection('user-data').doc(followerId)
      .collection('following').doc(followedId).get().then(value => {
        return value.exists;
      });
  }

  follow(followerId: string, followedId: string) {

    this.afs.doc(`user-data/${followedId}/followers/${followerId}`).set({ followerId: followerId });

    return this.afs.doc(`user-data/${followerId}/following/${followedId}`).set({ followedId: followedId }).then(() => {
      const followerReference = this.afs.collection('users').doc(followerId);
      const followedReference = this.afs.collection('users').doc(followedId);

      // running the transaction
      this.afs.firestore.runTransaction(t => {

        // returning the transaction function
        return t.get(followerReference.ref)
          .then(doc => {

            // read the current "value" field of the document
            const newFollowingCount = doc.data().followingCount + 1;
            t.update(followerReference.ref, {
              followingCount: newFollowingCount
            });
          });
      }).then(res => {
        this.afs.firestore.runTransaction(x => {
          // returning the transaction function
          return x.get(followedReference.ref)
            .then(doc => {
              // read the current "value" field of the document
              const newFollowersCount = doc.data().followersCount + 1;
              x.update(followedReference.ref, {
                followersCount: newFollowersCount
              });
            });
        }).then(val => console.log('Transaction completed!'), err => console.error(err));
      }, err => console.error(err));
    });
  }

  unfollow(followerId: string, followedId: string) {
    this.afs.doc(`user-data/${followedId}/followers/${followerId}`).delete();

    return this.afs.doc(`user-data/${followerId}/following/${followedId}`).delete().then(() => {
      const followerReference = this.afs.collection('users').doc(followerId);
      const followedReference = this.afs.collection('users').doc(followedId);

      // running the transaction
      this.afs.firestore.runTransaction(t => {

        // returning the transaction function
        return t.get(followerReference.ref)
          .then(doc => {

            // read the current "value" field of the document
            const newFollowingCount = doc.data().followingCount - 1;
            t.update(followerReference.ref, {
              followingCount: newFollowingCount
            });
          });
      }).then( res => {
        this.afs.firestore.runTransaction(x => {
          // returning the transaction function
          return x.get(followedReference.ref)
            .then(doc => {
              // read the current "value" field of the document
              const newFollowersCount = doc.data().followersCount - 1;
              x.update(followedReference.ref, {
                followersCount: newFollowersCount
              });
            });
        }).then( val => console.log('Transaction completed!'), err => console.error(err));
      }, err => console.error(err));
    });
  }

}
