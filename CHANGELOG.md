# chat21-ionic ver 3.0

### 3.0.54-RC2
- Fixes the bug: canned responses are not loaded
- Adds backward compatibility: loading of canned responses for old projects

### 3.0.54-RC1
- Moves FCM property "VAPID" to environments
- Adds FCM "VAPID" property to env.sample, chat-config.json and chat-config-template.json files
- Enhances the firebase-messaging-sw.js

### 3.0.53-RC6
- Adds "VAPID" in the getToken() method of the "firebase-notification.service"
- Adds log in the "firebase-notification.service"

### 3.0.53-RC5
- Push notification debug

### 3.0.53-RC4
- Enhances the service worker postMessage method 

### 3.0.53-RC3
- Enhances listenToNotificationCLick() method and rename it to listenToSwPostMessage()

### 3.0.53-RC2
- Commented the method listenToNotificationCLick() 

### 3.0.53-RC1
- Fixes the bug: sometimes the message sender name displayed in the header is different from the one displayed in the conversation list
- Fixes the bug: duplicate push notifications
- Increase the height of the selectable message in the conversation list to prevent the 'Archive' icon and the sender name text from overlapping the string indicating the message arrival time
- Updates the avatars background colors
- Fixes the bug: 404 error when trying to view the profile picture of "support-group" conversations requesters
- Adds the date the message was sent to the list of archived conversations
- Translates the date "how long ago" the message was sent in the conversation list


### 3.0.52-beta
- Replaces the label "conversation ID" with "user ID" in the accordion available in the panel "conversation info" of direct conversations
- Adds the ability to change the log level via the query-string parameter "logLevel"
- Fixes the bug: clicking on a push notification, if it is a "direct" conversation, the correct conversation is not selected after redirection

### 3.0.51-beta
- Enhances the style of the search bar in the contact list
- Adds the ability to upload a file by dragging it to the chat area
- Fixes the bug: Chat scrolls up when file preview page opens after dragging the file or image 
- Fixes the bug: the 'loading bubble' is not displayed if the last message is at the bottom of the chat area
- Fixes the bug: in the "upload preview page" the file icon in the footer is not displayed correctly if the file name is on two lines
- Adds backward compatibility for viewing conversation details for "support group" type conversations in the "Conversation Information" panel
- Displays the text "No information available" in the right side panel "Conversation Information" when no information on the selected conversation is found

### 3.0.50-beta
- Fixes the bug: in the right side panel 'info group' the loading of members fires twice
- Fixes the bug: autofocus doesn't always work
- Fixes the bug: browser tab title sounds and blinks even if the message is sent by the logged in user
- Fixes the bug: browser tab title sounds and blinks if the user change tab during page refresh
- Fixes the bug: browser tab title sounds and blinks if the user change tab during page refresh
- Fixes the bug: after uploading the image via drag-and-drop, if the user opens or closes the right side panel or opens another conversation, the image upload preview modal window reopens
- In the package.json: changes the name of the author + updates version + adds "cordova-android-support-gradle-release"  + downgrade "cordova-android" from the version 9.0.0 to 6.2.3
- Replaces, in conversation list, when the logged user send an image the markdown with the string "You sent an image" and when send a file with the string "You sent an attachment"
- Displays the attach icon in the conversation list if the conversation type is "file"
- Fixes the bug: if an image without text is sent as the first message, the conversation does not appear in the conversation list

### 3.0.49-beta
- Replaces in "chat-config-template.json" the value "${TENANT}" of the property "tenant" in "${FIREBASE TENANT}"

### 3.0.48-beta
- Update environments by moving the "tenant" environment variable to the "firebaseConfig" object

### 3.0.47-beta
- Changes the obtaining of the "tenant" environment variable moved inside the "firebaseConfig" configuration
- Removes unused services "chat-contacts-synchronizer.ts" (class "ChatContactsSynchronizer") and "database.ts" (class DatabaseProvider)
- Moves the environment variable 'tenant' in the object "firebaseConfig" of the files chat-config.json, chat-config-template.json; updated README.md
- Fixes the bug: after logging out the list of conversations is still visible
- Fixes the bug: modal "login" is sometimes loaded twice after logout
- Downgrades the mqtt library from version 4.2.8 to 4.1.0
- Check if the serviceWorker exists before to append 'addEventListener' (fixes the bug addEventListener of undefined)

### 3.0.46-beta
- Modifies the "logger service" to accept only values of string type from the "logLevel" environments property (Error < Warn < Info < Debug)
- Updates the README.md
- Replaces the value of the "logLevel" property of numeric type with the corresponding value of type string in the env.sample and chat-config.json files
- Adds unit tests

### 3.0.45-beta
- Adds the ability to display the canned responses by pressing '/' anywhere in the message
- Fixes the bug: in group side panel are not displayed the members

### 3.0.44-beta
- Fixes the bug: When a canned response is selected from the keyboard and enter is pressed, the slash character "/" is sent as a message
- Fixes the bug: default log level is undefined if it is not setted in the eviroment.*

### 3.0.43-beta
- Fixes the bug: logger of undefined in firebase-notifications and in app.component
- Fixes the bug: "el" of undefined in "conversation-detail.page"
- Fixes the bug: Canned responses are not displayed

### 3.0.42-beta.1.19
- Fixes the bug: uploading images by dragging to the "conversation detail" area does not work if the image is dragged to an area without messages

### 3.0.42-beta.1.18
- Improves logger service
- Fixes the bug: with MQTT enviroment it is not possible to know changes in the conversation

### 3.0.42-beta.1.17
- Note: this version has been published under the subfolder "chat5"
- Adds the right side panel that allows the selection of projects to which the current user belongs and the display of unassigned conversations 
- Fixes the bug: Property 'addUploadingBubbleEvent' does not exist on type 'ConversationDetailPage'.

### 3.0.42-beta.1.16
- Bug fixed: the selected image preview popup window opens twice if after selecting the image dragging it in the chat area, the image is selected pasting it in the 'send message' texarea,
- Prevents the user from pasting non-image files into the 'send message' textarea 
- Displays an error message when files that are not of type image are pasted in the "send message" text area
- Displays an error message when files that are not of type image are dragged into the chat area

### 3.0.42-beta.1.15
- Adds the ability to select an image to upload by drag it in the chat area
- Adds the ability to upload an image or file by pressing the "Enter" keyboard key
- Fixes the bug: the placeholder in the textarea 'send message' isn't responsive and when it is on two lines of text it overlaps the chat content
- Fixes the bug: if the canned responses are called on group type or direct type conversations, an error is thrown as the project id is not available

### 3.0.42-beta.1.14
- Minor improvements

### 3.0.42-beta.1.13
- Fixes the bug: if the message inserted in the textarea has more lines of text, that textarea overlaps the chat content
- Adds the ability to select an image to upload by paste it in the 'send message' textarea
- Fixes the bug: the placeholder in the textarea 'send message' isn't responsive and when it is on two lines of text it overlaps the chat content

### 3.0.42-beta.1.12
- Renames the 'temp' folder in 'chatib'
- Improves the button to attach files / images 
- Changes the endpoint where images and files are saved in the 'firebase-upload' service
- Adds the ability to upload any file type
- Adds the extension and name of the file that will be uploaded into the popup modal preview
- Displays an error message if the file upload failed
- Fixes the bug: if the uploaded file has a size of 0 bytes, the "bubble spinner" is displayed twice and the second remains visible
- Fixes the bug: the user ID and uiid are added to the downloaded file name
- Adds in the environments the 'fileUploadAccept' key set by default to accept the upload of any type of file and binds the value in message-text-area
- Changes the Log Level number values
- Decreases the display delay of the message tooltips (from 1500ms to 500ms)
- Adds in chat-config-template.json, chat-config.json and env.sample the keys "fileUploadAccept" and "logLevel"
- Changes in the environments the default value of the log level to 1
- Updates the mqtt library to the latest version (4.2.8) 

### 3.0.42-beta.1.11
- Improves the "push notifications service worker" and in conversations-list-page the method listenToNotificationCLick()
- Changes in the "precence.service" and "typing.service" the occurrences where the "tenant" property is obtained from the environment rather than from 'appConfig'

### 3.0.42-beta.1.10
- Improves the "push notifications service worker"

### 3.0.42-beta.1.9
- Adds logs in "firebase-messaging-sw.js" and in "conversations-list.page.ts" for push notification test

### 3.0.42-beta.1.8
- Handles the responses of the 'signInWithEmailAndPassword' method: displays a toast in case of error and a spinner waiting for the response
- Adds in the "login component" the links to the dashboard's pages "reset password" and "signup"
- Adds in the "login component" the display of validation errors of the authentication form 
- Adds the preview of the selected SVG image in image/file preview popup 
- Fixes the bug: "fileSelected of undefined" when the image/file preview popup is closed without any image or file being selected
- Adds the check of the pushEngine key set to "none" in the "notificationsServiceFactory" function of app.module
- Changes occurrences where "tenant" is obtained from "environment" by getting it from "appConfig" (app.component.ts, info.content.component.ts, conversation-detail.page, conversation-list.page)
- Adds in info-message.component.html the pipe htmlEntiesEncode
- Updates in the firebase-messaging-sw.js the version of Firebase SDK imported and replaces the deprecated method "setBackgroundMessageHandler()" with the new onBackgroundMessage()
- Removes the dependecies of the "appConfig" from the "notifications classes"
- Removes imageUrl from setConversationAvatar utils function 
- Fixed the bug: if pushEngine is setted to none are called the method getNotificationPermissionAndSaveToken()
- Adds the "tenant" property in chat-config and chat-config-template
- Fixed the bug: the logger is not displayed
- Adds the ability by clicking on a push notification to open the chat, that is in background or that is closed, directly to the conversation to which the push notification refers
- Renames FirebaseGroupHandler in FirebaseGroupsHandler,
- Removes unused components (conversation-archived-list and current-user-service)

### 3.0.42-beta.1.7
- Adds the Html entities encode pipe and removes the entities encode from the sendMessage method
- Adds the abstract class "notification.service" and the classes "firebase-notifications" and "mqtt-notifications"

### 3.0.42-beta.1.6
- Disables the dark mode
- Fixed the bug: in pre environment the the uploadEngine key is set to 'native'

### 3.0.42-beta.1.5
- Sets in pre: the value of the key chatEngine to 'firebase', the value of the key uploadEngine to 'firebase' and the value of the key pushEngine to 'firebase'

### 3.0.42-beta.1.4
- Updated in pre environment the endpoints of "dashboardUrl" to the Dashboard latest versions (2.1.70-beta.1.6)

### 3.0.42-beta.1.3
- Fixes the bug: if the uploadEngine key is set to native images and files are not upload
- Sets in pre: the value of the key chatEngine to 'mqtt', the value of the key uploadEngine to 'native' and the value of the key pushEngine to 'none'

### 3.0.42-beta.1.2
- Adds push notifications
- Updates firebase SDK to the 8.6.7 version
- Changes the import of firebase 'import * as firebase from "firebase/app"' with 'import firebase from "firebase/app"'

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
- Changes the mqtt library (v4.2.6) loading: from external loaded in index.html to local loaded in angular.json
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