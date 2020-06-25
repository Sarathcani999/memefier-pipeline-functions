const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const increment = admin.firestore.FieldValue.increment(1);
const decrement = admin.firestore.FieldValue.increment(-1);

// Post cloud functions
// delete meme -- storage *imp*
exports.deletePost = functions.firestore
    .document('posts/{id}')
    .onDelete((snap , context) => {
        const p1 = admin.firestore().collection("comments")
            .where("post_id" , "==" , snap.id)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach( doc => {
                    doc.ref.delete();
                });

                return null
            });

        const p2 = admin.firestore().collection("reactions")
        .where("post_id" , "==" , snap.id)
        .get()
        .then(async querySnapshot => {
            await querySnapshot.forEach( doc => {
                doc.ref.delete();
            });

            return null
        });

        return Promise.all([p1 , p2])
            .catch(error => console.error(error.message));
        
    });

// User Delete 
// delete
// 1. userDetails
// 2. posts
// 3. replies
// 4. reactions
// 5. followers
// 6. userId
// 7. comments
// 8. dp -- storage *imp*
exports.deleteUser = functions.auth
    .user()
    .onDelete(user => {
        const promises = [];
        const p1 = admin.firestore()
            .collection("userDetails")
            .doc(user.uid)
            .delete();
        promises.push(p1);

        const p2 = admin.firestore()
            .collection("posts")
            .where("created_by" , "==" , user.uid)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach( doc => {
                    doc.ref.delete();
                });

                return null
            });
        promises.push(p2);

        const p3 = admin.firestore()
            .collection("replies")
            .where("created_by" , "==" , user.uid)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach( doc => {
                    doc.ref.delete();
                });

                return null
            });
        promises.push(p3);

        const p4 = admin.firestore()
            .collection("reactions")
            .where("user_uid" , "==" , user.uid)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach( doc => {
                    doc.ref.delete();
                });

                return null
            });
        promises.push(p4);

        const p5 = admin.firestore()
            .collection("followers")
            .where("followed_by" , "==" , user.uid)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach( doc => {
                    doc.ref.delete();
                });

                return null
            });
        promises.push(p5);
  
        const p6 = admin.firestore()
            .collection("followers")
            .where("following" , "==" , user.uid)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach( doc => {
                    doc.ref.delete();
                });

                return null
            });
        promises.push(p6);

        const p7 = admin.firestore()
            .collection("userId")
            .where("uid" , "==" , user.uid)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach( doc => {
                    doc.ref.delete();
                });

                return null
            });
        promises.push(p7);

        const p8 = admin.firestore()
            .collection("comments")
            .where("created_by" , "==" , user.uid)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach( doc => {
                    doc.ref.delete();
                });

                return null
            });
        promises.push(p8);

        return Promise.all(promises)
            .catch(error => console.log(error.message));

    });

// Comment Delete -- delete only replies , and associated reactions to the comment (future installations)



// Reactions - To be completed (LOGIC not framed)
// increment and decrement like/dislike count in the posts colloection <"posts/{document}">

// Followers cloud functions
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
