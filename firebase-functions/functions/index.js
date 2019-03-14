//chat21
const functions = require('firebase-functions');
var admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


exports.sendNotification = functions.database.ref('/apps/{tenant}/messages/{conversationId}/{pushId}')//messages/{conversationId}/{pushId}')
.onWrite(event => {
    console.log("step1 : " + event);
    // Only notify when it is first created.
    if (event.data.previous.exists()) {
        return;
    }
    console.log("step2 : ");
    // Exit when the data is deleted.
    if (!event.data.exists()) {
        return;
    }
    console.log("step3 : ");
    const conversationId = event.params.conversationId;
    console.log("conversationId : " + conversationId);
    const tenant = event.params.tenant;//conversationId.substring(0,conversationId.indexOf("-"));
    console.log("tenant : " + tenant);
    const message = event.data.current.val();
    console.log('message ' + message );
    
    const senderUid = message.sender;
    console.log('senderUid ' + senderUid );
    const receiverUid = message.recipient;
    console.log('receiverUid ' + receiverUid );
    const text = message.text;
    const sender_fullname = message.sender_fullname;
    console.log('text ' + text );

         
    var registrationTokens = [];

    if (senderUid == receiverUid) {
        console.log('not send push notification for the same user');
        return;
    }
    //console.log('step4 :::'+`/apps/${tenant}/users/${receiverUid}/instancesId`);

    // Get the list of device notification tokens. //`/apps/{tenant}/users/${receiverUid}/instancesId`  //'/apps/chat21/users/voCJVwb7J0WaY9YIcXPDp35NCb73/instancesId'
    //const getDeviceTokensPromise = admin.database().ref(`/apps/${tenant}/users/${receiverUid}/instancesId`).once('value');
    const getDeviceTokensPromise = admin.database().ref(`/apps/${tenant}/users/${receiverUid}/instanceId`).once('value');
    
    console.log('getDeviceTokensPromise:: '+getDeviceTokensPromise);
    return Promise.all([getDeviceTokensPromise]).then(results => {
        console.log('results:: '+results);
        const tokensSnapshot = results[0];
        console.log('tokensSnapshot1: ' + tokensSnapshot.val());
        // Check if there are any device tokens.
        //if (!tokensSnapshot.hasChildren()) {
        console.log('There are', tokensSnapshot.numChildren(), 'tokens to send notifications to.');    
        if (!tokensSnapshot.hasChildren()) {
            return console.log('There are no notification tokens to send to.');
        }

        // var tokens = [];
        // tokensSnapshot.forEach(function(child) {
        //     console.log('child 2::::'+child.val());
        //     tokens.push(child.val());
        // });

        const tokens = Object.keys(tokensSnapshot.val());
        console.log('step5 tokens ::::', tokens[0]);

    
        // Notification details.
        //https://codelabs.developers.google.com/codelabs/firebase-cloud-functions/#9
        var textBody = sender_fullname + ": "+ text;
        const payload = {
            notification: {
              //title: `${snapshot.val().name} posted ${text ? 'a message' : 'an image'}`,
              title: tenant,
              body: textBody ? (textBody.length <= 100 ? textBody : textBody.substring(0, 97) + '...') : '',
              //icon: snapshot.val().photoUrl || '/images/profile_placeholder.png',
              click_action: `https://${functions.config().firebase.authDomain}`
            },
            data: {
                conversationId: conversationId,
                convers_with: receiverUid,
                convers_with_fullname: receiverUid,
                recipient: receiverUid,
                sender: senderUid,
                sender_fullname: senderUid,     
                text: text
            }
          };
        // const payload = {
        //     // notification: {
        //     //     title: tenant,
        //     //     body: sender_fullname + ": "+ text,
        //     //     icon : "ic_notification_small"
        //     //     //sound : "default",
        //     //     //click_action: "https://ionic3chat.firebaseapp.com/" // for intent filter in your activity
        //     // },
        //     data: {
        //         // conversationId: conversationId,
        //         // convers_with: receiverUid,
        //         // convers_with_fullname: receiverUid,
        //         // recipient: receiverUid,
        //         // sender: senderUid,
        //         // sender_fullname: senderUid,     
        //         text: text
        //     }
        // };
        console.log('step6::::');
        


        // return admin.messaging().sendToDevice(tokens, payload)
        // .then(function (response) {
        //     console.log("Successfully sent message:", response);
        //     console.log("Successfully sent message.results[0]:", response.results[0]);
        // })
        // .catch(function (error) {
        //     console.log("Error sending message:", error);
        // });
        

        // Send notifications to all tokens.
        return admin.messaging().sendToDevice(tokens, payload).then(response => {
            // For each message check if there was an error.
            const tokensToRemove = [];
            response.results.forEach((result, index) => {
            const error = result.error;
            if (error) {
                console.error('Failure sending notification to', tokens[index], error);
                // Cleanup the tokens who are not registered anymore.
                if (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered') {
                tokensToRemove.push(allTokens.ref.child(tokens[index]).remove());
                }
            }
            });
            return Promise.all(tokensToRemove);
        });
    
  

        // return admin.messaging().sendToDevice(tokens, payload)
        // .then(response => {
        //     // For each message check if there was an error.
        //     const tokensToRemove = [];
            
        //     response.results.forEach((result, index) => {
        //         console.log('--------> response.result::::'+response.results[index]);
        //         const error = result.error;
        //         if (error) {
        //             console.error('Failure sending notification to', tokens[index], error);
        //             // Cleanup the tokens who are not registered anymore.
        //             if (error.code === 'messaging/invalid-registration-token' ||
        //                 error.code === 'messaging/registration-token-not-registered') {
        //                 //tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
        //             }
        //         }
        //     });
        //     //return Promise.all(tokensToRemove);
        // });
    });
});
  
    // const getInstanceIdPromise = admin.database().ref(`/apps/{tenant}/users/${receiverUid}/instancesId/`).once('value', 
    // function(snapshot) {
    //     console.log('snapshot ' + snapshot);
    //     this.registrationTokens = [];
    //     console.log('this.registrationTokens ' + this.registrationTokens);
    //     snapshot.forEach(function(childSnapshot) {
    //         // Integer: è un valore di default utilizzato per poter create la mappa (scelta progettuale dettata dalle limitazioni di firebase)
    //         var userInstanceId = childSnapshot.key; // corrisponde allo userId dell'utente
    //         var userInstanceIdValue = childSnapshot.val(); // corrisponde al valore di defautl dell'utente
    //         console.log("\n userId:: " + userInstanceId + "userIdValue:: " + userInstanceIdValue );
    //         if(userInstanceIdValue !== null && userInstanceIdValue !== undefined){
    //             this.registrationTokens.push(userInstanceIdValue);
    //         }
    //     });
    // });
        

       
    // // See the "Defining the message payload" section below for details
    // // on how to define a message payload.
    // var payload = {
    //     data: {
    //     score: "850",
    //     time: "2:45"
    //     }
    // };

    // // Send a message to the devices corresponding to the provided
    // // registration tokens.
    // // admin.messaging().sendToDevice(registrationTokens, payload)
    // // .then(function(response) {
    // // // See the MessagingDevicesResponse reference documentation for
    // // // the contents of response.
    // // console.log("Successfully sent message:", response);
    // // })
    // // .catch(function(error) {
    // // console.log("Error sending message:", error);
    // // });




      
    // });