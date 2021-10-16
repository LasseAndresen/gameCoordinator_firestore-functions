import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

exports.onUserAddedToGroup = functions.firestore.document('Groups/{groupID}/Users/{userGUID}')
    .onCreate(async (snapshot: any, context: any) => {
        const userGUID = context.params.userGUID;
        const groupID = context.params.groupID;
        const userBoardGames = await admin.firestore().collection('Users/ + ' + userGUID + '/BoardGames').get();
        const groupDocumentRef = admin.firestore().collection('Groups').doc(groupID);
        const groupBoardGameRef = groupDocumentRef.collection('BoardGames');
        const boardGameGUIDs: string[] = [];
        const batch = admin.firestore().batch();
        userBoardGames.forEach(doc => {
            boardGameGUIDs.push(doc.id);
            const docRef = groupBoardGameRef.doc(doc.id);
            const boardGameData = doc.data();
            const toWrite = {
                name: boardGameData.name,
                owners: admin.firestore.FieldValue.arrayUnion(userGUID)
            };
            batch.set(docRef, toWrite);
        });
        await batch.commit();

        return groupDocumentRef.update({
            members: admin.firestore.FieldValue.arrayUnion(userGUID),
            boardGames: admin.firestore.FieldValue.arrayUnion(boardGameGUIDs)
        });
    });
