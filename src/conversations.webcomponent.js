import GhHtmlElement from "@gudhub/gh-html-element";
import html from "./chat.html";
import './style.scss';

class GhConversations extends GhHtmlElement {

    constructor() {
        super();
    }

    async onInit() {
        this.app_id = this.scope.appId;
        this.item_id = this.scope.itemId;
        this.field_id = this.scope.fieldId;
        this.activeUserId = gudhub.storage.user.user_id;
        this.model = await gudhub.getField(this.app_id, this.field_id);

        this.messengers = {};

        if(!this.model.data_model.messengers) return;

        for(const index of Object.keys(this.model.data_model.messengers)) {
            const messenger = this.model.data_model.messengers[index];
            
            this.messengers[index] = {
                token: messenger.messenger_settings.bot_token,
                messenger_user_id: await gudhub.getFieldValue(this.app_id, this.item_id, this.model.data_model.messengers[index].messenger_settings.user_id_field),
                photo_field_id: this.model.data_model.messengers[index].messenger_settings.photo_field
            }
        }

        this.conversation = await this.getConversations();

        if(this.conversation.messages) {

            const idsFromMessengers = Object.keys(this.messengers).reduce((acc, messenger) => {
                acc.push(this.messengers[messenger].messenger_user_id);
                return acc;
            }, []);

            const conversationGudHubUsersIds = this.conversation.messages.reduce((acc, message) => {
                if(!idsFromMessengers.includes(message.user_id) && !acc.includes(message.user_id)) {
                    acc.push(message.user_id);
                }
                return acc;
            }, []);

            const gudhubUsers = await Promise.all(conversationGudHubUsersIds.map(async (user_id) => {
                const user = await gudhub.getUserById(user_id);
                return user;
            }));

            this.conversation.users.push(...gudhubUsers);
        }

        super.render(html);

        this.scrollChatToBottom();

        gudhub.on('conversations_message_received', { app_id: this.app_id, field_id: this.field_id }, async (_event, response) => {
            const model = await gudhub.getField(this.app_id, this.field_id);
            if(this.app_id == response.data.app_id && this.field_id == response.data.field_id && this.conversation.users.find((user) => user.user_id == response.data.messenger_user_id)) {
                const message = response.data.message;
                message.messenger = response.data.messenger;
                if(message.type === 'attachment') {
                    message.type = this.getFileType({ name: message.content });
                }

                const findedMessage = this.conversation.messages.find(mess => mess.timestamp == message.timestamp);
                if(!findedMessage) {
                    this.conversation.messages.push(message);
                }


                const idsFromMessengers = Object.keys(this.messengers).reduce((acc, messenger) => {
                    acc.push(this.messengers[messenger].messenger_user_id);
                    return acc;
                }, []);
        
                const conversationGudHubUsersIds = this.conversation.messages.reduce((acc, message) => {
                    if(!idsFromMessengers.includes(message.user_id) && !acc.includes(message.user_id)) {
                        acc.push(message.user_id);
                    }
                    return acc;
                }, []);
        
                const gudhubUsers = await Promise.all(conversationGudHubUsersIds.map(async (user_id) => {
                    const user = await gudhub.getUserById(user_id);
                    return user;
                }));

                if(gudhubUsers) {
                
                    const findedUser = this.conversation.users.find(user => user.user_id === gudhubUsers[0].user_id);

                    if(!findedUser) {
                        this.conversation.users.push(...gudhubUsers);
                    }
                }

                const findedPage = model.data_model.messengers.find(m => m.messenger_settings.page_id === response.data.page_id);
                message.page_name = findedPage.messenger_settings.page_name;

                this.addMessageToConversation(message);

                this.scrollChatToBottom();
            }
        });
    }

    async messageReceived(_event, response) {
        const model = await gudhub.getField(this.app_id, this.field_id);
        if(this.app_id == response.data.app_id && this.field_id == response.data.field_id && this.conversation.users.find((user) => user.user_id == response.data.messenger_user_id)) {
            const message = response.data.message;
            message.messenger = response.data.messenger;
            if(message.type === 'attachment') {
                message.type = this.getFileType({ name: message.content });
            }

            const findedMessage = this.conversation.messages.find(mess => mess.timestamp == message.timestamp);
            if(!findedMessage) {
                this.conversation.messages.push(message);
            }


            const idsFromMessengers = Object.keys(this.messengers).reduce((acc, messenger) => {
                acc.push(this.messengers[messenger].messenger_user_id);
                return acc;
            }, []);
    
            const conversationGudHubUsersIds = this.conversation.messages.reduce((acc, message) => {
                if(!idsFromMessengers.includes(message.user_id) && !acc.includes(message.user_id)) {
                    acc.push(message.user_id);
                }
                return acc;
            }, []);
    
            const gudhubUsers = await Promise.all(conversationGudHubUsersIds.map(async (user_id) => {
                const user = await gudhub.getUserById(user_id);
                return user;
            }));

            if(gudhubUsers) {
            
                const findedUser = this.conversation.users.find(user => user.user_id === gudhubUsers[0].user_id);

                if(!findedUser) {
                    this.conversation.users.push(...gudhubUsers);
                }
            }

            const findedPage = model.data_model.messengers.find(m => m.messenger_settings.page_id === response.data.page_id);
            message.page_name = findedPage.messenger_settings.page_name;

            this.addMessageToConversation(message);

            this.scrollChatToBottom();
        }
    }

    scrollChatToBottom() {
        this.querySelector('.chat').scrollTop = this.querySelector('.chat').scrollHeight;
    }

    async sendMessage(element) {
        event.preventDefault();

        const loader = this.querySelector('.chat_loader');
        const textarea = element.querySelector('textarea');
        const button = element.querySelector('button');
        const text = textarea.value;
        const messengerSelect = this.querySelector('.messenger-select');
        const messenger = messengerSelect.options[messengerSelect.selectedIndex].value;

        const uploadInput = this.querySelector('.upload input');

        if(!text.length && !uploadInput.files.length) {
            return;
        }

        loader.style.display = 'block';
        button.setAttribute('disabled', '');


        if(uploadInput.files.length > 0) {

            const file = uploadInput.files[0];
            const fileType = this.getFileType(file);

            const gudhubFile = await this.uploadFileToGudHub(file);

            const response = await fetch(`${gudhub.config.node_server_url}/conversation/send-attachment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messenger,
                    messenger_user_id: this.messengers[messengerSelect.selectedIndex].messenger_user_id,
                    token: this.messengers[messengerSelect.selectedIndex].token,
                    app_id: this.app_id,
                    field_id: this.field_id,
                    user_id: this.activeUserId,
                    page_id: this.model.data_model.messengers[messengerSelect.selectedIndex].messenger_settings.page_id,
                    attachment: {
                        url: gudhubFile.url,
                        type: fileType
                    }
                })
            });

            loader.style.display = 'none';
            button.removeAttribute('disabled');

            uploadInput.value = '';

        } else {
            const response = await fetch(`${gudhub.config.node_server_url}/conversation/send-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messenger,
                    messenger_user_id: this.messengers[messengerSelect.selectedIndex].messenger_user_id,
                    token: this.messengers[messengerSelect.selectedIndex].token,
                    app_id: this.app_id,
                    field_id: this.field_id,
                    user_id: this.activeUserId,
                    page_id: this.model.data_model.messengers[messengerSelect.selectedIndex].messenger_settings.page_id,
                    text
                })
            });

            loader.style.display = 'none';
            button.removeAttribute('disabled');
            textarea.value = '';
        }

    }

    async uploadFileToGudHub(file) {

        const base64 = await this.toBase64(file);

        const response = await gudhub.uploadFileFromString({
            format: 'base64',
            source: base64.substring(base64.indexOf(',') + 1),
            file_name: file.name,
            extension: file.name.split('.').pop(),
            app_id: this.app_id,
            item_id: this.item_id,
            element_id: this.field_id
        });

        return response;

    }

    getFileType(file) {
        const fileExtension = file.name.split('.').pop();

        if(['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            return 'image';
        }

        if(['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(fileExtension)) {
            return 'video';
        }

        if(['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(fileExtension)) {
            return 'audio';
        }

        return 'file';
    }

    toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.onerror = function (error) {
                reject(error);
            };
        });
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
            const response = await fetch(`${gudhub.config.node_server_url}/conversation/get-conversation?app_id=${this.app_id}&field_id=${this.field_id}&user_id=${encodeURIComponent(this.messengers[index].messenger_user_id)}&messenger=${messenger}`);
            try {
                const json = await response.json();
                if(!json) {
                    continue;
                }
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

                    const userJson = await userResponse.json();

                    conversation.users.push({
                        fullname: `${userJson.first_name} ${userJson.last_name ? userJson.last_name : ''}`,
                        avatar_512: userJson.photo,
                        user_id: this.messengers[index].messenger_user_id
                    });

                } else {

                    conversation.users.push({
                        fullname: `${json.user.first_name} ${json.user.last_name ? json.user.last_name : ''}`,
                        avatar_512: json.user.photo,
                        user_id: this.messengers[index].messenger_user_id
                    });

                }
                const messages = json.messages.map((message) => {
                    message.messenger = messenger;
                    const findedPage = this.model.data_model.messengers.find(messenger => messenger.messenger_settings.page_id === message.page_id);
                    message.page_name = findedPage?.messenger_settings?.page_name;
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

    addMessageToConversation(message) {
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
                </div>
                <conversation-avatar app-id="${this.app_id}" name="${this.conversation.users.find(user => user.user_id == message.user_id)?.fullname}" url="${this.conversation.users.find(user => user.user_id == message.user_id)?.avatar_512}"></conversation-avatar>
            </div>
            <div class="content">
                <div class="header">
                    <span class="name">${this.conversation.users.find(user => user.user_id == message.user_id)?.fullname || 'Not Found'}</span>
                    <span class="time">
                        ${new Date(message.timestamp).toLocaleTimeString(navigator.language, {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                    </span>
                    <span class="page">${message.page_name}</span>
                </div>
                <p class="message">
                    ${ !message.type ? message.content : '' }
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
    }

}

if(!customElements.get('gh-conversations')){
    customElements.define('gh-conversations', GhConversations);
}