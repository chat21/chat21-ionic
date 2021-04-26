# chat21-ionic ver 1.0

### 3.0.22
- Fixes the bug: the modal login window opens even if the user is logged in
- Fixes the bug: contact avatar is not displayed in the contact list (write to)
- Manages scroll position in concversation detail page as widget behaviour 
- Bug fixed onInit selected conversation in ion-list-conversations.component
- Improves the conversation list graphics in the left side panel
- Implemented the method for archiving conversations
- Fixes the bug: clicking on an archived conversation does not update the 'read conversation' badge
- Fixes the bug: the messages in the conversation detail are all aligned to the left
- Fixes the bug: the selected active conversation is no longer selected when the user returns to active conversations from archived conversations
- Deletes the persistence of the last open conversation from the local storage
- Restores the button 'open conversation detail'
- Changes the mqtt library loading: from external loaded in index.html to local loaded in angular.json
- Adds checking for user existence before running "setPresence" in the goOnLine method of app.component
- Adds a path to "Conversation-detail" with only the conversation ID parameter
- Renames (and improves) the method connect in subscribeToConversations and removes the subscriptions to the conversation detail
- Modifies the "getConversationDetail" method to return a callback and moves the subscription to the method from the "conversation details" page to the "information-content" component
- Changes the "setConversationRead" method to accept the conversation ID as parameter and no longer the selected conversation
- Closes the contacts modal window when a contact is selected
- Moves conversations subscription in "app.component" from "conversation-list-page"
- Fixes the bug: the "loadContactsFromUrl" service does not work if the chatEngine is "mqtt"
- Fixes the bug: when the user logs out, the "removePresence" method throws errors because it is executed after the "signOut" method of Firebase
- Renamed "pushUploadMessage" in upload-service with "upload()"
- Implemented new NATIVE-UPLOAD-SERVICE and added in mqtt app.module uploadFactory section (not active yet)
- Handled promise of upload in message-text-area while upload a file/image
- Fixes the bug: the images are not loaded in the current conversation
- Fixes the bug: the right panel does not display information relating to the type of conversation selected
- Fixes the bug: the 'channelType' in messages is incorrect
- Fixes the bug: the link of the downloaded file is not displayed
- Fixes the bug: the right side panel does not show the content related to the selected conversation type

### 3.0.21
- Fixes the bug: on the browser the archived conversation window is opened multiple times by clicking on the 'Archived' button
- Fixes the bug: on mobile the archived conversations window is no longer displayed if it has been opened once
- Highlights the archived conversation with a background color
- Fixes the bug: the detail of the selected conversation does not open on mobile


### 3.0.20
- Adds the ability to display the archived conversations

### 3.0.17
- bug fix: changed abstract classes in app module
- changed: class presence
- changed: class typing

### 3.0.16


### 3.0.15
- bug-fix: changed routing removing url parameters
- bug-fix: create new conversation
- changed: create abstract classes for services
- bug-fix: scroll-page
- changed: replaced Observable with BehaviourSubject

### 3.0.14
- new: create new conversation
- new: added conversations cache

### 3.0.13
- bug-fix: open/close modal login
- new: added alert on error login
- bug-fix: auth with JWT token from url queryParams
- bug-fix: routing list detail
- new: added BehaviourSubject on authChange
- new: load chat components after login
- bug-fix: contact list: load contacts


### 3.0.11
- new: set persistence firebase from environment 
- new: get JWT token from url queryParams and signin with token 
- new: save token in localstorage

### 3.0.10
- bug-fix: url navigation
- bug-fix: CONTACTS_URL from environment

### 3.0.9
- bug-fix: info conversation right sidebar

### 3.0.8
- new: added Scrivi a...

### 3.0.7
- bug fix: navigation and routing

### 3.0.6
- test build platforms browser, ios, android --prod

### 3.0.1
- add scrollBarButton
- adds CHANGELOG.md