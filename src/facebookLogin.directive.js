angular
  .module("facebookLogin", [])

  .directive("facebookLogin", [
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
         <div class="facebook_auth_btn">
           <div class="field-wrap-name">
             <span class="gh_element_name"> Facebook Login</span>
           </div>
           <fb:login-button config_id="1411318419449523" class="login_button" onlogin="this.checkLoginState();"></fb:login-button>
           <button class="logout_button" ng-click="logout()"> Log Out </button>
        </div>`,

        controller: [
          "$scope",
          async function ($scope) {
            const initFacebook = async () => {
              
                (function(d, s, id){
                  var js, fjs = d.getElementsByTagName(s)[0];
                  if (d.getElementById(id)) {return;}
                  js = d.createElement(s); js.id = id;
                  js.src = "https://connect.facebook.net/en_US/sdk.js";
                  fjs.parentNode.insertBefore(js, fjs);
                  }(document, 'script', 'facebook-jssdk')
                );
              
            }

            await initFacebook();
          
            window.fbAsyncInit = function() {
              FB.init({
                  appId: '1352981355593349',
                  xfbml: true,
                  version: 'v18.0'
              });

              FB.getLoginStatus(function(response) {
                  $scope.toggleButtons(response)
              });

              window.checkLoginState = () => {
                FB.getLoginStatus(function(response) {
                  $scope.loginStatusChangeCallback(response);
                });
              }
            }

            // Fix rendering of button after first render
            setTimeout(()=> {
              window.fbAsyncInit();
            }, 500)

            $scope.loginStatusChangeCallback = function(response) {  // Called with the results from FB.getLoginStatus().
              if (response.status === 'connected') {   // Logged into your webpage and Facebook.
                $scope.user = response.authResponse;
                $scope.setLoginData();
              } else {                                 // Not logged into your webpage or we are unable to tell.
                console.log(response)
              }
            }

            $scope.setLoginData = async () => {
        
              // Here we need get long lived access token for not generate it every time
              let response = await fetch(`${gudhub.config.node_server_url}/conversation/get-token/facebook?access_token=${$scope.user.accessToken}`, {
                method: 'GET'
              });
        
              const { token } = await response.json();
        
              let pages = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${token}`, {
                method: 'GET'
              });
        
              pages = await pages.json();

              let permissions =  await fetch(`https://graph.facebook.com/v18.0/me/permissions?access_token=${token}`, {
                method: 'GET'
              });

              permissions = await permissions.json();

              const permissionsArray = permissions.data.map((scope) => scope.permission);

              const ghDialog = gudhub.ghconstructor.angularInjector.get('GhDialog');
        
              ghDialog.show({
                position: 'center_event_position',
                class: 'page_choose_dialog',
                toolbar: false,
                template: {
                  toolbar: '',
                  content: /*html*/`
                    <div class="dialog_wrapper">
                      <p> Choose page that you want to connect!</p>
                      <gh-input gh-editable="true" gh-dropdown="options" gh-data-type="text_opt" type="text" ng-model="selectedPage" class="page"></gh-input>
                      <p class="error" ng-init="showSelectedPageError = false" ng-if="showSelectedPageError"> You need select a page </p>
                      <button class="btn save_btn btn-grean" ng-click="applySettings()"> Save </button>
                    </div>`
                },
        
                locals: {
                  pages: pages.data,
                  parentScope: $scope
                },
        
                controller: ['$scope', 'pages', 'parentScope', function($scope, pages, parentScope) {
                  $scope.options = [];
        
                  $scope.options = pages.map(page => {
                    return {
                      value: page.id,
                      token: page.access_token,
                      name: page.name
                    }
                  });
        
                  $scope.selectedPage = '';
                  $scope.applySettings = async () => {
                    if($scope.selectedPage) {

                        const findedPage = $scope.options.find(page => page.value == $scope.selectedPage);

                        parentScope.ngModel.bot_token = findedPage.token;
                        parentScope.ngModel.page_id = findedPage.value;
                        parentScope.ngModel.page_name = findedPage.name;
                        parentScope.ngModel.messenger = 'facebook';

                        try {
                          await fetch(`${gudhub.config.node_server_url}/conversation/set-webhook`, {
                              method: 'POST',
                              headers: {
                                  'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                  token: findedPage.token,
                                  app_id: parentScope.appId,
                                  field_id: parentScope.fieldId,
                                  messenger: parentScope.ngModel.messenger,
                                  gudhub_user_id: gudhub.storage.getUser().user_id,
                                  page_name: parentScope.ngModel.page_name,
                                  page_id: findedPage.value,
                                  scopes: permissionsArray
                              })
                          });
            
                        } catch(error) {
                          console.log(error);
                        }

                        $scope.hide();

                    } else {
                      $scope.showSelectedPageError = true;
                    }

                  }
                  
                }]
              })
              
            }

            $scope.logout = () => {
        
              FB.logout(function(response) {
                $scope.ngModel.bot_token = '';
                $scope.ngModel.page_id = '';
        
                $scope.toggleButtons(response);
              });
        
            }

            $scope.toggleButtons = (response) => {
              const loginBtn = document.querySelector('.login_button');
              const logoutBtn = document.querySelector('.logout_button');
        
              if(response.status === 'connected') {
                loginBtn.style.display = 'none';
                logoutBtn.style.display = 'block';
              } else {
                loginBtn.style.display = 'block';
                logoutBtn.style.display = 'none';
              }
            }
            
          },
        ],
      };
    },
  ]);