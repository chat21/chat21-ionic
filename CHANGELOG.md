# chat21-ionic ver 3.0

### 3.0.42-beta.1.1
- Fixes the bug: if the uploadEngine key is set to native the svg images are not uploaded
- Fixes the bug: "logger.printLog" is not a function in "conversation-content-component"
- Fixes the bug: with native uploadEgine uploading files or images whose names contain spaces return broken URLs
- Fixes the bug: when switching from mobile to desktop mode, if a conversation is selected in the conversation details, the list of conversations is displayed
- Fixes the bug: when switching from desktop mode to mobile mode, if no conversation is selected, the conversation list is not displayed
- Fixes the bug: remove the dependency of the "LoggerService" from the 'ion-conversation-detail' component constructor

### 3.0.42-beta.1.0
- Minor improvements

### 3.0.42
- Fixes the bug: in mobile mode in the right side panel "Conversation info" the textarea 'send message' is displayed
- Fixes the bug: the button open/close the right side panel 'Info conversation' does not work correctly
- Hides the 'Conversation Info' right side panel when the window width is less than 991px

### 3.0.41
- Sets in pre environment the key "uploadEngine" to "firebase"
- Fixes the bug: when is pressed enter in the textarea "send message" is added a new line
- Fixes the bug: the text of the message is always written on a single line, ignoring line breaks
- Adds a bubble with an upload spinner to the in-conversation-detail page when uploading a file using uploadEngine = 'firebase'
- Displays in the loader-preview page a placeholder image when a file is selected to be loaded
- Removes from the services "firebase-conversation-handler",  "firebase-conversations-handler", "firebase-archivedconversations-handler" and mqtt-conversation-handler the HTML entities encode
- Improves the "htmlEntities" function and adds the "replaceEndOfLine" function

### 3.0.40
- Improves the methods implemented for the correct display of messages in the conversation list when a snippet of code is pasted

### 3.0.39
- Fixes the bug: if a snippet of code is pasted and sent it is not displayed correctly in the chat
- Fixes the bug: if a snippet of code is pasted and sent it is not displayed correctly in the convesations list 

### 3.0.38
- Conditions the display of the splash screen only on platforms other than "desktop" (on the desktop platforms the splash screen is not supported)
- Fixes the bug: signin button is not disable when the form is invalid
- Fixes the bug: markdown doen't work when the page is refreshed
- Adds the encode of the HTML entities

### 3.0.37
- Fixes the bug: the skeleton placeholder remains active after logout 

### 3.0.36
- Fixes the bug: in the list of conversations user last messsagge is showed more times
- Adds in the list of conversations (active and archived) the placeholder 'No conversation yet' displayed when there aren't conversation
- Manages the title on the browser tab when new messages are received: indication of the number of new messages that are received when the tab is not active
- Fixes the bug: canned responses are called even if the slash ('/') is not at the beginning of the sentence
- Conditions the canned responses call to the existence of the project id
- Centers the placeholder message "Still no message here..."

### 3.0.35
- Adds a tooltip in the logged user profile panel that displays the user's id and the ability to copy it by clicking on the avatar
- Replaces in the list of conversations (active and archived) the text 'loading' with a skeleton placeholder
- Replaces in the detail of the conversation the image and the text "text new conversation + button" with the text "Please select a chat to start messaging"
- Fixes the bug: in the list of conversations user last messsagge is showed more times

### 3.0.34
- Fixes the bug: in the right side panel of "direct" conversations the "Advanced" accordion opens only once
- Fixes the bug: in the conversation list message text goes on a new line when there is the image icon
- Fixes the bug: in the list of conversations the 'archive conversation' button is displayed fixed on the right and not on mouseover

### 3.0.33
- Changes dashboard url

### 3.0.32
- Changes dashboard url

### 3.0.31
- test Native uploadEngine 

### 3.0.30
- Added image skeleton while load image
- Improved uploaded images styles 
- Added Native-Image-repo service

### 3.0.29
- Fixes the bug: "Cannot read property 'forEach' of undefined" when subscriptions are undefined
- Fixes the bug: user's profile photo is not displayed in the right side panel of "direct" type conversations
- Fixes the bug: user's profile photo is not displayed in the conversation header
- Fixes the bug: users' profile pictures are not displayed in the left panel "write to"
- Fixes the bug: the same image cannot be loaded twice

### 3.0.28
- Minor improvements

### 3.0.27
- Fixes the bug: the call to get the contact details is not made on mqtt environment

### 3.0.26
- Minor improvements

### 3.0.25
- Bug fixing

### 3.0.24 
- Adds in "group" conversations the display of members belonging to the group type (avatar, name and online / offline status)
- Fixes the bug: in the setInfoSupportGroup method the project ID is taken from the detail attributes of the group which may not be available (now it is taken from 'conversatioWith')
- Adds autofocus in the "send message" text area
- Fixes the bug: files in the mqtt environment are not loaded

### 3.0.23
- Fixes the bug: the avatar image of the logged in user is not displayed in the left menu "profile-info"
- Fixes the bug: the group names are incorrect (for active and archived conversations)
- Adds the component "advanced-info-accordion"
- Adds the "closeSupportGroup" method to archive support group conversations
- Modify the "deleteConversation" method to archive conversations of type "direct" and "group" (deleted the query string "forall = true")
- Adds the "generateGroupAvatar" method in the conversation-detail.page
- Adds the input "groupDetails" to the "app-info-content" component
- Displays an image icon in the conversation list if the conversation type is image
- Enhances right sidebar for "direct" conversations
- Implements the right sidebar for group type conversations (in progerss)
- Improves "actionScrollBottom" method
- Fixes the bug: "startsWith" of undefined in the method "isGroup"

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
- Handled archivedconversations service in dispose method of chat-manager
- Bug fixed on logout
- Bug fixed chat21client undefined in MqttArchivedConversationsHandlerService
- Renamed group-service with groups-handler.service
- Added MQTTArchivedConversationsHandler in the archivedConversationsHandlerFactory
- Adds the ability to manage responses with the project's 'canned responses' and select them with the keyboard's up and down arrows

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