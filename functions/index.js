const functions = require('firebase-functions');
// const db = require('')

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.createFollower = functions.firestore
    .document('followers/{document}')
    .onCreate((snap, context) => {
      console.log(snap.data());

      return 0;
    });
