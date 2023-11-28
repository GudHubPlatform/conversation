import GhHtmlElement from "@gudhub/gh-html-element";
export default class FacebookLogin extends GhHtmlElement {

    constructor() {
        super();
        this.user;
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
          FB.init({
              appId: '1352981355593349',
              xfbml: true,
              version: 'v18.0'
          });

          FB.getLoginStatus(function(response) {
              self.toggleButtons(response)
          });

          window.checkLoginState = () => {
            FB.getLoginStatus(function(response) {
              self.loginStatusChangeCallback(response);
            });
          }

        }
        
        const html = /*html*/`
        <div class="facebook_auth_btn">
          <div class="field-wrap-name">
            <span class="gh_element_name"> Facebook Login</span>
          </div>
          <fb:login-button config_id="1411318419449523" class="login_button" onlogin="this.checkLoginState();"></fb:login-button>
          <button class="logout_button" onclick="logout()"> Log Out </button>
        </button>`

        super.render(html);

      console.log(this.scope)

        if(window.FB) {
          FB.getLoginStatus(function(response) {

            const loginBtn = document.querySelector('.login_button');
            const logoutBtn = document.querySelector('.logout_button');

            if(response.status === 'connected') {
              loginBtn.style.display = 'none';
              logoutBtn.style.display = 'block';
            } else {
              loginBtn.style.display = 'block';
              logoutBtn.style.display = 'none';
            }
            
          });
        }

    }

    async setLoginData() {
      const self = this;

      // Here we need get long lived access token for not generate it every time
      let response = await fetch(`https://gudhub-node-server.ngrok.io/conversation/get-token/facebook?access_token=${this.user.accessToken}`, {
        method: 'GET'
      });

      const { token } = await response.json();

      let pages = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${token}`, {
        method: 'GET'
      });

      pages = await pages.json();

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
          console.log("SCOPE ELEMENT", self.scope.$parent.$parent.$parent.$parent)
          $scope.applySettings = () => {
            const findedPage = $scope.options.find(page => page.value == $scope.selectedPage);

            // self.value = findedPage.token;
            self.scope.$parent.$parent.$parent.$parent.fieldModel.bot_token = findedPage.token;
            // self.scope.messenger_setting.page_id = findedPage.value;
            // self.scope.field_model.data_model.messengers.facebook.page_name = findedPage.name;

            $scope.hide();
          }
          
        }]
      })
      
    }

    loginStatusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
      if (response.status === 'connected') {   // Logged into your webpage and Facebook.
        this.user = response.authResponse;
        this.setLoginData();
      } else {                                 // Not logged into your webpage or we are unable to tell.
        console.log(response)
      }
    }

    logout() {

      const self = this;

      FB.logout(function(response) {
        // self.value = '';
        // self.scope.field_model.data_model.messengers.facebook.page_id = '';
        // self.scope.field_model.data_model.messengers.facebook.page_name = '';

        self.toggleButtons(response);
      });

    }

    toggleButtons(response) {
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

}