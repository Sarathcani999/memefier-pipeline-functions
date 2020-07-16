const functions = require('firebase-functions');
const admin = require('firebase-admin');
const algoliasearch = require('algoliasearch');

admin.initializeApp();

const increment = admin.firestore.FieldValue.increment(1);
const decrement = admin.firestore.FieldValue.increment(-1);

// Post cloud functions
// delete meme -- storage *imp*
exports.deletePost = functions.firestore
    .document('posts/{id}')
    .onDelete((snap, context) => {
        const p1 = admin.firestore().collection("comments")
            .where("post_id", "==", snap.id)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach(doc => {
                    doc.ref.delete();
                });

                return null
            });

        const p2 = admin.firestore().collection("reactions")
            .where("post_id", "==", snap.id)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach(doc => {
                    doc.ref.delete();
                });

                return null
            });

        return Promise.all([p1, p2])
            .catch(error => console.error(error.message));

    });

/*
User Delete 
delete
1. userDetails
2. posts
3. replies
4. reactions
5. followers
6. userId
7. comments
8. dp -- storage *imp*
*/
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
            .where("created_by", "==", user.uid)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach(doc => {
                    doc.ref.delete();
                });

                return null
            });
        promises.push(p2);

        const p3 = admin.firestore()
            .collection("replies")
            .where("created_by", "==", user.uid)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach(doc => {
                    doc.ref.delete();
                });

                return null
            });
        promises.push(p3);

        const p4 = admin.firestore()
            .collection("reactions")
            .where("user_uid", "==", user.uid)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach(doc => {
                    doc.ref.delete();
                });

                return null
            });
        promises.push(p4);

        const p5 = admin.firestore()
            .collection("followers")
            .where("followed_by", "==", user.uid)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach(doc => {
                    doc.ref.delete();
                });

                return null
            });
        promises.push(p5);

        const p6 = admin.firestore()
            .collection("followers")
            .where("following", "==", user.uid)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach(doc => {
                    doc.ref.delete();
                });

                return null
            });
        promises.push(p6);

        const p7 = admin.firestore()
            .collection("userId")
            .where("uid", "==", user.uid)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach(doc => {
                    doc.ref.delete();
                });

                return null
            });
        promises.push(p7);

        const p8 = admin.firestore()
            .collection("comments")
            .where("created_by", "==", user.uid)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach(doc => {
                    doc.ref.delete();
                });

                return null
            });
        promises.push(p8);

        return Promise.all(promises)
            .catch(error => console.log(error.message));

    });

// Comment Delete -- delete only replies , and associated reactions to the comment (future installations)
exports.createComment = functions.firestore
    .document("comments/{id}")
    .onCreate((snap, context) => {

        var doc_id = "posts/" + snap.data().post_id
        return admin.firestore()
            .doc(doc_id)
            .update({
                commentCount: increment
            })
    });
exports.deleteComment = functions.firestore
    .document("comments/{id}")
    .onDelete((snap, context) => {

        var p1 = admin.firestore()
            .collection("replies")
            .where("comment_id", "==", snap.id)
            .get()
            .then(async querySnapshot => {
                await querySnapshot.forEach(doc => {
                    doc.ref.delete();
                });

                return null;
            })
            .catch(error => console.error(error.message));

        var doc_id = "posts/" + snap.data().post_id

        var p2 = admin.firestore()
            .doc(doc_id)
            .update({
                commentCount: decrement
            })

        return Promise.all([p1, p2])
            .catch(error => console.error(error.message))
    });


// Reactions - To be completed (LOGIC not framed)
// increment and decrement like/dislike count in the posts colloection <"posts/{document}">
exports.createReaction = functions.firestore
    .document("reactions/{doc}")
    .onCreate((snap, context) => {
        /*
        Algorithm :
            if like then :
                increment likeCount
            if dislike then :
                increment dislikeCount
        */
        if (snap.data().reaction === 0) {
            return admin.firestore().collection("posts").doc(snap.data().post_id).update({
                likeCount: increment
            });
        } else if (snap.data().reaction === 1) {
            return admin.firestore().collection("posts").doc(snap.data().post_id).update({
                dislikeCount: increment
            });
        } else {
            return null
        }
    });

exports.deleteReaction = functions.firestore
    .document("reactions/{doc}")
    .onDelete((snap, context) => {
        /*
        Algorithm :
            if like then :
                increment likeCount
            if dislike then :
                increment dislikeCount
        */
        if (snap.data().reaction === 0) {
            return admin.firestore().collection("posts").doc(snap.data().post_id).update({
                likeCount: decrement
            });
        } else if (snap.data().reaction === 1) {
            return admin.firestore().collection("posts").doc(snap.data().post_id).update({
                dislikeCount: decrement
            });
        } else {
            return null
        }
    });

exports.updateReaction = functions.firestore
    .document("reactions/{doc}")
    .onUpdate((change, context) => {
        /*
        Algorithm :
            if like -> dislike then :
                decrement likeCount
                increment dislikeCount
            else if dislike -> like then :
                decrement dislikeCount
                increment likeCount
            else :
                return null
        */

        const newValue = change.after.data().reaction;
        const oldValue = change.before.data().reaction;

        var post_id = change.after.data().post_id

        console.log("BEFORE CHANGE :", oldValue);
        console.log("AFTER  CHANGE :", newValue);

        if (oldValue === 0 && newValue === 1) {
            return admin.firestore().collection("posts").doc(post_id).update({
                likeCount: decrement,
                dislikeCount: increment
            });
        } else if (oldValue === 1 && newValue === 0) {
            return admin.firestore().collection("posts").doc(post_id).update({
                dislikeCount: decrement,
                likeCount: increment
            });
        } else {
            return null
        }
    });

// Followers cloud functions
exports.createFollower = functions.firestore
    .document('followers/{id}')
    .onCreate((snap, context) => {
        // console.log(snap.data());

        const followed_by = snap.data().followed_by;
        const following = snap.data().following;
        const promises = [];

        const p1 = admin.firestore().collection('userDetails').doc(followed_by).update({
            following: increment
        });
        promises.push(p1);

        const p2 = admin.firestore().collection('userDetails').doc(following).update({
            followers: increment
        });
        promises.push(p2);

        return Promise.all(promises)

    });

exports.deleteFollower = functions.firestore
    .document('followers/{id}')
    .onDelete((snap, context) => {
        // console.log(snap.data());

        const followed_by = snap.data().followed_by;
        const following = snap.data().following;

        const promises = [];

        const p1 = admin.firestore().collection('userDetails').doc(followed_by).update({
            following: decrement
        });
        promises.push(p1);

        const p2 = admin.firestore().collection('userDetails').doc(following).update({
            followers: decrement
        });
        promises.push(p2);

        return Promise.all(promises)
    });

// Community or groups cloud functions
exports.onCreateGroup = functions.firestore
    .doc("groups/{group}")
    .onCreate((snap, context) => {
        var group_id = snap.params.id
        var user_uid = snap.data().admin

        var doc_name = group_id + '_' + user_uid
        // admin gets in to group_member collection
        return admin.firestore().collection("group_member").doc(doc_name).set({
            group_id,
            user_uid,
            approved: true
        })
    })

exports.onCreateGroupMember = functions.firestore
    .doc("group_member/{member}")
    .onCreate((snap, context) => {
        var group_id = snap.data().group_id

        return admin.firestore().collection('groups').doc(group_id).update({
            members: increment
        });
    })

exports.onCreateGroupMember = functions.firestore
    .doc("group_member/{member}")
    .onDelete((snap, context) => {
        var group_id = snap.data().group_id

        return admin.firestore().collection('groups').doc(group_id).update({
            members: decrement
        });
    })
