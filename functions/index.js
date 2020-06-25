const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const increment = admin.firestore.FieldValue.increment(1);
const decrement = admin.firestore.FieldValue.increment(-1);

exports.createFollower = functions.firestore
    .document('followers/{id}')
    .onCreate((snap, context) => {
        console.log(snap.data());

        const followed_by = snap.data().followed_by;
        const following = snap.data().following;
        const promises = [];

        const p1 = admin.firestore().collection('userDetails').doc(followed_by).update({
            following : increment
        });
        promises.push(p1);

        const p2 = admin.firestore().collection('userDetails').doc(following).update({
            followers : increment
        });
        promises.push(p2);

        return Promise.all(promises)

    });

exports.deleteFollower = functions.firestore
    .document('followers/{id}')
    .onDelete((snap, context) => {
        console.log(snap.data());

        const followed_by = snap.data().followed_by;
        const following = snap.data().following;

        const promises = [];

        const p1 = admin.firestore().collection('userDetails').doc(followed_by).update({
            following : decrement
        });
        promises.push(p1);

        const p2 = admin.firestore().collection('userDetails').doc(following).update({
            followers : decrement
        });
        promises.push(p2);

        return Promise.all(promises)
    });
