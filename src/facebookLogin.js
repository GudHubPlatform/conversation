import GhHtmlElement from "@gudhub/gh-html-element";
export default class FacebookLogin extends GhHtmlElement {

    constructor() {
        super();
    }

    onInit() {
        const self = this;
        // Facebook init login button
        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk')
        );


        window.fbAsyncInit = function() {
          let user = {};

          FB.init({
              appId: '1352981355593349',
              xfbml: true,
              version: 'v18.0'
          });
          
          function statusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
              console.log('statusChangeCallback');
              user = response.authResponse;
              if (response.status === 'connected') {   // Logged into your webpage and Facebook.
                getInfo();
              } else {                                 // Not logged into your webpage or we are unable to tell.
                console.log(response)
              }
            }
           
            async function getInfo() {                      // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
              console.log(user)
              
              let pages = await fetch(`https://graph.facebook.com/v16.0/me/accounts?access_token=${user.accessToken}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },

              });

              pages = await pages.json();

              const ghDialog = gudhub.ghconstructor.angularInjector.get('GhDialog');
              ghDialog.show({
                position: 'center_event_position',
                class: 'page_choose_dialog',
                toolbar: false,
                template: {
                  toolbar: '',
                  content: `
                    <div class="dialog_wrapper">
                      <p> Choose page that you want to connect!</p>
                      <gh-input gh-editable="true" gh-dropdown="options" gh-data-type="text_opt" type="text" ng-model="selectedPage" class="page"></gh-input>
                      <button class="btn save_btn btn-grean" ng-click="applySettings()"> Save </button>
                    </div>`
                },
                locals: {
                  pages: pages.data
                },
                controller: ['$scope', 'pages', function($scope, pages) {
                  
                  $scope.options = pages.map(page => {
                    return {
                      value: page.id,
                      token: page.access_token,
                      name: page.name
                    }
                  });

                  $scope.selectedPage = '';

                  $scope.applySettings = () => {
                    const findedPage = $scope.options.find(page => page.value == $scope.selectedPage);

                    self.value = findedPage.token;
                    self.scope.field_model.data_model.messengers.facebook.page_id = findedPage.value;
                    self.scope.field_model.data_model.messengers.facebook.page_name = findedPage.name;

                    $scope.hide();
                  }
                }]
              })
              
            }

            
            window.checkLoginState = () => {
              FB.getLoginStatus(function(response) {   // See the onlogin handler
                statusChangeCallback(response);
              });
            }
          
        }
        
        const html = `
        <div class="flex">
          <div class="field-wrap-name">
            <span class="gh_element_name"> Facebook Login</span>
          </div>
          <fb:login-button config_id="1411318419449523" onlogin="checkLoginState();"></fb:login-button>
        </div>`
        super.render(html);
    }

}