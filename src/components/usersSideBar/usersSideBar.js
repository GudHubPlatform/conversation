import GhHtmlElement from '@gudhub/gh-html-element';
import html from './usersSideBar.html';
import './usersSideBarItem/usersSideBarItem.js';

class GhUsersSideBar extends GhHtmlElement {

    async onInit() {
        this.activeUserId = gudhub.storage.user.user_id;
        this.groupedUsers = await this.getGroupedUsers();

        super.render(html);

        if(this.groupedUsers.length) {
            this.syncHeight();
            this.heightObserver = new ResizeObserver(() => this.syncHeight());
            this.heightObserver.observe(this.closest('.conversation_layout').querySelector('.multi-chat'));
        }
    }

    // Keep the sidebar's height in sync with the chat column, so its own
    // content scrolls internally instead of growing the whole layout.
    syncHeight() {
        const multiChat = this.closest('.conversation_layout')?.querySelector('.multi-chat');
        if(!multiChat) return;
        this.style.height = `${multiChat.getBoundingClientRect().height}px`;
    }

    onDestroy() {
        this.heightObserver?.disconnect();
    }

    // Only the first group is unfolded by default, so its users are loaded upfront.
    // Other groups load their users lazily, when unfolded (see toggleGroup).
    async getGroupedUsers() {
        const groups = await gudhub.groupSharing.getGroupsByUser(this.activeUserId);

        if(!groups || !groups.length) return [];

        const groupedUsers = groups.map(group => ({
            group_id: group.group_id,
            group_name: group.group_name,
            users: null
        }));

        groupedUsers[0].users = await this.loadGroupUsers(groupedUsers[0].group_id);

        return groupedUsers.filter((group, index) => index !== 0 || group.users.length);
    }

    async loadGroupUsers(groupId) {
        const groupUsers = await gudhub.groupSharing.getUsersByGroup(groupId);

        return groupUsers || [];
    }

    async toggleGroup(element) {
        const groupElement = element.closest('.users_sidebar__group');
        const wasCollapsed = groupElement.classList.contains('users_sidebar__group--collapsed');

        groupElement.classList.toggle('users_sidebar__group--collapsed');

        if(!wasCollapsed) return;

        const group = this.groupedUsers.find(group => group.group_id == groupElement.dataset.groupId);

        if(group.users !== null) return;

        group.users = await this.loadGroupUsers(group.group_id);

        if(!group.users.length) {
            groupElement.remove();
            return;
        }

        groupElement.querySelector('.users_sidebar__group_users').innerHTML = this.renderUsers(group.users);
    }

    renderUsers(users) {
        return users.reduce((usersHtml, user) => {
            return usersHtml + `
                <gh-user-side-bar-item class="users_sidebar__user" user-id="${user.user_id}"></gh-user-side-bar-item>
            `;
        }, '');
    }
}

if(!customElements.get('gh-users-side-bar')){
    customElements.define('gh-users-side-bar', GhUsersSideBar);
}
