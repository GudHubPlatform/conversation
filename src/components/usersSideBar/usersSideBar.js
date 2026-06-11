import GhHtmlElement from '@gudhub/gh-html-element';
import html from './usersSideBar.html';

class GhUsersSideBar extends GhHtmlElement {

    constructor() {
        super();
        this.usersCache = {};
    }

    async onInit() {
        this.getAttributes();

        this.activeUserId = gudhub.storage.user.user_id;
        this.groupedUsers = await this.getGroupedUsers();

        super.render(html);
    }

    getAttributes() {
        this.appId = this.getAttribute('app-id');
        this.itemId = this.getAttribute('item-id');
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

        const users = await Promise.all((groupUsers || []).map((groupUser) => {
            if(!this.usersCache[groupUser.user_id]) {
                this.usersCache[groupUser.user_id] = gudhub.getUserById(groupUser.user_id);
            }
            return this.usersCache[groupUser.user_id];
        }));

        return users.filter(Boolean);
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
                <div class="users_sidebar__user">
                    <gh-avatar-webcomponent app-id="${this.appId}" item-id="${this.itemId}" name="${user.fullname}" url="${user.avatar_128 || user.avatar_512 || ''}"></gh-avatar-webcomponent>
                    <span class="users_sidebar__user_name">${user.fullname}</span>
                </div>
            `;
        }, '');
    }
}

if(!customElements.get('gh-users-side-bar')){
    customElements.define('gh-users-side-bar', GhUsersSideBar);
}
