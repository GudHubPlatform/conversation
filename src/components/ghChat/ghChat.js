import GhHtmlElement from '@gudhub/gh-html-element';
import html from './ghChat.html';
import resizeObserver from './resizeObserver.js';

class GhChat extends GhHtmlElement {

    constructor() {
        super();
    }

    async onInit() {

        const loaderHtml =
        `<div class="chat_loader loader">
            <span></span>
        </div>`;

        super.render(loaderHtml);

        await gudhub.ghconstructor.getInstance('avatar');

        this.getAttributes();

        this.activeUserId = gudhub.storage.user.user_id;
        this.model = await gudhub.getField(this.app_id, this.field_id);

        this.messengers = document.querySelector('gh-conversations').messengers;

        this.userImagesFields = [];
        for(let i in this.messengers) {
            if(!this.userImagesFields.find(fieldId => fieldId === this.messengers[i].photo_field_id)) {
                this.userImagesFields.push(this.messengers[i].photo_field_id);
            }
        }

        if(!this.model.data_model.messengers) return;

        this.conversation = await this.getConversations();

        if(this.conversation.messages) {
            await this.addUserToConversation();
        }

        const loader = this.querySelector('.chat_loader');
        loader.style.display = 'none';

        super.render(html);

        this.addSubscriberToNewMessage();

        this.dispatchEvent(new CustomEvent("chat_init", {
            bubbles: true,
            detail: { conversation: this.conversation }
        }));

        resizeObserver.subscribe();

        // Hard fix - used for render all images and scroll down of chat
        setTimeout(() => {
            this.scrollChatToBottom();
        }, 1000)
    }

    async addUserToConversation(){

        const idsFromMessengers = Object.keys(this.messengers).reduce((acc, messenger) => {
            if(!acc.includes(this.messengers[messenger].messenger_user_id)) {
                acc.push(this.messengers[messenger].messenger_user_id);
            }

            return acc;
        }, []);

        const conversationGudHubUsersIds = this.conversation.messages.reduce((acc, message) => {
            if(!idsFromMessengers.includes(message.user_id) && !acc.includes(message.user_id) && Boolean(Number(message.user_id))) {
                acc.push(message.user_id);
            }
            return acc;
        }, []);

        const gudhubUsers = await Promise.all(conversationGudHubUsersIds.map(async (user_id) => {
            const user = await gudhub.getUserById(user_id);
            return user;
        }));

        if(gudhubUsers.length > 0) {

            const findedUser = this.conversation.users.find(user => user.user_id === gudhubUsers[0].user_id);

            if(!findedUser) {
                this.conversation.users.push(...gudhubUsers);
            }
        }

    }

    addSubscriberToNewMessage() {
        gudhub.on('conversations_message_received', { app_id: this.app_id, field_id: this.field_id }, async (_event, response) => {
            const model = await gudhub.getField(this.app_id, this.field_id);
            if(this.app_id == response.data.app_id && this.field_id == response.data.field_id && this.item_id == response.data.item_id) {
                const message = response.data.message;
                message.messenger = response.data.messenger;
                if(message.type === 'attachment') {
                    message.type = this.getFileType({ name: message.content });
                }

                const findedMessage = this.conversation.messages.find(mess => mess.timestamp == message.timestamp);
                if(!findedMessage) {
                    this.conversation.messages.push(message);
                }

                await this.addUserToConversation();

                const findedPage = model.data_model.messengers.find(m => m.messenger_settings.page_id === response.data.page_id);
                message.page_name = findedPage.messenger_settings.page_name;

                const noMessages = document.querySelector('.no_messages');
                if(noMessages) noMessages.style.display = 'none';

                this.addMessageToConversation(message);

                this.scrollChatToBottom();
            }
        });
    }

    getAttributes() {
        this.app_id = this.getAttribute('app-id');
        this.item_id = this.getAttribute('item-id');
        this.field_id = this.getAttribute('field-id');
    }

    scrollChatToBottom() {
        this.scrollTop = this.scrollHeight;
    }

    async getConversations() {
        const conversation = {
            app_id: this.app_id,
            field_id: this.field_id,
            gudhub_user_id: this.activeUserId,
            messages: [],
            users: []
        }

        for(const index of Object.keys(this.messengers)) {
            if(!this.messengers[index].messenger_user_id) {
                continue;
            }

            const messenger = this.model.data_model.messengers[index].messenger_name;
            let response;

            if(!this.model.data_model.use_messenger_id) {
                if(this.model.data_model.messengers[index].messenger_settings.use_threads && this.model.data_model.messengers[index].messenger_name == 'slack') {
                    response = await fetch(`${gudhub.config.node_server_url}/conversation/get-conversation?app_id=${this.app_id}&field_id=${this.field_id}&user_id=${encodeURIComponent(this.messengers[index].message_id_for_threads)}&messenger=${messenger}`);
                } else {
                    response = await fetch(`${gudhub.config.node_server_url}/conversation/get-conversation?app_id=${this.app_id}&field_id=${this.field_id}&user_id=${encodeURIComponent(this.messengers[index].messenger_user_id)}&messenger=${messenger}`);
                }
            } else {
                response = await fetch(`${gudhub.config.node_server_url}/conversation/get-conversation?user_id=${encodeURIComponent(this.messengers[index].messenger_user_id)}&messenger=${messenger}`);
            }

            try {
                const json = await response.json();
                if(!json) {
                    continue;
                }

                const userName = await gudhub.getFieldValue(this.app_id, this.item_id, this.model.data_model.messengers[index].messenger_settings.user_name_field_id);
                const userPhoto = await gudhub.getInterpretationById(this.app_id, this.item_id, this.messengers[index].photo_field_id, "value");

                if(!json.user) {
                    const userResponse = await fetch(`${gudhub.config.node_server_url}/conversation/update-messenger-user`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            app_id: this.app_id,
                            item_id: this.item_id,
                            field_id: this.field_id,
                            messenger: messenger,
                            user_id: this.messengers[index].messenger_user_id,
                            photo_field_id: this.messengers[index].photo_field_id,
                            token: this.messengers[index].token
                        })
                    });

                    conversation.users.push({
                        fullname: userName ? userName : 'User',
                        avatar_512: userPhoto,
                        user_id: this.messengers[index].messenger_user_id
                    });

                } else {

                    conversation.users.push({
                        fullname: userName ? userName : 'User',
                        avatar_512: userPhoto,
                        user_id: this.messengers[index].messenger_user_id
                    });

                }
                
                const messages = json.messages.map((message) => {
                    message.messenger = messenger;
                    const findedPage = this.model.data_model.messengers.find(messenger => messenger.messenger_settings.page_id === message.page_id);
                    message.page_name = findedPage?.messenger_settings?.page_name || "";
                    if(message.type === 'attachment') {
                        message.type = this.getFileType({ name: message.content });
                    }
                    return message;
                });

                conversation.messages.push(...messages);
            } catch(err) {
                continue;
            }
        }

        conversation.messages.sort((a, b) => {
            return a.timestamp - b.timestamp;
        });
        
        conversation.messages = conversation.messages.filter((message, index, array) => array.findIndex(element=>(element.timestamp === message.timestamp)) === index);

        return conversation;
    }

    getFileType(file) {
        const fileExtension = file.name.split('.').pop();

        if(['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            return 'image';
        }

        if(['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(fileExtension)) {
            return 'video';
        }

        if(['mp3', 'wav', 'ogg', 'flac', 'aac', 'webm'].includes(fileExtension)) {
            return 'audio';
        }

        return 'file';
    }

    addMessageToConversation(message) {
        const isMessageIncludeLink = message.content.includes('http');
        const messageArr = message.content.split('|');
        const [preparedLink, text] = messageArr;
        const link = preparedLink.slice(1, preparedLink.length);

        const newMessageTemplate = /*html*/`
        ${
            new Date(message.timestamp).getDate() !== new Date(this.conversation.messages[this.conversation.messages.indexOf(message) - 1]?.timestamp).getDate() ? `
                <div class="date"><span>${new Date(message.timestamp).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    })}</span></div>
            ` : ''
        }
        <div class="message ${this.activeUserId == message.user_id ? 'me' : ''}">
            <div class="user">
                <div class="messenger">
                    ${
                        message.messenger === 'telegram' ? '<img src="https://gudhub.com/modules/conversation/public/images/telegram.svg" alt="Telegram" />' : ''
                    }
                    ${
                        message.messenger === 'viber' ? '<img src="https://gudhub.com/modules/conversation/public/images/viber.svg" alt="Viber" />' : ''
                    }
                    ${
                        message.messenger === 'facebook' ? '<img src="https://gudhub.com/modules/conversation/public/images/facebook.svg" alt="Facebook" />' : ''
                    }
                    ${
                        message.messenger === 'slack' ? '<img src="https://gudhub.com/modules/conversation/public/images/slack.svg" alt="Slack" />' : ''
                    }
                </div>
                <gh-avatar-webcomponent app-id="${this.appId}" item-id="${this.itemId}" images-fields-id="${this.userImagesFields}" name="${message.user_name || this.conversation.users.find(user => user.user_id == message.user_id)?.fullname}" url="${message.photo_url || this.conversation.users.find(user => user.user_id == message.user_id)?.avatar_512}"></gh-avatar-webcomponent>
            </div>
            <div class="content">
                <div class="header">
                    <span class="name">${message.user_name || this.conversation.users.find(user => user.user_id == message.user_id)?.fullname || 'Not Found'}</span>
                    <span class="time">
                        ${new Date(message.timestamp).toLocaleTimeString(navigator.language, {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                    </span>
                    <span class="page ${!message.page_name ? 'hide' : ''}">${message.page_name}</span>
                </div>
                <p class="message">
                    ${ !message.type ? (isMessageIncludeLink ? `<a target="_blank" href="${link}">${text ? text.slice(0,text.length - 1) : ''}</a>` : message.content) : '' }
                    ${ message.type === 'image' ? `<img src="${message.content}" alt="">` : ''}
                    ${ message.type === 'video' ? `<video src="${message.content}" controls></video>` : ''}
                    ${ message.type === 'audio' ? `<audio src="${message.content}" controls></audio>` : ''}
                    ${ message.type === 'file' ? `<a href="${message.content}" download>Download file</a>` : ''}
                </p>
            </div>
        </div>`;

        const chat = document.querySelector('.chat');
        chat.insertAdjacentHTML("beforeend", newMessageTemplate);
    }

    disconnectedCallback() {
        gudhub.destroy('conversations_message_received', { app_id: this.app_id, field_id: this.field_id });
        resizeObserver.destroy();
    }
}

if(!customElements.get('gh-chat')){
    customElements.define('gh-chat', GhChat);
}