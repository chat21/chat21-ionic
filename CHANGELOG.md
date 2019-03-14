# chat21-ionic ver 1.0

### next release 
- (da fare) immagine senza bordo nel msg conversazione
- (da fare) apri immagine nel dettaglio conversazione in una nw finestra
- (da fare) aggiungo br nel messaggio
- (da fare) ottimizzare view contatti (css header, titolo, <-, img profile, cache)

### 1.0.11
- enables authentication outside of tiledesk domains

### 1.0.8
- fixes bug on new conversation (detail conversation hidden)

### 1.0.7
- fixes bug on change user (logout/login)
- fixes bug on change conversation selected and conversation archived selected

### 1.0.6
- fixes bug leave group and close group

### 1.0.5
- add button login on tiledesk (if hostname is tiledesk)

### 1.0.3 
- change color css conversation selected
- change position blue point on new message
- fixes bug css archived conversations (image, point, header, icon)
- fixes bug link in message
- fixes bug button 'Request detail' only support-group
- fixes bug truncate message in list conversations
- load image profile from firestore url in conv. list, info conv., Participants 
- fixes bug user info: load image profilo
- fixes bug info conversation on first load
- change get 'date last access' for id in support-group (sostituito senderAuthInfo.authVar.uid con requester_id)
- fixes bug conversation selected for first open (blank page)
- fixes bug open page 'message info' (message selected = null) 


### 1.0.2
- added timestamp =  firebase.database.ServerValue.TIMESTAMP in send message
- fixes bug spinner il list conversations
- fixes bug load image profile
- deleted IonicImageLoader
- fixes bug info conversation (load image) in archived conversations
- change css in the header of list conversation
- added number of conversations with new messages
- fixes bug image conversation in info conversation
- change css in the conversation list (new message, close message)
- fixes bug load image on firebase storage
- added IonicImageLoader for load and cache images
- fixes bug cache for user (conversation list, contacts and settings)
- add IonicStorageModule
- add popup on videochat
- fixes bug format date last access
- fixed bug local time in send
- add num version in package
- add npm publish

### 0.934
- link projectId open in _blank
- change the color of the text message to in the selected conversation
- fixes bug on metadata conversation
- fixes bug multiple sound on changed / added message

### 0.933
- add user status in header detail conversation
- modified css detail conversation
- adds CHANGELOG.md