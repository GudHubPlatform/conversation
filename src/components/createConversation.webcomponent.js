import GhHtmlElement from '@gudhub/gh-html-element';

class CreateConversation extends GhHtmlElement {

    constructor() {
        super();
        this.appId;
        this.itemId;
        this.fieldId;
        this.value;
    }

    async onInit() {

        this.getAttributes();

        const html = /*html*/
        `<button onclick="createSlackConversation();" class="gh-btn inline create_conversation-button">
            <svg width="18px" enable-background="new 0 0 2447.6 2452.5" viewBox="0 0 2447.6 2452.5" xmlns="http://www.w3.org/2000/svg">
                <g clip-rule="evenodd" fill-rule="evenodd">
                    <path d="m897.4 0c-135.3.1-244.8 109.9-244.7 245.2-.1 135.3 109.5 245.1 244.8 245.2h244.8v-245.1c.1-135.3-109.5-245.1-244.9-245.3.1 0 .1 0 0 0m0 654h-652.6c-135.3.1-244.9 109.9-244.8 245.2-.2 135.3 109.4 245.1 244.7 245.3h652.7c135.3-.1 244.9-109.9 244.8-245.2.1-135.4-109.5-245.2-244.8-245.3z" fill="#36c5f0"/>
                    <path d="m2447.6 899.2c.1-135.3-109.5-245.1-244.8-245.2-135.3.1-244.9 109.9-244.8 245.2v245.3h244.8c135.3-.1 244.9-109.9 244.8-245.3zm-652.7 0v-654c.1-135.2-109.4-245-244.7-245.2-135.3.1-244.9 109.9-244.8 245.2v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.3z" fill="#2eb67d"/>
                    <path d="m1550.1 2452.5c135.3-.1 244.9-109.9 244.8-245.2.1-135.3-109.5-245.1-244.8-245.2h-244.8v245.2c-.1 135.2 109.5 245 244.8 245.2zm0-654.1h652.7c135.3-.1 244.9-109.9 244.8-245.2.2-135.3-109.4-245.1-244.7-245.3h-652.7c-135.3.1-244.9 109.9-244.8 245.2-.1 135.4 109.4 245.2 244.7 245.3z" fill="#ecb22e"/>
                    <path d="m0 1553.2c-.1 135.3 109.5 245.1 244.8 245.2 135.3-.1 244.9-109.9 244.8-245.2v-245.2h-244.8c-135.3.1-244.9 109.9-244.8 245.2zm652.7 0v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.2v-653.9c.2-135.3-109.4-245.1-244.7-245.3-135.4 0-244.9 109.8-244.8 245.1 0 0 0 .1 0 0" fill="#e01e5a"/>
                </g>
            </svg>
            Create Channel
        </button>`
        super.render(html);
    }

    getAttributes() {
        this.appId = this.getAttribute('app-id');
        this.itemId = this.getAttribute('item-id');
        this.fieldId = this.getAttribute('field-id');
    }

    async createSlackConversation() {

        const ghDialog = gudhub.ghconstructor.angularInjector.get('GhDialog');

            ghDialog.show({
                position: 'center_event_position',
                class: 'webhook_set_dialog',
                toolbar: false,
                template: {
                    toolbar: '',
                    content: /*html*/`
                    <div class="dialog_wrapper">
                        <div class="field_wrapper">
                        <span class="field-wrap-name"><span class="gh_element_name">Channel Name</span></span>
                        <gh-input gh-editable="true" gh-data-type="text" type="text" ng-model="groupName" class="group_name"></gh-input>
                        </div>

                        <span ng-if="showErrorMessage" class="error"> Please enter a channel name </span>
                        <span ng-if="showResponseError" class="error"><span class="bold">Error:</span> {{responseError}} </span>

                        <button class="btn save_btn btn-grean" ng-click="createGroup()"> Create Channel </button>

                        <div ng-if="showLoader" class="create_group_loader loader">
                            <span></span>
                        </div>
                    </div>
                    `
                },

                locals: {
                    appId: this.appId,
                    fieldId: this.fieldId,
                    itemId: this.itemId
                },

                controller: ['$scope', 'appId', 'fieldId', 'itemId', function($scope, appId, fieldId, itemId) {

                    $scope.createGroup = async () => {
                        $scope.showErrorMessage = false;
                        $scope.showResponseError = false;

                        if($scope.groupName) {

                            $scope.showLoader = true;

                            let response = await fetch(`${gudhub.config.node_server_url}/conversation/group/create`, {
                                method: "POST",
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    app_id: appId,
                                    field_id: fieldId,
                                    item_id: itemId,
                                    messenger: 'slack',
                                    group_name: $scope.groupName,
                                    gudhub_user_id: gudhub.storage.getUser().user_id
                                })
                            });

                            response = await response.json();

                            $scope.showLoader = false;

                            if(response.status == 500) {
                                $scope.showResponseError = true;
                                $scope.responseError = response.message;
                                $scope.$apply();
                                return;
                            }

                            $scope.hide();
                            const createGroupBtn = document.querySelector('slack-create-conversation');
                            const sendBtn = document.querySelector('.send_button');
                            createGroupBtn.style.display = 'none';
                            sendBtn.style.display = 'block';
                        } else {
                            $scope.showErrorMessage = true;
                        }
                    }
                }]
            })
    }

}

if(!customElements.get('slack-create-conversation')){
    customElements.define('slack-create-conversation', CreateConversation);
}