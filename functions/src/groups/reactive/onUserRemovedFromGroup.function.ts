import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

exports.onUserAddedToGroup = functions.firestore.document('Groups/{groupID}/Members/{userGUID}')
    .onDelete(async (snapshot: any, context: any) => {
        const userGUID = context.params.userGUID;
        const groupID = context.params.groupID;
        const groupDocumentRef = admin.firestore().collection('Groups').doc(groupID);
        const groupBoardGames = await groupDocumentRef.collection('BoardGames').where('owners', 'array-contains', userGUID).get();
        const boardGameGUIDs: string[] = ['']; // arrayRemove does not work with no list entries, but does not complain about items that does not exist in the list
        const batch = admin.firestore().batch();
        const anyBatch = false;
        groupBoardGames.docs.forEach(doc => {
            const data = doc.data();
            if (data.owners.length === 1) {
                batch.delete(doc.ref);
                boardGameGUIDs.push(doc.id);
            }
        });
        if (anyBatch) {
            await batch.commit();
        }

        return groupDocumentRef.update({
            members: admin.firestore.FieldValue.arrayRemove(userGUID),
            boardGames: admin.firestore.FieldValue.arrayRemove(...boardGameGUIDs)
        });
    });
