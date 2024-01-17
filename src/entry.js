import './components/conversationAvatar/conversationAvatar.js';
import './components/ghChat/ghChat.js';
import './conversations.webcomponent.js';
import './components/webhookSetter.directive.js';
import './components/facebookLogin.directive.js';
import './components/unread_messages.webcomponent.js'
import './components/slack.oauth.js';

export default class GhConversationsData {

    constructor(config) {
        this.config = config;
    }

    /*------------------------------- FIELD TEMPLATE --------------------------------------*/

    getTemplate() {
        return {
            constructor: 'field',
            name: 'Conversations',
            icon: 'timeline',
            model: {
                field_id: 0,
                field_name: 'Conversations',
                field_value: '',
                data_type: 'conversations',
                data_model: {
                    interpretation: [{
                        src: 'form',
                        id: 'default',
                        settings: {
                            editable: 1,
                            show_field_name: 1,
                            show_field: 1
                        },
                        style: { position: "beetwen" }
                    }]
                }
            }
        };
    }

    /*------------------------------- INTERPRETATION --------------------------------------*/

    getInterpretation(gudhub, value, appId, itemId, field_model) {

        return [{
            id: 'default',
            name: 'Default',
            content: () =>
                '<gh-conversations app-id="{{appId}}" item-id="{{itemId}}" field-id="{{fieldId}}"></gh-conversations>'
        }, {
            id: 'value',
            name: 'Value',
            content: () => `<unread-messages-count app-id="{{appId}}" item-id="{{itemId}}" field-id="{{fieldId}}" value="{{value}}"></unread-messages-count>`
        }];
    }

    /*--------------------------  SETTINGS --------------------------------*/

    getSettings(scope) {
        return [{
            title: 'Options',
            type: 'general_setting',
            icon: 'menu',
            columns_list: [
                [
                  {
                    type: 'ghElement',
                    property: 'data_model.user_name_field_id',
                    data_model: (field) => {
                        return {
                            data_type: 'field',
                            field_name: 'User name field',
                            name_space: 'user_name_field',
                            data_model: {
                                app_id: field.app_id
                            }
                        }
                    }
                  },
                  {
                    type: 'ghElement',
                    property: 'data_model.use_messenger_id',
                    data_model() {
                      return {
                        field_name: 'Use only messenger user id',
                        name_space: 'use_messenger_id',
                        data_type: 'boolean'
                      };
                    }
                  },
                ],
                [
                    {
                        type: 'html',
                        class: 'option-column_750px',
                        data_model: function (fieldModel) {
                          return {
                            patterns: [{
                              property: 'messenger_name',
                              type: 'text_opt',
                              prop_name: 'Messenger',
                              data_model: function(){
                                return {
                                    options: [
                                        {
                                            name: "Viber",
                                            value: "viber",
                                        },
                                        {
                                            name: "Telegram",
                                            value: "telegram",
                                        },
                                        {
                                            name: 'Facebook',
                                            value: 'facebook'
                                        },
                                        {
                                            name: 'Slack',
                                            value: 'slack'
                                        }
                                    ]
                                };
                              },
                              display: true
                            },
                            {
                              property: 'page_name',
                              type: 'text',
                              prop_name: 'Page Name',
                              data_model: function(option){
                                let findedOption = fieldModel.data_model.messengers.find(messenger => messenger == option);

                                if(findedOption) {
                                  findedOption.page_name = findedOption.messenger_settings.page_name;
                                }

                                return {}
                              },
                              display: true
                            },
                            {
                                property: "messenger_settings",
                                prop_name: "Settings",
                                type: "additional_settings",
                                display: false,
                                data_model: function (option, scope) {
                                    this.display = option.messenger_name === 'facebook';
                                  return {
                                    appId: fieldModel.app_id,
                                    elementId: fieldModel.field_id,
                                    settings: [
                                      {
                                        title: "Messenger",
                                        type: "general_setting",
                                        icon: "configuration",
                                        columns_list: [
                                          [
                                            {
                                              title: "Page Settings",
                                              type: "header",
                                            },
                                            {
                                                type: 'html',
                                                data_model: function (fieldModel) {
                                                  return {};
                                                },
                                                control:
                                                  `<facebook-login app-id="{{appId}}" field-id="{{elementId}}" ng-model="fieldModel"></facebook-login>`
                                             },
                                             {
                                              type: 'ghElement',
                                              property: 'user_id_field',
                                              data_model: (field) => {
                                                  return {
                                                      data_type: 'field',
                                                      field_name: 'Facebook user id field',
                                                      name_space: 'facebook_user_id_field',
                                                      data_model: {
                                                          app_id: fieldModel.app_id
                                                      }
                                                  }
                                              }
                                          },
                                          {
                                              type: 'ghElement',
                                              property: 'photo_field',
                                              data_model: (field) => {
                                                  return {
                                                      data_type: 'field',
                                                      field_name: 'Facebook photo field',
                                                      name_space: 'facebook_photo_field',
                                                      data_model: {
                                                          app_id: fieldModel.app_id
                                                      }
                                                  }
                                              }
                                          }
        
                                          ],
        
        
                                        ],
                                      },
                                    ],
                                  };
                                },
                              },{
                                property: "messenger_settings",
                                prop_name: "Settings",
                                type: "additional_settings",
                                display: false,
                                data_model: function (option, scope) {
                                    this.display = option.messenger_name === 'viber';
                                  return {
                                    appId: fieldModel.app_id,
                                    elementId: fieldModel.field_id,
                                    settings: [
                                      {
                                        title: "Messenger",
                                        type: "general_setting",
                                        icon: "configuration",
                                        columns_list: [
                                          [
                                            {
                                              title: "Page Settings",
                                              type: "header",
                                            },
                                            {
                                              type: 'html',
                                              data_model: function (fieldModel) {
                                                return {};
                                              },
                                              control:
                                                `<webhook-setter app-id="{{appId}}" field-id="{{elementId}}" ng-model="fieldModel"></webhook-setter>`
                                            },
                                            {
                                              showIf: "photo_field === 1",
                                              type: "ghElement",
                                              property: "messenger",
                                              data_model: function () {
                                                  return {
                                                      data_type: "text",
                                                      field_name: "Messenger",
                                                      name_space: "messenger",
                                                      field_value: "viber"
                                                  };
                                              },
                                            },
                                            {
                                              type: 'ghElement',
                                              property: 'user_id_field',
                                              data_model: (field) => {
                                                  return {
                                                      data_type: 'field',
                                                      field_name: 'Viber user id field',
                                                      name_space: 'viber_user_id_field',
                                                      data_model: {
                                                          app_id: fieldModel.app_id
                                                      }
                                                  }
                                              }
                                            },
                                            {
                                              type: 'ghElement',
                                              property: 'photo_field',
                                              data_model: (field) => {
                                                  return {
                                                      data_type: 'field',
                                                      field_name: 'Viber photo field',
                                                      name_space: 'viber_photo_field',
                                                      data_model: {
                                                          app_id: fieldModel.app_id
                                                      }
                                                  }
                                              }
                                            },
        
                                          ],
                                        ],
                                      },
                                    ],
                                  };
                                },
                              },
                              {
                                property: "messenger_settings",
                                prop_name: "Settings",
                                type: "additional_settings",
                                display: false,
                                data_model: function (option, scope) {
                                    this.display = option.messenger_name === 'telegram';
                                  return {
                                    appId: fieldModel.app_id,
                                    elementId: fieldModel.field_id,
                                    settings: [
                                      {
                                        title: "Messenger",
                                        type: "general_setting",
                                        icon: "configuration",
                                        columns_list: [
                                          [
                                            {
                                              title: "Page Settings",
                                              type: "header",
                                            },
                                            {
                                              showIf: "photo_field === 1",
                                              type: "ghElement",
                                              property: "messenger",
                                              data_model: function () {
                                                  return {
                                                      data_type: "text",
                                                      field_name: "Messenger",
                                                      name_space: "messenger",
                                                      field_value: "telegram"
                                                  };
                                              },
                                            },
                                            {
                                              type: 'html',
                                              data_model: function (fieldModel) {
                                                return {};
                                              },
                                              control:
                                                `<webhook-setter app-id="{{appId}}" field-id="{{elementId}}" ng-model="fieldModel"></webhook-setter>`
                                            },
                                            {
                                              type: 'ghElement',
                                              property: 'user_id_field',
                                              data_model: (field) => {
                                                  return {
                                                      data_type: 'field',
                                                      field_name: 'Telegram user id field',
                                                      name_space: 'telegram_user_id_field',
                                                      data_model: {
                                                          app_id: fieldModel.app_id
                                                      }
                                                  }
                                              }
                                            },
                                            {
                                              type: 'ghElement',
                                              property: 'photo_field',
                                              data_model: (field) => {
                                                  return {
                                                      data_type: 'field',
                                                      field_name: 'Telegram photo field',
                                                      name_space: 'telegram_photo_field',
                                                      data_model: {
                                                          app_id: fieldModel.app_id
                                                      }
                                                  }
                                              }
                                            },
        
                                          ],
                                        ],
                                      },
                                    ],
                                  };
                                },
                              },{
                                property: "messenger_settings",
                                prop_name: "Settings",
                                type: "additional_settings",
                                display: false,
                                data_model: function (option, scope) {
                                    this.display = option.messenger_name === 'slack';
                                  return {
                                    appId: fieldModel.app_id,
                                    elementId: fieldModel.field_id,
                                    settings: [
                                      {
                                        title: "Messenger",
                                        type: "general_setting",
                                        icon: "configuration",
                                        columns_list: [
                                          [
                                            {
                                              title: "Page Settings",
                                              type: "header",
                                            },
                                            {
                                              type: 'html',
                                              data_model: function (fieldModel) {
                                                return {};
                                              },
                                              control:
                                                `<slack-oauth-button app-id="{{appId}}" field-id="{{elementId}}"></slack-oauth-button>`
                                            },
                                            {
                                              showIf: "photo_field === 1",
                                              type: "ghElement",
                                              property: "messenger",
                                              data_model: function () {
                                                  return {
                                                      data_type: "text",
                                                      field_name: "Messenger",
                                                      name_space: "messenger",
                                                      field_value: "slack"
                                                  };
                                              },
                                            },
                                            {
                                              type: 'ghElement',
                                              property: 'user_id_field',
                                              data_model: (field) => {
                                                  return {
                                                      data_type: 'field',
                                                      field_name: 'Slack user id field',
                                                      name_space: 'slack_user_id_field',
                                                      data_model: {
                                                          app_id: fieldModel.app_id
                                                      }
                                                  }
                                              }
                                            },
                                            {
                                              type: 'ghElement',
                                              property: 'photo_field',
                                              data_model: (field) => {
                                                  return {
                                                      data_type: 'field',
                                                      field_name: 'Slack photo field',
                                                      name_space: 'slack_photo_field',
                                                      data_model: {
                                                          app_id: fieldModel.app_id
                                                      }
                                                  }
                                              }
                                            },
        
                                          ],
                                        ],
                                      },
                                    ],
                                  };
                                },
                              },]
                          };
                        },
                        control:
                          '<gh-option-table items="fieldModel.data_model.messengers" pattern="field_model.patterns" ></gh-option-table>'
                    }
                ]
            ]
        }];
    }

    onMessage(appId, userId, response) {
        gudhub.emit('conversations_message_received', { app_id: appId, field_id: response.data.field_id }, response);
    }
}