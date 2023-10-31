import GhHtmlElement from "@gudhub/gh-html-element";
export default class FacebookLogin extends GhHtmlElement {

    constructor() {
        super();
    }

    onInit() {
      const self = this;
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
              appId            : '1352981355593349',
              xfbml            : true,
              version          : 'v18.0'
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

              console.log(pages)
              
              self.value = `${pages.data[0].access_token},${pages.data[0].id}`;

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