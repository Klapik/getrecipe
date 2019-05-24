import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';


admin.initializeApp();

const env = functions.config();

import * as algoliasearch from 'algoliasearch';

// Initialize the Algolia Client
const client = algoliasearch(env.algolia.appid, env.algolia.apikey);
const index = client.initIndex('recipes');

exports.createRecipe = functions.firestore
    .document(`recipes/{recipeId}`)
    .onCreate(async (snap, context) => {

        const body = {
            author: snap.data().author,
            image: snap.data().image,
            published: snap.data().published,
            title: snap.data().title,
            userId: snap.data().userId,
            category: snap.data().category
        };
        const author = snap.data().userId;
        let integer = 0;
        const recipeId = snap.id;
        let batch = admin.firestore().batch();

        return admin
            .firestore()
            .collection(`user-data/${author}/followers`)
            .get().then((followers) => {
                followers.forEach(value => {
                    integer += 1;
                    const itemDoc = admin.firestore().doc(`user-data/${value.data().followerId}/timeline/${recipeId}`);
                    batch.set(itemDoc, body);
                    if (integer === 500) {
                        batch.commit().catch(er => {
                            console.log(er);
                            return er
                        }
                        )
                        batch = admin.firestore().batch();
                    }
                });
                return batch.commit();
            });

    });

exports.indexRecipe = functions.firestore
    .document('recipes/{recipeId}')
    .onCreate((snap, context) => {
        const data = snap.data();
        const objectID = snap.id;

        const body = {
            avgRating: data.avgRating,
            nameToSearch: data.nameToSearch,
            title: data.title,
            ingredientsNames: data.ingredientsNames,
            userId: data.userId,
            author: data.author,
            category: data.category,
            published: data.published,
            image: data.image
        }
        // Add the data to the algolia index
        return index.addObject({
            objectID,
            ...body
        });
    });

exports.unindexRecipe = functions.firestore
    .document('recipes/{recipeId}')
    .onDelete((snap, context) => {
        const objectId = snap.id;

        // Delete an ID from the index
        return index.deleteObject(objectId);
    });

exports.updateRecipe = functions.firestore
    .document('recipes/{recipeId}')
    .onUpdate((snap, context) => {
        // Get an object representing the document
        // e.g. {'name': 'Marie', 'age': 66}
        const newValue = snap.after.data();

        const data = snap.after.data();
        const objectID = snap.after.id;

        const body = {
            avgRating: data.avgRating,
            nameToSearch: data.nameToSearch,
            title: data.title,
            ingredientsNames: data.ingredientsNames,
            userId: data.userId,
            author: data.author,
            category: data.category,
            published: data.published,
            image: data.image
        }

        // Add the data to the algolia index
        return index.addObject({
            objectID,
            ...body
        });
    });