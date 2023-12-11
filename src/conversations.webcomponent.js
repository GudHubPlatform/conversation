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

        super.render(html);
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