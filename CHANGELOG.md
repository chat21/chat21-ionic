# chat21-ionic ver 3.0

### 3.0.61-rc24
- Handles the "writeToButton" and the 'archivedButton' environment variables if are returned as a string
- Adds the "authPersistence" key in the chat-config-template.json, chat-config.json and env.sample files

### 3.0.61-rc23
- Handles the "supportMode" environment variable if returned as a string (fixes the Docker image bugs: part of the conversation details go under the sidebar in mobile mode, the "add message as canned response" button is not displayed)
- Fixes the position of the emoji selection window pop up when the canned responses button is not visible

### 3.0.61-rc22
- Minor improvements 

### 3.0.61-rc21
- Removes cordova-plugin-device

### 3.0.61-rc20
- Updates dependencies

### 3.0.61-rc19
- Merge branch 'features/new-sidebar'

### 3.0.61-rc18
- Fix bugs: in the teammate settings drawer the logout button area is too large
- Fixed the bug: in the detail of the conversation the button messages are not aligned with the other messages

### 3.0.61-rc16
- Does not allow teammates with agent role to access the "settings sidebar"

### 3.0.61-rc15
- Increase the size of the emoji and remove the background color when it is sent or received without text
- Adds the ability to open sidebar menu items in a new tab by combining left mouse button + CMD keyboard key

### 3.0.61-rc14
- Fixes the bug: the page to which the sidebar Settings menu item redirects is not correct for team members with agent role
- Fixes the bug: right clicking on the sidebar menu items doesn't show the context menu

### 3.0.61-rc12
- Improves the alignment of left sidebar menu item icons
- Adds the ability to add a message as a canned response
- Hides the "Open canned responses" button if the "supportMode" environment variable is set to false
- Fixes the bug: "Settings" menu item in the left sidebar redirects to the "Canned responses" page instead of the "Widget" page
- Adds the ability to add a new canned response
- Fixes the bug: "Resolve conversation" from conversation detail header doesn't work on mobile
- Adds the ability to insert emoji in the message text
- Fixes the bug: on iOS mobile devices in the conversation detail the requester's avatar is not vertically aligned
- Fixes the bug: on mobile devices in  the "info profile" modal window the version number is not visible because it is on a white background
- Fixes the bug: in the "Create canned response" modal window the "Add personalisation" menu does not always work
- Adds the chat version number to the teammate details drawer
- Makes the right sidebar "Settings" menu item visible to teammates with agent role

### 3.0.61-rc11
- Fixed the bug: the "Resolve" button is displayed in the header of the details of the archived conversations
- Fixed the bug: in the header of the conversation detail the "Resolve" button remains active even after resolving the conversation
- Adds the ability to create a ticket
- Adds tooltips to the buttons available in the header of the conversation list
- Change the text of the "Conversations" menu item in the left sidebar to "Monitor"

### 3.0.61-rc10
- Fixes the bug: the Analytics icon of the left sidebar is not displayed

### 3.0.61-rc9
- Fixes the bug: the Apps icon of the left sidebar is not displayed

### 3.0.61-rc8
- Changes the icon of the "Conversations" menu item to the left sidebar
- Adds Serbian language

### 3.0.61-rc7
- Fixes the bug: while loading the app, the conversation list changes size and becomes wider
- Changes the style of the left sidebar
- Display in the "user data drawer" an avatar constructed with the initials of the logged in teammate if his profile picture is not available

### 3.0.61-rc6
- Enhances the style of the sidebar tooltips
- Fixed bug: for direct conversations opening the "info sidebar" by clicking on the teammate avatar available in the conversation detail header does not work correctly
- Fixes the bug: not all chat strings are translated into the browser language or into the selected language
- Fixes the bug: Email is broken on dashes in user details sidebar
- Displays an alert when a teammate archives a conversation from a project they are no longer a part of
- Disable the "send message" textarea when a teammate replies to a support conversation of a project he is no longer a part of
- Adds, when an image is pasted in the "send message" text area, the text of the text area as a caption of the image preview modal window
- Adds, when an image is uploaded, the text of the "send message" text area as a caption of the image preview modal window

### 3.0.61-rc5
- Fixes the bug: on mobile devices the chat content is shifted to the right
- Adds the ability to open and close the "user detail sidebar" by clicking on the avatar of the logged teammate present on the sidebar
- Fixes the bug: canned responses remain visible even if, after making a filter, the backslash is deleted
- Prevents the "open canned responses" button from inserting a backslash if another one exists before
- Hides the badge that displays the number of unassigned conversations if there are none
- Improves custom scrollbar displayed in the sidebar and in user detail sidebar 
- Adds custom scrollbars to the conversation list and to the conversation detail

### 3.0.61-rc4
- Hides the item showing unassigned conversations in the list of archived conversations
- Adds in the list of conversations to the "archive" button the tooltip "Resolve" if the conversation is of type "support" and the tooltip "Archive" if the conversation is of type "direct" or "group"
- Changes all occurrences of the "teammatesButton" environment variable to "writeToButton"
- Fixes the bug: if the sidebar is visible and the window width is less than 768px, the content of the conversation detail is not completely visible
- Moves for conversations of type "support" the "Resolve conversation" button from the dropdown menu to the header of the conversation detail

### 3.0.61-rc3
- Replaces console.log with custom loggers 
- Fixes the bug: the info support sidebar is no more displayed

### 3.0.61-rc2
- Fixes the bug: Profile picture in the sidebar does not update when logged in with another user after logging out
- Bug Fix: in the "info-profile" page avoid the "uid of undefined" error
- Adds the "user details" sidebar
- Adds the languages flags images
- Allows to close the "user details" sidebar by clicking outside it
- Adds the tooltips to the links of the sidebar
- Hides the sidebar when the teammate logs out, if the app is on a mobile device and if the environment variable "supportMode" is set to false
- Hides in the item showing unassigned conversations the button to pin a project if the app is not on a mobile device 
- Gets in the sidebar the feature tokens from the environment variables
- Install the "Roboto" font
- Changes font priority in global.scss: replace "Helvetica Neue" font with "Roboto" font
- Imports the "Poppins" font family into index.html
- Adds the "Resolve" tooltip to the "archive" button available in the conversation list
- Displays the "Resolved Conversations" button and the "Teammates" button in the header of the conversation list  based on how the "teammatesButton" and "archivedButton" environment variables are set
- Adds "teammatesButton" and "archivedButton" variables to the environments
- Adds the "TEAMMATES_BUTTON" and the "ARCHIVED_BUTTON" variables to the env.sample file
- Adds the "teammatesButton" and the "archivedButton" variables to the "chat-config-template.json" file and to "the chat-config.json" file
- Updates the section "Configuration" of the "README.md" file with the new variables "teammatesButton" and the "archivedButton" 

### 3.0.61-rc1
- Adds a sidebar that allows navigation to the dashboard

### 3.0.60
- Deploys in production

### 3.0.60-rc9
- Adds the message "All conversations served" in the conversation details section that appears when there are no active conversations
- Fixes the bug: in the item that displays the number of unassigned conversations the button "fix a project" does not go to the right in mobile mode

### 3.0.60-rc8
- Fixes the bug: "info" messages sent by "SYSTEM" are not translated
- Adds the Portuguese language
- Adds the French language
- Adds the Russian language
- Adds the Turkish language

### 3.0.60-rc7
- Adds German language
- Adds a method that translates chat texts based on the language of the browser settings if no preferred language is selected in the dashboard or based on the preferred language (ignoring the browser language)
- Manages the language used for translations from the "moment" library based on the language of the browser settings if no preferred language has been selected in the dashboard or on the preferred language selected (ignoring the browser language)
- Adds the ability to manage the visibility of canned responses in env.sample, chat-config-tempalte.json and chat-config.json
- Fixes the bug: in the 'item' that displays the pinned project and the number of the not assigned conversions  the tooltip is not correctly displayed

### 3.0.60-rc6
- Fixes the bug: push notifications are initialized even if the "pushEngine" configuration variable is set to "none"
- Adds spanish language

### 3.0.60-rc5
- Change the icon and link of the "pin button" in the item at the top of the conversation list (now opens the list of projects and not the list of new conversations)
- Add a tooltip on the switch button to change the available/unavailable status
- Adds a link to the to the new conversations at the icon that display the number of new conversations

### 3.0.60-rc4
- Translates the canned response displayed when there are not canned responses

### 3.0.60-rc3
- Enhances the item at the top of the conversation list that displays the number of new conversations of a selected project
- Fixes the bug: the loading spinner is sometimes not displayed when loading the list of unassigned conversations
- Displays as canned response "Test" when no canned responses are available
- Adds the cursor to the "Send message" textarea after the "Canned responses" button has been clicked

### 3.0.60-rc2
- Fixes the bug: in AppConfigProvider the "wsUrl" is incorrect (window.location.port is missing)

### 3.0.60-rc1
- Adds the ability to view canned responses by clicking on the button with the "flash" icon located to the left of the "Enter a message" text area

### 3.0.59.2
- Fixes the bug: when the agent refreshes the chat page and the chat is in mobile mode, the badge with the number of unassigned conversations does not work

### 3.0.59.1
- Fixes the bug: "Unable to read uid of undefined" error occurs when agent logs out
- Fixes the bug: When the agent logs into the chat and the chat is in mobile mode, no conversations are displayed
- Fixes the bug: the websocket is initialized even if the supportMode property is set to false
- Fixes the bug: when the agent refreshes the chat page and the chat is in mobile mode, the badge with the number of unassigned conversations does not work

### 3.0.59
- Deploys in production 

### 3.0.59-rc23
- Fixes the bug: the badge indicating the number of unassigned conversations does not update correctly when the project is changed
- Changes the code that prevent the chat from opening in a new browser tab if the chat tab is already open
- Publish conversations returned by subscription to websocket conversations > "on data" callback

### 3.0.59-rc22
- Minor improvements

### 3.0.59-rc21
- chat21client.js -> v0.1.9

### 3.0.59-rc20
- Improves the transition from "mobile" to "desktop" mode and vice versa by not reloading the app 

### 3.0.59-rc19
- Fixes the bug: when the chat is in "mobile" mode and from the dashboard the agent clicks on "Open chat" for a specific conversation the "back" button of the chat does not return to the list of conversations
- Fixes the bug: when the chat is in "mobile" mode and from the dashboard the agent clicks on "Open chat" for a specific conversation the chat does not display the details of the conversation

### 3.0.59-rc18
- Improves the "app-config" service

### 3.0.59-rc16
- Changes in config.xml the value of the "SplashScreen"
- Improves the method to avoid page reloading when an agent clicks the "Open Chat" button of the dashboard on the realtime and non-real time conversation list page and on the conversation detail page
- Modifies the "app-config" service by adding the ability to pass relative URLs to the websocket
- Adds "wsUrlRel" property to env.sample, chat-config-template.json and chat-config.json
- Adds a check in the "websocket-js.ts" service on the existence of the "ws" property of the "WebSocketJs" class before accessing the property "readyState"

### 3.0.59-rc15
- Implements a method in app.components that counts and stores the number of open Chat tabs
- Implements a method on the conversation list page that prevents a new chat tab from opening when the agent clicks "Open Chat" from the dashboard

### 3.0.59-rc14
- Fixes the bug: the sound that warns that a new conversation has been received does not work

### 3.0.59-rc12
- Fixes the bug: Cannot read properties of undefined (reading 'get') when "translationMap" in not yet defined
- Fixes the bug: when the log out is performed, the item with the number of new conversations remains visible in the left side panel of the conversations list

### 3.0.59-rc11
- Fixed bug: the item in the left side panel showing the number of new conversations is not displayed if there are no conversations
- Removes the "last_project" object and the "contacts" object on logout from local storage

### 3.0.59-rc10
- Changes in config.xml the site URL of the author 
- Changes the splash screen images
- Adds the "browser" platform configuration in config.xml
- Initialize in app.module.ts firebase to handle push notifications if chatEngine is "mqtt"

### 3.0.59-rc9
- Changes in the archived conversations the date format if the browser language is English
- Displays the button to open the contact list for direct conversations and the entry at the top of the conversation list showing the number of unassigned conversations for a selected project if the "supportMode" configuration property is set to true
- Adds a style rule on the unassigned conversations page that changes the background of the "ion-content" if the project list is displayed in the iframe
- Adds "supportMode" property to env.sample, chat-config-template.json and chat-config.json

### 3.0.59-rc8
- Changes the title of the modal window showing unassigned conversations from "Unassigned Conversations" to "New Conversations"
- Fixes the bug: if the "chatEngine" property value is set to "mqtt" the login modal window does not disappear even if the agent is logged in
- Fixed the value of the configuration property "dashboardUrl"

### 3.0.59-rc7
- Fixes the bug "Cannot read properties of undefined (reading 'get')" in component template showing the number of new conversations
- Fixes the bug: the value of the "supportMode" property is passed hard-coded

### 3.0.59-rc6
- Outsources the websocket URL to environments
- Improves the graphic of the element, positioned at the top of the conversation list, which displays the number of new conversations
- Adds "wsUrl" property to env.sample, chat-config-template.json and chat-config.json
- Updates environments with "wsUrl" property

### 3.0.59-rc5
- Display a "toast message" of success after that the agent has joined to an unassigned conversation and other minor improvements

### 3.0.59-rc4
- Adds an item to the top of the conversation list that shows the number of unassigned conversations for a selected project
- Adds the ability, by clicking on the element that displays the number of unassigned conversations, to view the unassigned conversations and to join to them or archive them

### 3.0.59-rc3
- Improves the method that allows to chain multiple canned responses

### 3.0.59-rc2
- Fixes the bug: on small windows, images and iframes are not the same size as the bubble message that contains them
- Adds in the "bubble-message" component a check if the metadata is an object before calling the getMetadataSize() method
- Hides the "canned responses" if there are whitespace after the forward slash "/" or if there are no whitespace before the forward slash "/"
- Fixes the bug: if the "canned responses" are selected with the mouse, the "send message" text area does not have focus
- Adds the image viewer and the ability to download an image from it
- Fixes the position of the "archive" button when the app runs on mobile devices
- Updates Android splash screen .png image

### 3.0.59-rc1
- Fixes the bug: the "send message" button remains in the "disabled" state even if it is active
- Changes the format of the date displayed in the message tooltips
- Fixes the bug: the sender's avatar is not always displayed in the messages header
- Fixes the bug: the sender's name is not always displayed in the messages header
- Fixes the bug: in the avatar-profile component the properties 'avatarUrl', 'color' and 'avatar' are private and accessible only within the class
- Fixes the bug: on ios platforms the back button in the conversation details header overlaps the avatar

### 3.0.58.1
- Fix the bug: if the "chatEngine" property value is set to "mqtt "the login modal window does not disappear even if the agent is logged in

### 3.0.58
- Changes the logic with which the 'online' / 'offline' event is published (done before by the onAuthStateChanged() method)
- Removes the setTimeout set for displaying the login window
- Executes the "goOffline" method without checking whether the token exists in memory or not

### 3.0.57
- Review of the "login" code

### 3.0.56
- Improves the auto-login method

### 3.0.55
- Distributed release in production

### 3.0.55-rc26
- Fixes the bug: the iframe is not displayed
- Fits the image caption to the width of the image

### 3.0.55-rc25
- Changes the method to get the JWT from the URL query string and the way to run the auto login

### 3.0.55-rc24
- Improves the auto-login method

### 3.0.55-RC23
- Fixes the bug: missing contact information in the header when selecting a "Direct" conversation
- Fixes the bug: by clicking on an archived chat the avatar displayed in the header does not correspond to the one displayed in the conversation list and in the right side panel "conversation info"
- Fixes the bug: sometimes auto login with JWT passed in URL as query string doesn't work
- Improves the "send message" textarea graphics
- Adds the ability to insert a new line after the current position in the message text area by pressing the key combinations "ALT + ENTER", "CTRL + ENTER", "CMD + ENTER"

### 3.0.55-RC22
- Fixes the bug: if the chat is open in multiple browser tabs when the user log in the 'goOnline' method is activated several times
- Manages the message displayed in the conversation list when the sender sends a file (replace the markdown string with the string "sent an attachment")
- Fixes the bug: if the chat is open in multiple browser tabs when the user logs out, the conversation list remains visible
- Displays the "loading bubble" while uploading an image

### 3.0.55-RC21
- Fixes the bug: if the chat is open in more than one browser tab, not all of them reconnect when the user accesses one of them

### 3.0.55-RC20
- Improve the method that solves the bug: if the chat is open on more than one tab, the previous ones disconnect
- Displays the message "sent an image" when the sender sends an image
- Removes the "setTimeout" set on the onStorageChanged event

### 3.0.55-RC19
- Fixes the bug: opening the "conversations info" side panel for support type conversations causes the chat to log out

### 3.0.55-RC18
- Fixes the bug: if the chat is open on more than one tab, the previous ones logging out

### 3.0.55-RC16
- Removes the image name displayed at the bottom of the image
- Removes the adaptation of the image caption width to the image size

### 3.0.55-RC15
- Fixes the bug: "ion-spinner" throws an error when the chat is offline
- Fixes the bug: in the component "info-group-component" if groupDetail is not defined throws the error "Cannot read hasOwnProperty of undefined"
- Fixes the bug: in the "advanced-info-accordion" component if translationMap is not defined throws the error "Cannot read properties of undefined (reading 'get')"
- Fixes the bug: in the component "user-presence.component" if translationMap is not defined throws the error "Cannot read properties of undefined (reading 'get')"
- Fixes the bug: if the image name is longer than the image width when uploading, it is displayed on the right side of the image
- Fixes the bug: if the user logs out of the dashboard and then logs in, the user in the chat is not logged in again
- Fixes the bug: if the file upload preview window is closed without sending the file, the windows does not reopen if the same file is selected
- Adds autofocus in the "caption" text area in the file upload preview window

### 3.0.55-RC14
- Implements Network service
- Displays, when the chat loses connection, the message "Waiting for network" at the top of the conversation list
- Displays, when the chat loses connection, the message "Internet is slow or not working" on the conversation details page
- Set the "user" variable to null when the user logs out of chat

### 3.0.55-RC12
- Fixes the bug: when a file is uploaded via drag & drop, the message "Failed to upload: the format is not supported" is displayed even if fileUploadAccept is set to "* / *" (accept all)
- Fixes the bug: the left side panel "conversation list" is not displayed on Safari
- Fixes the bug: on Safari, clicking a button causes the app to reload or crash
- Adds a gradient background to the avatars

### 3.0.55-RC11
- Replaces the message "No internet connection" displayed when Internet is slow or not working  with the message "Internet is slow or not working."

### 3.0.55-RC10
- Fixes the bug: Safari doesn't support the API's required to use FCM
- Fixes the bug: the drag and drop does not take into account the accepted files set in the "fileUploadAccept" environments property
- Fixes the bug: on Safari in the login modal the email and psw entered are not displayed

### 3.0.55-RC9
- Adds the left panel "projects"

### 3.0.55-RC8
- Improves backward compatibility for old conversations of the "archive", "predefined replies" features and for displaying the right "Conversation Info" panel
- Bug fixing

### 3.0.55-RC7
- Adds the message "No Internet Connection" when the chat tab is a blank page
- Adds a "toast" indicating when the chat has lost connection
- Adds action button component
- Fixes the bug: when accessing the chat without internet connection, the chat does not restart when the connection is restored
- Fixes the bug: old conversations are not archived (implemented backwards compatibility)

### 3.0.55-RC6
- Fixes the bug: when the pc starts up, if the connection is missing, the chat tab is a blank page and remains so even after the connection

### 3.0.55-RC5
- Removes the changes in version 3.0.55-RC4
- Updates the method of "app.component.ts" watchToConnectionStatus()

### 3.0.55-RC4
- Set "Auth.Persistence" to "firebase.auth().signInWithCustomToken" method
- Hardcoded the authPersistence value to 'LOCAL' in the 'localSessionStorage' service

### 3.0.55-RC3
- Fixes the bug with another solution: the sender name in the conversation list does not match the sender name in the conversation details header
- Adds Android resources
- Set the "auth Persistence" environment variable to NONE

### 3.0.55-RC2
- Adds style rules to fit the image name to its width
- Improves the method of getting Project ID from Conversation ID

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