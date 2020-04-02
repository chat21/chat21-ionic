# chat21-ionic ver 1.0

### 2.0.0
- stable version

### 1.0.21.beta.13 branch - sidebar
- bug fix: start with support-group open iframe in sidebar

### 1.0.21.beta.12 branch - sidebar
- bug-fix: content sidebar and auto open

### 1.0.21.beta.11 branch - sidebar
- bug-fix: sound message only one on changed

### 1.0.21.beta.10 branch - sidebar
- bug fix: typing in direct conversation

### 1.0.21.beta.9 branch - sidebar
- bug fix: change urlNodeTypings in direct conversation

### 1.0.21.beta.8 branch - sidebar
- bug fix: new convrsation

### 1.0.21.beta.7 branch - sidebar
- bug fix: translate typing

### 1.0.21.beta.6 branch - sidebar
- bug fix: typing me

### 1.0.21.beta.5 branch - sidebar
- new - typings
- disabled list projects in info conversation

### 1.0.21.beta.4 branch - sidebar
- bug fix: detail archived conversations

### 1.0.21.beta.3 branch - sidebar
- bug fix: preload list conversation

### 1.0.21.beta.2 branch - sidebar
- bug fix: load canned

### 1.0.21.beta.1 branch - sidebar
- bug fix: projectID get on group attributes

### 1.0.21 branch - sidebar
- add iframe sidebar info conversation
- canned loaded on /

### 1.0.20-beta.13 
- bug fix tooltip

### 1.0.20-beta.12 
- add SERVER_BASE_URL in config
- add canned 

### 1.0.20
- minor improvements

### 1.0.19
- moves urls in environment

### 1.0.18B
- load firebase-config in assets

### 1.0.18
- change BASE_URL (get it from remote)
- add chat21ApiUrl in firebaseConfig

### 1.0.17
- new - change font size .messageFirst from 1.4em to 1.2em
- new - change font size .content_message_wellcome from 1.4em to 1.2em
- new - open detail conversation from url parameters 'recipient' and 'recipientFullname'
- new - manage photo disabled on support.tiledesk.com

### 1.0.16
- fixes bug contacts in chat-manager
- fixes bug new user registration


### 1.0.15
- change css modal PopoverPage
- fixes bug splash-screen on browser platform

### 1.0.14
- change css footer conversation detail
- change css ballons conversation detail
- change css info conversation
- enabled send message with html tags 
- enabled send all image type
- enabled send files pdf, zip
- fixes bug send second image
- open detail image in new tab browser
- disabled cache conversations
- fixes bug send image
- hidden users list on "tiledesk" domain
- disabled sync users on "tiledesk" domain

### 1.0.13
- add tab info advanced
- add angular-linky
- fixes bug status online/offline

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