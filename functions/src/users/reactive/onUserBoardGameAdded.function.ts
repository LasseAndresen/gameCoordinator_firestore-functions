import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

exports.onUserBoardGameAdded = functions.firestore.document('Users/{userGUID}/BoardGames/{boardGameID}')
    .onCreate(async (snapshot: QueryDocumentSnapshot, context: functions.EventContext) => {
        console.log('Params ', context.params);
        const userGUID = context.params.userGUID;
        const boardGameID = context.params.boardGameID;
        const userDoc = admin.firestore().collection('Users').doc(userGUID);
        const userData = (await userDoc.get())?.data();

        if (userData !== null) {
            /*const newBoardGameOwner = admin.firestore().collection('BoardGames/' + boardGameID + '/Owners/').doc(userGUID);
            newBoardGameOwner.set({name: userData.name});*/
        }

        const boardGameData = snapshot.data();
        console.log('Snapshot data ', boardGameData);
        const toWrite = {
            name: boardGameData?.name ?? 'Null',
            owners: [...userGUID]
        };

        const batch = admin.firestore().batch();
        const groups = await userDoc.collection('Groups').where('members', 'array-contains', userGUID).get();
        groups.forEach(doc => {
            batch.update(doc.ref, {
                boardGames: [...boardGameID] // admin.firestore.FieldValue.arrayUnion([userGUID])
            });
            const docRef = doc.ref.collection('BoardGames').doc(boardGameID);
            batch.set(docRef, toWrite);
        });

        return batch.commit();
    });
