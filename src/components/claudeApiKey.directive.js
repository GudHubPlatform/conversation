angular
  .module("claudeApiKey", [])

  .directive("claudeApiKey", [
    function () {
      return {
        restrict: "E",

        scope: {
          appId: "@",
          fieldId: "@",
          ngModel: "=?",
        },

        controller: [
          "$scope",
          function ($scope) {
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
                        <span class="field-wrap-name"><span class="gh_element_name">Anthropic API Key</span></span>
                        <gh-input gh-editable="true" gh-data-type="text" ng-model="fieldModel.bot_token" type="text" class="page"></gh-input>
                      </div>
                      <button class="btn save_btn btn-grean" ng-click="connect()"> Connect Claude AI </button>
                    </div>
                    `
                },

                locals: {
                  fieldModel: $scope.ngModel,
                  parentScope: $scope
                },

                controller: ['$scope', 'fieldModel', 'parentScope', function($scope, fieldModel, parentScope) {
                  $scope.fieldModel = fieldModel;

                  $scope.connect = async () => {
                    if ($scope.fieldModel.bot_token) {
                      try {
                        await fetch(`${gudhub.config.node_server_url}/conversation/set-webhook`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            token: $scope.fieldModel.bot_token,
                            app_id: parentScope.appId,
                            field_id: parentScope.fieldId,
                            messenger: 'claude',
                            gudhub_user_id: gudhub.storage.getUser().user_id
                          })
                        });

                        const response = await fetch(
                          `${gudhub.config.node_server_url}/conversation/get-page-info?messenger=claude&token=${$scope.fieldModel.bot_token}`,
                          { method: 'GET' }
                        );

                        const accountInfo = await response.json();

                        parentScope.ngModel.webhookSetted = true;
                        parentScope.ngModel.page_id = accountInfo.id;
                        parentScope.ngModel.page_name = accountInfo.first_name || accountInfo.name;

                        $scope.hide();
                        parentScope.$apply();

                      } catch (error) {
                        console.log(error);
                      }
                    } else {
                      alert('Please enter an Anthropic API key');
                    }
                  };
                }]
              });
            };
          },
        ],

        template: /*html*/`
          <div class="btn_webhook gh-btn gh-btn-blue gh-btn-bg" ng-if="!ngModel.webhookSetted" ng-click="showDialog()"> Connect Claude AI </div>
          <div ng-if="ngModel.webhookSetted" class="success_message"> Claude AI connected successfully!</div>
        `,
      };
    }
  ]);
