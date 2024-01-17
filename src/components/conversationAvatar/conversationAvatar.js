import GhHtmlElement from '@gudhub/gh-html-element';
import html from './avatar.html';

class GhAvatar extends GhHtmlElement {

    constructor() {
        super();

        this.url;

        this.name;

        this.bgClass;
    }

    async onInit() {
        this.getAttributes();
        this.generateClassForName();
        
        super.render(html);
    }

    getAttributes () {
        this.url = this.getAttribute('url');

        this.name = this.getAttribute('name');
    }

    generateClassForName() {
        
        // This colors gets from constants in gudhubclient
        const colors = ['red', 'green', 'blue', 'yellow', 'black', 'gray'];
        let nameHashCode = 0;

        for (let i = 0; i < this.name.length; i++) {
            nameHashCode += this.name.charCodeAt(i) * Math.pow(31, i % this.name.length)
        };

        this.bgClass = `bg-${colors[Math.abs((nameHashCode % colors.length))]}`;
    }
}

if(!customElements.get('conversation-avatar')){
    customElements.define('conversation-avatar', GhAvatar);
}