angular
  .module("webhookSetter", [])

  .directive("webhookSetter", [
    function () {
      return {
        restrict: "E",

        scope: {
          appId: "@",
          fieldId: "@",
          ngModel: "=?",
        },
        template:
          /*html*/`
          <div class="btn_webhook gh-btn gh-btn-blue gh-btn-bg" ng-if="!ngModel.webhookSetted" ng-click="showDialog()"> Set Webhook </div>
          <div ng-if="ngModel.webhookSetted" class="success_message"> Webhook was setted successfully!</div>
          `,

        controller: [
          "$scope",
          function ($scope) {
            $scope.isWebhookSet = false;
            
            $scope.showDialog = () => {
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
                        <span class="field-wrap-name"><span class="gh_element_name">Bot Token</span></span>
                        <gh-input gh-editable="true" gh-data-type="text" ng-model="fieldModel.bot_token" type="text" class="page"></gh-input>
                      </div>
                      <button class="btn save_btn btn-grean" ng-click="setWebhook()"> Set Webhook </button>
                    </div>
                    `
                },

                locals: {
                  fieldModel: $scope.ngModel,
                  parentScope: $scope
                },

                controller: ['$scope', 'fieldModel', 'parentScope', function($scope, fieldModel, parentScope) {
                  $scope.fieldModel = fieldModel;
                  
                  $scope.setWebhook = async () => {
                    if($scope.fieldModel.bot_token) {
                      try {
                        await fetch(`${gudhub.config.node_server_url}/conversation/set-webhook`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                token: $scope.fieldModel.bot_token,
                                app_id: parentScope.appId,
                                field_id: parentScope.fieldId,
                                messenger: $scope.fieldModel.messenger,
                                gudhub_user_id: gudhub.storage.getUser().user_id
                            })
                        });
                        
                          const response = await fetch(`${gudhub.config.node_server_url}/conversation/get-page-info?messenger=${$scope.fieldModel.messenger}&token=${$scope.fieldModel.bot_token}`, {
                            method: 'GET',
                          });

                          const accountInfo = await response.json();
                          
                          parentScope.ngModel.webhookSetted = true;
                          parentScope.ngModel.page_id = accountInfo.id;
                          parentScope.ngModel.page_name = accountInfo.first_name || accountInfo.name;
                        
                        

                        $scope.hide();
                        parentScope.$apply();
            
                      } catch(error) {
                          console.log(error);
                      }
                    } else {
                      parentScope.ngModel.webhookSetted = false;
                      alert('Please enter a token');
                    }
                  }

                }]
              })
            }


          },
        ],
      }
    }
  ])
        
export default class webhookSetter extends GhHtmlElement {

    constructor() {
        super();
        
    }

    onInit() {
      const self = this;
      const html = /*html*/`
      <div class="btn_webhook gh-btn inline gh-btn-blue"> Set Webhook </div>
      `
      super.render(html);

      document.querySelector('.btn_webhook').addEventListener('click', () =>{
        this.setWebhook();
      });

      this.ngModel = this.getAttribute('ng-model');
      console.log(this.scope)
    }
    setWebhook() {
      console.log("set webhook")
      const ghDialog = gudhub.ghconstructor.angularInjector.get('GhDialog');
        
      ghDialog.show({
        position: 'center_event_position',
        class: 'page_choose_dialog',
        toolbar: false,
        template: {
          toolbar: '',
          content: /*html*/`
            <div class="dialog_wrapper">
            <span class="field-wrap-name"><span class="gh_element_name">Token</span></span>
              <gh-input gh-editable="true" gh-data-type="text" ng-model="token" type="text" class="page"></gh-input>
              <button class="btn save_btn btn-grean" ng-click="applySettings()"> Save </button>
            </div>`
        },

        locals: {
          fieldModel: this.ngModel
        },

        controller: ['$scope', "fieldModel", function($scope, fieldModel) {
          console.log(fieldModel)
          
        }]
      })


    }

}