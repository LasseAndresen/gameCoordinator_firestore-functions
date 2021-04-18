import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

exports.onUserSignup = functions.auth.user().onCreate((user: any) => {
    // TODO: Create user entry in database. Must return value/promise.
    return admin.firestore().collection('Users').doc(user.uid).set({
        name: user.displayName,
        email: user.email,
        boardGames: []
    });
});
