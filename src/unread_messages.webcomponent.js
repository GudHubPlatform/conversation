import GhHtmlElement from '@gudhub/gh-html-element';

class UnreadMessages extends GhHtmlElement {

    constructor() {
        super();
        this.appId;
        this.itemId;
        this.fieldId;
        this.value;
    }

    async onInit() {

        const html = /*html*/
        `<div class="count_wrapper">
            <div onclick="togglePopup()" class="chat_messages ${this.value == 0 ? 'read_all' : ''}">
                <span class="unread_count">${this.value > 0 ? this.value : ''}</span>
            </div>
            <div class="status_messages popup">
                <span class="action" onclick="toggleStatus()"> ${this.value > 0 || this.value < 0 ? 'Mark as Read' : 'Mark as Unread'}</span>
        </div>`
        super.render(html);
    }

    togglePopup() {
        const popup = this.querySelector('.status_messages');
        popup.classList.toggle('show');
    }

    toggleStatus() {
        const countEl = this.querySelector(".unread_count");
        const chatMessages = this.querySelector('.chat_messages');
        const action = this.querySelector('.action');

        if(this.value > 0 || this.value < 0) {
            countEl.innerHTML = "";
            chatMessages.classList.add('read_all');
            this.value = 0;
            action.textContent = "Mark as Unread";
        } else {
            this.value = -1;
            chatMessages.classList.remove('read_all');
            action.textContent = "Mark as Read";
        }

        this.togglePopup();
    }

    getAttributes() {
        this.appId = this.getAttribute('app-id');
        this.itemId = this.getAttribute('item-id');
        this.fieldId = this.getAttribute('field-id');
        this.value = this.getAttribute('value');
    }

    onUpdate() {
        const countEl = this.querySelector(".unread_count");
        const chatMessages = this.querySelector('.chat_messages');
        const action = this.querySelector('.action');
        if(this.value == 0) {
            countEl.innerHTML = "";
            chatMessages.classList.add('read_all');
            action.textContent = "Mark as Unread";
        } else {
            if(this.value > 0) {
                chatMessages.classList.remove('read_all');
                countEl.innerHTML = this.value;
            }
        }
    }
}

if(!customElements.get('unread-messages-count')){
    customElements.define('unread-messages-count', UnreadMessages);
}