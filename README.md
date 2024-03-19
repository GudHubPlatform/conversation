# Conversations

This gh-element provides feature of chatting through available messengers:

## Available messengers

1. Telegram - for **communication with bot** in real-time, **for set up use bot token** and paste it to settings.
2. Viber - **communication directrly with bot** which created on [Viber Developer site](https://developers.viber.com/docs/api/rest-bot-api/), **for set up use bot token**.
3. Facebook Messenger - this messenger **require business page in Facebook** for future communication, **for set up use login Facebook button in settings**.
4. Slack - communication **only in channels** (groups), **for set up use login button in settings**.

## Conversations Methods and Components

There are 2 main components:

1. The main component of conversations is the `GhConversations` class, which contains methods for working with messages and users. The main aims of this component is init conversation in `onInit` method and send messages in `sendMessage` method. There are some additional methods here:

- `createThread()` - specific method for **Slack**, which send a new message to channel and save thread id in field for future sending messages in thread.
- `showErrorMessage(message:string)` - method for showing error message to user, if gets some errors from backend.
- `getFileType(file:object)` - helpful method for `sendMessage` which help to check uploaded file extension.
- `uploadFileToGudHub(file:object)` - for sending files to any messenger firstly we need upload it on GudHub. This method hepls upload file to GudHub. This function **returns Promise** with link to this file.

2. The second is `GhChat` - component for render messages in chat. Available methods:

- `onInit()` - method which called automatically **when component insert into DOM**. It's use for init all necessary data from server and render chat.
- `addUserToConversation()` - here we get user info (name, id, icon) and add it to special store in class.
- `addSubscriberToNewMessage()` - for get messages from server and render it in chat we need **init listener on new message event**. This method do this job.
- `getConversations()` - async method for **get all conversations** via selected messenger and set messenger user if it doesn't exist.
- `addMessageToConversation(message:string)` - adds message to the conversation list and render it in chat.
- `scrollChatToBottom()` - method for scrolling chat to the end after component inited.

## Additional Components

Also we have some additional components for specific messenger. For example: 
- `createConversation.webcomponent` - this component used for **create channel and conversation in Slack**.
- `slack.oauth` - button for [authorization via Slack](https://api.slack.com/legacy/slack-button). After click on it you will be redirected to successful connection page.
- `facebookLogin.directive` - angular.js directive for Facebook Login Button. It's connect facebook with GudHub and conversations.
- `webhookSetter.directive` - angular.js directive that sets webhooks for Viber/Telegram. In this directive we send request to node server for set webhook via selected messenger.
- `unreadMessages.webcomponent` - special component for render unread messages in chat and mark as read or unread all messages.