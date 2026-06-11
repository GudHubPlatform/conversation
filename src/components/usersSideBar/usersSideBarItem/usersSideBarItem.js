import GhHtmlElement from '@gudhub/gh-html-element';
import html from './usersSideBarItem.html';

class GhUserSideBarItem extends GhHtmlElement {

    constructor() {
        super();
        this.user = null;
    }

    async connectedCallback() {
        this.getAttributes();

        super.render(html);

        this.user = await gudhub.getUserById(this.userId);

        if(!this.user) {
            this.remove();
            return;
        }

        super.render(html);
    }

    getAttributes() {
        this.userId = this.getAttribute('user-id');
    }
}

if(!customElements.get('gh-user-side-bar-item')){
    customElements.define('gh-user-side-bar-item', GhUserSideBarItem);
}
