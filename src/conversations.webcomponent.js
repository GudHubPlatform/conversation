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
            if(messenger.enabled) {
                this.messengers[index] = {
                    token: messenger.bot_token,
                    enabled: messenger.enabled,
                    messenger_user_id: await gudhub.getFieldValue(this.app_id, this.item_id, messenger.user_id_field),
                    photo_field_id: messenger.photo_field
                }
            }
        }

        this.conversation = await this.getConversations();

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

        super.render(html);

        this.scrollChatToBottom();

        gudhub.on('gh_model_update', { app_id: this.app_id, field_id: this.field_id }, this.modelUpdated.bind(this));

        gudhub.on('conversations_message_received', { app_id: this.app_id, field_id: this.field_id }, this.messageReceived.bind(this));
    }

    async modelUpdated() {
        const model = await gudhub.getField(this.app_id, this.field_id);

        for(const index of Object.keys(model.data_model.messengers)) {
            const messenger = model.data_model.messengers[index];
            if(messenger.enabled && messenger.bot_token) {
                await fetch('https://development.gudhub.com/api/services/conversation/set-webhook', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token: messenger.bot_token,
                        app_id: model.app_id,
                        field_id: model.field_id,
                        messenger: index,
                        gudhub_user_id: gudhub.storage.getUser().user_id
                    })
                })
            }
        }
    }

    messageReceived(_event, response) {
        if(this.app_id == response.data.app_id && this.field_id == response.data.field_id && this.conversation.users.find((user) => user.user_id == response.data.messenger_user_id)) {
            const message = response.data.message;
            message.messenger = response.data.messenger;
            this.conversation.messages.push(message);
            super.render(html);
            this.scrollChatToBottom();
        }
    }

    scrollChatToBottom() {
        this.querySelector('.chat').scrollTop = this.querySelector('.chat').scrollHeight;
    }

    async sendMessage(element) {
        event.preventDefault();
        const text = element.querySelector('textarea').value;
        const messengerSelect = this.querySelector('.messenger-select');
        const messenger = messengerSelect.options[messengerSelect.selectedIndex].value;
        
        const response = await fetch('https://development.gudhub.com/api/services/conversation/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: messenger,
                messenger_user_id: this.messengers[messenger].messenger_user_id,
                app_id: this.app_id,
                field_id: this.field_id,
                user_id: this.activeUserId,
                text
            })
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

        for(const messenger of Object.keys(this.messengers)) {
            const response = await fetch(`https://development.gudhub.com/api/services/conversation/get-conversation?app_id=${this.app_id}&field_id=${this.field_id}&user_id=${encodeURIComponent(this.messengers[messenger].messenger_user_id)}&messenger=${messenger}`);
            try {
                const json = await response.json();
                if(!json) {
                    continue;
                }
                if(!json.user) {
                    const userResponse = await fetch(`https://development.gudhub.com/api/services/conversation/update-messenger-user`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            app_id: this.app_id,
                            item_id: this.item_id,
                            field_id: this.field_id,
                            messenger: messenger,
                            user_id: this.messengers[messenger].messenger_user_id,
                            photo_field_id: this.messengers[messenger].photo_field_id
                        })
                    });

                    const userJson = await userResponse.json();

                    conversation.users.push({
                        fullname: `${userJson.first_name} ${userJson.last_name ? userJson.last_name : ''}`,
                        avatar_512: userJson.photo,
                        user_id: this.messengers[messenger].messenger_user_id
                    });

                } else {

                    conversation.users.push({
                        fullname: `${json.user.first_name} ${json.user.last_name ? json.user.last_name : ''}`,
                        avatar_512: json.user.photo,
                        user_id: this.messengers[messenger].messenger_user_id
                    });

                }
                const messages = json.messages.map((message) => {
                    message.messenger = messenger;
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

        console.log(conversation);

        return conversation;
    }

    disconnectedCallback() {
        gudhub.destroy('gh_model_update', { app_id: this.app_id, field_id: this.field_id }, this.modelUpdated.bind(this));
        gudhub.destroy('conversations_message_received', { app_id: this.app_id, field_id: this.field_id }, this.messageReceived.bind(this));
    }

}

if(!customElements.get('gh-conversations')){
    customElements.define('gh-conversations', GhConversations);
}