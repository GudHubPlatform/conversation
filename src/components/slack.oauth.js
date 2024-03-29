import GhHtmlElement from '@gudhub/gh-html-element';

class SlackOAuth extends GhHtmlElement {

    constructor() {
        super();
        this.appId;
        this.fieldId;
        this.gudhubUserId;
    }

    async onInit() {

        this.gudhubUserId = gudhub.storage.getUser().user_id;

        const token = await gudhub.getToken();
        let response = await fetch(`${gudhub.config.node_server_url}/integrations?token=${encodeURIComponent(token)}`);

        response = await response.json();
        this.integration = response.data.find(integration => integration.service_id === 'slack' && integration.field_id == this.fieldId);
        let isLogin;

        if(this.integration) {
            isLogin = true;
        } else {
            isLogin = false;
        }

        const html = /*html*/
        `${isLogin ? '<div onclick="removeIntegration();" class="logout_slack">' +
            '<svg width="18px" enable-background="new 0 0 2447.6 2452.5" viewBox="0 0 2447.6 2452.5" xmlns="http://www.w3.org/2000/svg"><g clip-rule="evenodd" fill-rule="evenodd"><path d="m897.4 0c-135.3.1-244.8 109.9-244.7 245.2-.1 135.3 109.5 245.1 244.8 245.2h244.8v-245.1c.1-135.3-109.5-245.1-244.9-245.3.1 0 .1 0 0 0m0 654h-652.6c-135.3.1-244.9 109.9-244.8 245.2-.2 135.3 109.4 245.1 244.7 245.3h652.7c135.3-.1 244.9-109.9 244.8-245.2.1-135.4-109.5-245.2-244.8-245.3z" fill="#36c5f0"/><path d="m2447.6 899.2c.1-135.3-109.5-245.1-244.8-245.2-135.3.1-244.9 109.9-244.8 245.2v245.3h244.8c135.3-.1 244.9-109.9 244.8-245.3zm-652.7 0v-654c.1-135.2-109.4-245-244.7-245.2-135.3.1-244.9 109.9-244.8 245.2v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.3z" fill="#2eb67d"/><path d="m1550.1 2452.5c135.3-.1 244.9-109.9 244.8-245.2.1-135.3-109.5-245.1-244.8-245.2h-244.8v245.2c-.1 135.2 109.5 245 244.8 245.2zm0-654.1h652.7c135.3-.1 244.9-109.9 244.8-245.2.2-135.3-109.4-245.1-244.7-245.3h-652.7c-135.3.1-244.9 109.9-244.8 245.2-.1 135.4 109.4 245.2 244.7 245.3z" fill="#ecb22e"/><path d="m0 1553.2c-.1 135.3 109.5 245.1 244.8 245.2 135.3-.1 244.9-109.9 244.8-245.2v-245.2h-244.8c-135.3.1-244.9 109.9-244.8 245.2zm652.7 0v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.2v-653.9c.2-135.3-109.4-245.1-244.7-245.3-135.4 0-244.9 109.8-244.8 245.1 0 0 0 .1 0 0" fill="#e01e5a"/></g></svg>' +
             'Remove Integration</div>' : 
            `<a target="_blank" href="https://slack.com/oauth/v2/authorize?client_id=743637766933.802380072726&state=${this.appId},${this.fieldId},${this.gudhubUserId}&scope=channels:history,channels:manage,chat:write,im:history,users:read,channels:read,groups:read,groups:write,im:read,mpim:read,links:read,chat:write.customize"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>`}`
        super.render(html);
    }

    disableAuthButton(target) {
        setTimeout(() => {
            target.removeAttribute('href');
        }, 0);
    }

    async removeIntegration() {
        try {
            const token = await gudhub.getToken();

            const data = { 
              app_id: this.integration.app_id,
              field_id: this.integration.field_id,
              token,
              service_user_id: this.integration.service_user_id
            };

              await fetch(`${gudhub.config.node_server_url}/integrations/delete`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data)
            });

            // Render Login button if integration removed

            super.render(`<a target="_blank" href="https://slack.com/oauth/v2/authorize?client_id=743637766933.802380072726&state=${this.appId},${this.fieldId},${this.gudhubUserId}&scope=channels:history,channels:manage,chat:write,im:history,users:read,channels:read,groups:read,groups:write,im:read,mpim:read,links:read,chat:write.customize"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>`);

          } catch(error) {
            console.log(error);
          }
    }

    getAttributes() {
        this.appId = this.getAttribute('app-id');
        this.fieldId = this.getAttribute('field-id');
    }
}

if(!customElements.get('slack-oauth-button')){
    customElements.define('slack-oauth-button', SlackOAuth);
}