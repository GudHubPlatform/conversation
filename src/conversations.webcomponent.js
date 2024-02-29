import GhHtmlElement from "@gudhub/gh-html-element";
import './components/createConversation.webcomponent.js';
import html from "./send-message.html";
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

        if(!this.model || !this.model.data_model.messengers) {
            const iconsStorage = gudhub.ghconstructor.angularInjector.get('iconsStorage');
            const svg = iconsStorage.getIcon("speech_bubble", "a0a7ad", "40px");
            super.render(svg);
            return;
        }

        for(const index of Object.keys(this.model.data_model.messengers)) {
            const messenger = this.model.data_model.messengers[index];
            
            this.messengers[index] = {
                token: messenger.messenger_settings.bot_token,
                messenger_user_id: await gudhub.getFieldValue(this.app_id, this.item_id, this.model.data_model.messengers[index].messenger_settings.user_id_field),
                photo_field_id: this.model.data_model.messengers[index].messenger_settings.photo_field,
                messenger: messenger.messenger_name,
            }

            if(messenger.messenger_settings.use_threads) {
                this.messengers[index].message_id_for_threads = await gudhub.getFieldValue(this.appId, this.itemId, messenger.messenger_settings.thread_field_id);
            }
        }

        super.render(html);
        
        // Get conversation from another component with dispatch event and check if conversation exist for show/hide create channel button in slack
        this.addEventListener("chat_init", async function(event) {
            const { conversation } = event.detail;

            const selectedOption = this.querySelector('.messenger-select');

            let messenger_id = true, thread_id = false;

            for(const index in this.messengers) {
                messenger_id = this.messengers[index].messenger_user_id;
                thread_id = await gudhub.getFieldValue(this.app_id, this.item_id, this.model.data_model.messengers[index].messenger_settings.thread_field_id)
            }

            selectedOption.addEventListener('change', async (event) => {

                const createGroupBtn = this.querySelector('slack-create-conversation');
                const sendBtn = this.querySelector('.send_button');

                if(event.target.value === 'slack' && !conversation.messages.length && !messenger_id) {
                    createGroupBtn.style.display = 'block';
                    sendBtn.style.display = 'none';
                } else {
                    sendBtn.style.display = 'block';
                    createGroupBtn.style.display = 'none';
                }
            });

            const options = this.querySelectorAll(`.messenger-select option`);
            for(let i = 0; i < options.length; i++) {
                const option = options[i];
                if(option.dataset.id == conversation.messages[conversation.messages.length - 1]?.page_id) {
                    option.setAttribute('selected', '');

                    if(option.value == 'slack' && !conversation.messages.length && !messenger_id) {
                        const createGroupBtn = this.querySelector('slack-create-conversation');
                        const sendBtn = this.querySelector('.send_button');
                        createGroupBtn.style.display = 'block';
                        sendBtn.style.display = 'none';
                    }
                }

                if(options.length === 1 && option.value === 'slack' && !messenger_id && !this.model.data_model.messengers[0].messenger_settings.use_threads) {
                    const createGroupBtn = this.querySelector('slack-create-conversation');
                    const sendBtn = this.querySelector('.send_button');
                    createGroupBtn.style.display = 'block';
                    sendBtn.style.display = 'none';
                }

                if(this.model.data_model.messengers[0].messenger_settings.use_threads && !thread_id) {
                    const sendBtn = this.querySelector('.send_button');
                    const createThreadBtn = this.querySelector('.create_thread');
                    sendBtn.style.display = 'none';
                    createThreadBtn.style.display = 'block';
                }
            }
        });
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

    async sendMessage(element) {
        event.preventDefault();

        const loader = this.querySelector('.send_message_loader');
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
        loader.style.right = '75px';
        button.setAttribute('disabled', '');

        const token = await gudhub.getToken();
        const res = await fetch(`${gudhub.config.node_server_url}/integrations?token=${encodeURIComponent(token)}`);
        const integrations = await res.json();
        const slackIntegration = integrations.data.find(integration => integration.service_id === 'slack' && integration.field_id === this.fieldId);

        for(const index of Object.keys(this.model.data_model.messengers)) {
            const messenger = this.model.data_model.messengers[index];
            
            this.messengers[index].messenger_user_id = await gudhub.getFieldValue(this.app_id, this.item_id, this.model.data_model.messengers[index].messenger_settings.user_id_field);

            if(messenger.messenger_settings.use_threads) {
                this.messengers[index].message_id_for_threads = await gudhub.getFieldValue(this.appId, this.itemId, messenger.messenger_settings.thread_field_id);
            }
        }

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
                    item_id: this.item_id,
                    user_id: this.activeUserId,
                    message_id: this.messengers[messengerSelect.selectedIndex].message_id_for_threads,
                    page_id: this.model.data_model.messengers[messengerSelect.selectedIndex].messenger_settings.page_id || slackIntegration.service_user_id,
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
                    item_id: this.item_id,
                    user_id: this.activeUserId,
                    message_id: this.messengers[messengerSelect.selectedIndex].message_id_for_threads,
                    page_id: this.model.data_model.messengers[messengerSelect.selectedIndex].messenger_settings.page_id || slackIntegration.service_user_id,
                    text
                })
            });

            loader.style.display = 'none';
            button.removeAttribute('disabled');
            textarea.value = '';
        }

        this.value = 0;

    }

    async createThread() {

        const token = await gudhub.getToken();
        const res = await fetch(`${gudhub.config.node_server_url}/integrations?token=${encodeURIComponent(token)}`);
        const integrations = await res.json();
        const slackIntegration = integrations.data.find(integration => integration.service_id === 'slack' && integration.field_id === this.fieldId);

        const messengerSelect = this.querySelector('.messenger-select');
        const messenger = messengerSelect.options[messengerSelect.selectedIndex].value;

        const loader = this.querySelector('.send_message_loader');

        loader.style.right = '125px';

        loader.style.display = 'block';

        const response = await fetch(`${gudhub.config.node_server_url}/conversation/thread/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messenger,
                messenger_user_id: this.messengers[messengerSelect.selectedIndex].messenger_user_id,
                app_id: this.app_id,
                field_id: this.field_id,
                item_id: this.item_id,
                user_id: this.activeUserId,
                service_user_id: slackIntegration.service_user_id,
                thread_field_id: this.model.data_model.messengers[messengerSelect.selectedIndex].messenger_settings.thread_field_id,
                text: await gudhub.getFieldValue(this.appId, this.itemId, this.model.data_model.messengers[messengerSelect.selectedIndex].messenger_settings.user_name_field_id)
            })
        });

        loader.style.display = 'none';

        const sendBtn = this.querySelector('.send_button');
        const createThreadBtn = this.querySelector('.create_thread');
        sendBtn.style.display = 'block';
        createThreadBtn.style.display = 'none';
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

}

if(!customElements.get('gh-conversations')){
    customElements.define('gh-conversations', GhConversations);
}