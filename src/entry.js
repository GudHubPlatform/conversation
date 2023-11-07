import './conversations.webcomponent.js';
import FacebookLogin from './facebookLogin.js';
if(!customElements.get('facebook-login')){
    customElements.define('facebook-login', FacebookLogin);
}

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
            content: () => value
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
                    
                ],
                [
                    {
                        title: "Messengers settings",
                        type: "header"
                    },
                    // {
                    //     type: 'html',
                    //     showIf: 'data_model.messengers.facebook.enabled',
                    //     data_model: function (fieldModel) {
                    //       return fieldModel;
                    //     },
                    //     control:
                    //       `<gh-input-web-component app-id="1232" gh-model="field_model.data_model.messengers.facebook.bot_token"></gh-input-web-component>`
                    // },
                    {
                        type: 'ghElement',
                        property: 'data_model.messengers.viber.enabled',
                        data_model: () => {
                            return {
                                data_type: 'boolean',
                                field_name: 'Viber',
                                name_space: 'viber_enabled'
                            }
                        }
                    },
                    {
                        type: 'ghElement',
                        property: 'data_model.messengers.viber.user_id_field',
                        showIf: 'data_model.messengers.viber.enabled',
                        data_model: (field) => {
                            return {
                                data_type: 'field',
                                field_name: 'Viber user id field',
                                name_space: 'viber_user_id_field',
                                data_model: {
                                    app_id: field.app_id
                                }
                            }
                        }
                    },
                    {
                        type: 'ghElement',
                        property: 'data_model.messengers.viber.photo_field',
                        showIf: 'data_model.messengers.viber.enabled',
                        data_model: (field) => {
                            return {
                                data_type: 'field',
                                field_name: 'Viber photo field',
                                name_space: 'viber_photo_field',
                                data_model: {
                                    app_id: field.app_id
                                }
                            }
                        }
                    },
                    {
                        type: 'ghElement',
                        property: 'data_model.messengers.viber.bot_token',
                        showIf: 'data_model.messengers.viber.enabled',
                        data_model: () => {
                            return {
                                data_type: 'text',
                                field_name: 'Bot token',
                                name_space: 'viber_bot_token'
                            }
                        }
                    },
                    {
                        type: 'ghElement',
                        property: 'data_model.messengers.telegram.enabled',
                        data_model: () => {
                            return {
                                data_type: 'boolean',
                                field_name: 'Telegram',
                                name_space: 'telegram_enabled'
                            }
                        }
                    },
                    {
                        type: 'ghElement',
                        property: 'data_model.messengers.telegram.user_id_field',
                        showIf: 'data_model.messengers.telegram.enabled',
                        data_model: (field) => {
                            return {
                                data_type: 'field',
                                field_name: 'Telegram user id field',
                                name_space: 'telegram_user_id_field',
                                data_model: {
                                    app_id: field.app_id
                                }
                            }
                        }
                    },
                    {
                        type: 'ghElement',
                        property: 'data_model.messengers.telegram.photo_field',
                        showIf: 'data_model.messengers.telegram.enabled',
                        data_model: (field) => {
                            return {
                                data_type: 'field',
                                field_name: 'Telegram photo field',
                                name_space: 'telegram_photo_field',
                                data_model: {
                                    app_id: field.app_id
                                }
                            }
                        }
                    },
                    {
                        type: 'ghElement',
                        property: 'data_model.messengers.telegram.bot_token',
                        showIf: 'data_model.messengers.telegram.enabled',
                        data_model: () => {
                            return {
                                data_type: 'text',
                                field_name: 'Bot token',
                                name_space: 'telegram_bot_token'
                            }
                        }
                    },
                    {
                        type: 'ghElement',
                        property: 'data_model.messengers.facebook.enabled',
                        data_model: () => {
                            return {
                                data_type: 'boolean',
                                field_name: 'Facebook',
                                name_space: 'facebook_enabled'
                            }
                        }
                    },
                    {
                        type: 'html',
                        showIf: 'data_model.messengers.facebook.enabled',
                        data_model: function (fieldModel) {
                          return fieldModel;
                        },
                        control:
                          `<facebook-login app-id="12323" gh-model="field_model.data_model.messengers.facebook.bot_token"></facebook-login>`
                    },
                    {
                        type: 'ghElement',
                        property: 'data_model.messengers.facebook.user_id_field',
                        showIf: 'data_model.messengers.facebook.enabled',
                        data_model: (field) => {
                            return {
                                data_type: 'field',
                                field_name: 'Facebook user id field',
                                name_space: 'facebook_user_id_field',
                                data_model: {
                                    app_id: field.app_id
                                }
                            }
                        }
                    },
                    {
                        type: 'ghElement',
                        property: 'data_model.messengers.facebook.photo_field',
                        showIf: 'data_model.messengers.facebook.enabled',
                        data_model: (field) => {
                            return {
                                data_type: 'field',
                                field_name: 'Facebook photo field',
                                name_space: 'facebook_photo_field',
                                data_model: {
                                    app_id: field.app_id
                                }
                            }
                        }
                    },
                    {
                        type: 'ghElement',
                        property: 'data_model.messengers.facebook.bot_token',
                        showIf: 'data_model.messengers.facebook.enabled',
                        data_model: () => {
                            return {
                                data_type: 'text',
                                field_name: 'Facebook Page token',
                                name_space: 'facebook_page_token'
                            }
                        }
                    },
                    {
                        type: 'ghElement',
                        property: 'data_model.messengers.facebook.page_name',
                        showIf: 'data_model.messengers.facebook.enabled',
                        data_model: () => {
                            return {
                                data_type: 'text',
                                field_name: 'Facebook Page Name',
                                name_space: 'facebook_page_name'
                            }
                        }
                    },
                    {
                        type: 'ghElement',
                        property: 'data_model.messengers.facebook.page_id',
                        showIf: 'data_model.messengers.facebook.enabled',
                        data_model: () => {
                            return {
                                data_type: 'text',
                                field_name: 'Facebook Page Id',
                                name_space: 'facebook_page_id'
                            }
                        }
                    }
                ],
            ]
        }];
    }

    onMessage(appId, userId, response) {
        gudhub.emit('conversations_message_received', { app_id: appId, field_id: response.data.field_id }, response);
    }
}