import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

exports.onUserDeleted = functions.auth.user().onDelete((user: any) => { // TODO: Remove user from all things
    // TODO: Remove user entry from database. Must return value/promise.
    const doc = admin.firestore().collection('Users').doc(user.uid);
    return doc.delete();
});
