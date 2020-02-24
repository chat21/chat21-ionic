'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">@chat21/chat21-ionic documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="changelog.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CHANGELOG
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-1c245a1195284eb2d7ae5e84e7f5fd20"' : 'data-target="#xs-components-links-module-AppModule-1c245a1195284eb2d7ae5e84e7f5fd20"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-1c245a1195284eb2d7ae5e84e7f5fd20"' :
                                            'id="xs-components-links-module-AppModule-1c245a1195284eb2d7ae5e84e7f5fd20"' }>
                                            <li class="link">
                                                <a href="components/ArchivedConversationsPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ArchivedConversationsPage</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DettaglioConversazionePage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DettaglioConversazionePage</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InfoAdvancedPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">InfoAdvancedPage</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InfoConversationPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">InfoConversationPage</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InfoMessagePage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">InfoMessagePage</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InfoUserPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">InfoUserPage</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ListaConversazioniPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ListaConversazioniPage</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">LoginPage</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MyApp.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">MyApp</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PlaceholderPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PlaceholderPage</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PopoverPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PopoverPage</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PopoverProfilePage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PopoverProfilePage</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfilePage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ProfilePage</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RegisterPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">RegisterPage</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ResetpwdPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ResetpwdPage</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UpdateImageProfilePage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UpdateImageProfilePage</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UsersPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UsersPage</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-AppModule-1c245a1195284eb2d7ae5e84e7f5fd20"' : 'data-target="#xs-directives-links-module-AppModule-1c245a1195284eb2d7ae5e84e7f5fd20"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-AppModule-1c245a1195284eb2d7ae5e84e7f5fd20"' :
                                        'id="xs-directives-links-module-AppModule-1c245a1195284eb2d7ae5e84e7f5fd20"' }>
                                        <li class="link">
                                            <a href="directives/AutosizeDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">AutosizeDirective</a>
                                        </li>
                                    </ul>
                                </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AppModule-1c245a1195284eb2d7ae5e84e7f5fd20"' : 'data-target="#xs-injectables-links-module-AppModule-1c245a1195284eb2d7ae5e84e7f5fd20"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-1c245a1195284eb2d7ae5e84e7f5fd20"' :
                                        'id="xs-injectables-links-module-AppModule-1c245a1195284eb2d7ae5e84e7f5fd20"' }>
                                        <li class="link">
                                            <a href="injectables/AppConfigProvider.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>AppConfigProvider</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AuthService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ChatArchivedConversationsHandler.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ChatArchivedConversationsHandler</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ChatContactsSynchronizer.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ChatContactsSynchronizer</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ChatConversationHandler.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ChatConversationHandler</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ChatConversationsHandler.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ChatConversationsHandler</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ChatManager.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ChatManager</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ChatPresenceHandler.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ChatPresenceHandler</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DatabaseProvider.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>DatabaseProvider</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/GroupService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>GroupService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/MessagingService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>MessagingService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/NavProxyService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>NavProxyService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TiledeskConversationProvider.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>TiledeskConversationProvider</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UploadService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>UploadService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>UserService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ArchivedConversationsPageModule.html" data-type="entity-link">ArchivedConversationsPageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ArchivedConversationsPageModule-0f5072c5dde2e8ba22a721f1a9bd5ac0"' : 'data-target="#xs-components-links-module-ArchivedConversationsPageModule-0f5072c5dde2e8ba22a721f1a9bd5ac0"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ArchivedConversationsPageModule-0f5072c5dde2e8ba22a721f1a9bd5ac0"' :
                                            'id="xs-components-links-module-ArchivedConversationsPageModule-0f5072c5dde2e8ba22a721f1a9bd5ac0"' }>
                                            <li class="link">
                                                <a href="components/ArchivedConversationsPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ArchivedConversationsPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DettaglioConversazionePageModule.html" data-type="entity-link">DettaglioConversazionePageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-DettaglioConversazionePageModule-ed0ee61282d16cd84ce68904b15caa0c"' : 'data-target="#xs-components-links-module-DettaglioConversazionePageModule-ed0ee61282d16cd84ce68904b15caa0c"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DettaglioConversazionePageModule-ed0ee61282d16cd84ce68904b15caa0c"' :
                                            'id="xs-components-links-module-DettaglioConversazionePageModule-ed0ee61282d16cd84ce68904b15caa0c"' }>
                                            <li class="link">
                                                <a href="components/DettaglioConversazionePage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DettaglioConversazionePage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/InfoAdvancedPageModule.html" data-type="entity-link">InfoAdvancedPageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-InfoAdvancedPageModule-059841ff13ffe7799d08bf7223d37d7c"' : 'data-target="#xs-components-links-module-InfoAdvancedPageModule-059841ff13ffe7799d08bf7223d37d7c"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-InfoAdvancedPageModule-059841ff13ffe7799d08bf7223d37d7c"' :
                                            'id="xs-components-links-module-InfoAdvancedPageModule-059841ff13ffe7799d08bf7223d37d7c"' }>
                                            <li class="link">
                                                <a href="components/InfoAdvancedPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">InfoAdvancedPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/InfoConversationPageModule.html" data-type="entity-link">InfoConversationPageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-InfoConversationPageModule-9d7758cbdb481c3ce737ab0a4fa6450e"' : 'data-target="#xs-components-links-module-InfoConversationPageModule-9d7758cbdb481c3ce737ab0a4fa6450e"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-InfoConversationPageModule-9d7758cbdb481c3ce737ab0a4fa6450e"' :
                                            'id="xs-components-links-module-InfoConversationPageModule-9d7758cbdb481c3ce737ab0a4fa6450e"' }>
                                            <li class="link">
                                                <a href="components/InfoConversationPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">InfoConversationPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/InfoUserPageModule.html" data-type="entity-link">InfoUserPageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-InfoUserPageModule-5bde7cc89aa844f161493410eb408ca9"' : 'data-target="#xs-components-links-module-InfoUserPageModule-5bde7cc89aa844f161493410eb408ca9"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-InfoUserPageModule-5bde7cc89aa844f161493410eb408ca9"' :
                                            'id="xs-components-links-module-InfoUserPageModule-5bde7cc89aa844f161493410eb408ca9"' }>
                                            <li class="link">
                                                <a href="components/InfoUserPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">InfoUserPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ListaConversazioniPageModule.html" data-type="entity-link">ListaConversazioniPageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ListaConversazioniPageModule-5869ac3f8bb58265d2691c5b51780965"' : 'data-target="#xs-components-links-module-ListaConversazioniPageModule-5869ac3f8bb58265d2691c5b51780965"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ListaConversazioniPageModule-5869ac3f8bb58265d2691c5b51780965"' :
                                            'id="xs-components-links-module-ListaConversazioniPageModule-5869ac3f8bb58265d2691c5b51780965"' }>
                                            <li class="link">
                                                <a href="components/ListaConversazioniPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ListaConversazioniPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/LoginModule.html" data-type="entity-link">LoginModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-LoginModule-1005297abfcb8e6c085b3484cfeff93c"' : 'data-target="#xs-components-links-module-LoginModule-1005297abfcb8e6c085b3484cfeff93c"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-LoginModule-1005297abfcb8e6c085b3484cfeff93c"' :
                                            'id="xs-components-links-module-LoginModule-1005297abfcb8e6c085b3484cfeff93c"' }>
                                            <li class="link">
                                                <a href="components/LoginPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">LoginPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/PlaceholderPageModule.html" data-type="entity-link">PlaceholderPageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-PlaceholderPageModule-a0ad9af47d2345cd5af3726448e3d51d"' : 'data-target="#xs-components-links-module-PlaceholderPageModule-a0ad9af47d2345cd5af3726448e3d51d"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-PlaceholderPageModule-a0ad9af47d2345cd5af3726448e3d51d"' :
                                            'id="xs-components-links-module-PlaceholderPageModule-a0ad9af47d2345cd5af3726448e3d51d"' }>
                                            <li class="link">
                                                <a href="components/PlaceholderPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PlaceholderPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/PopoverPageModule.html" data-type="entity-link">PopoverPageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-PopoverPageModule-c047596b78c3c38fd86917f9135d711a"' : 'data-target="#xs-components-links-module-PopoverPageModule-c047596b78c3c38fd86917f9135d711a"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-PopoverPageModule-c047596b78c3c38fd86917f9135d711a"' :
                                            'id="xs-components-links-module-PopoverPageModule-c047596b78c3c38fd86917f9135d711a"' }>
                                            <li class="link">
                                                <a href="components/PopoverPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PopoverPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/PopoverProfilePageModule.html" data-type="entity-link">PopoverProfilePageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-PopoverProfilePageModule-b6082ff171188f74271c04019d471d8f"' : 'data-target="#xs-components-links-module-PopoverProfilePageModule-b6082ff171188f74271c04019d471d8f"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-PopoverProfilePageModule-b6082ff171188f74271c04019d471d8f"' :
                                            'id="xs-components-links-module-PopoverProfilePageModule-b6082ff171188f74271c04019d471d8f"' }>
                                            <li class="link">
                                                <a href="components/PopoverProfilePage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PopoverProfilePage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ProfilePageModule.html" data-type="entity-link">ProfilePageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ProfilePageModule-a29e23e922701f64267e9f470ca884b7"' : 'data-target="#xs-components-links-module-ProfilePageModule-a29e23e922701f64267e9f470ca884b7"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ProfilePageModule-a29e23e922701f64267e9f470ca884b7"' :
                                            'id="xs-components-links-module-ProfilePageModule-a29e23e922701f64267e9f470ca884b7"' }>
                                            <li class="link">
                                                <a href="components/ProfilePage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ProfilePage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/RegisterModule.html" data-type="entity-link">RegisterModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-RegisterModule-d04c1dda517cc52f3c1100bff00d904d"' : 'data-target="#xs-components-links-module-RegisterModule-d04c1dda517cc52f3c1100bff00d904d"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-RegisterModule-d04c1dda517cc52f3c1100bff00d904d"' :
                                            'id="xs-components-links-module-RegisterModule-d04c1dda517cc52f3c1100bff00d904d"' }>
                                            <li class="link">
                                                <a href="components/RegisterPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">RegisterPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ResetpwdModule.html" data-type="entity-link">ResetpwdModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ResetpwdModule-6e372bccf5c93637dc0ca571e13ce221"' : 'data-target="#xs-components-links-module-ResetpwdModule-6e372bccf5c93637dc0ca571e13ce221"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ResetpwdModule-6e372bccf5c93637dc0ca571e13ce221"' :
                                            'id="xs-components-links-module-ResetpwdModule-6e372bccf5c93637dc0ca571e13ce221"' }>
                                            <li class="link">
                                                <a href="components/ResetpwdPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ResetpwdPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/UpdateImageProfilePageModule.html" data-type="entity-link">UpdateImageProfilePageModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-UpdateImageProfilePageModule-39c98c3f1f503cce2ed100165d09aebf"' : 'data-target="#xs-components-links-module-UpdateImageProfilePageModule-39c98c3f1f503cce2ed100165d09aebf"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UpdateImageProfilePageModule-39c98c3f1f503cce2ed100165d09aebf"' :
                                            'id="xs-components-links-module-UpdateImageProfilePageModule-39c98c3f1f503cce2ed100165d09aebf"' }>
                                            <li class="link">
                                                <a href="components/UpdateImageProfilePage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UpdateImageProfilePage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link">UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-UsersModule-f52f8fa62ffc1bfba430f8eca5c510f0"' : 'data-target="#xs-components-links-module-UsersModule-f52f8fa62ffc1bfba430f8eca5c510f0"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-UsersModule-f52f8fa62ffc1bfba430f8eca5c510f0"' :
                                            'id="xs-components-links-module-UsersModule-f52f8fa62ffc1bfba430f8eca5c510f0"' }>
                                            <li class="link">
                                                <a href="components/UsersPage.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">UsersPage</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#components-links"' :
                            'data-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/ChatBubble.html" data-type="entity-link">ChatBubble</a>
                            </li>
                            <li class="link">
                                <a href="components/ElasticTextarea.html" data-type="entity-link">ElasticTextarea</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/_DetailPage.html" data-type="entity-link">_DetailPage</a>
                            </li>
                            <li class="link">
                                <a href="classes/_MasterPage.html" data-type="entity-link">_MasterPage</a>
                            </li>
                            <li class="link">
                                <a href="classes/ConversationModel.html" data-type="entity-link">ConversationModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/GroupModel.html" data-type="entity-link">GroupModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/MessageModel.html" data-type="entity-link">MessageModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/UploadModel.html" data-type="entity-link">UploadModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserModel.html" data-type="entity-link">UserModel</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/CustomTranslateService.html" data-type="entity-link">CustomTranslateService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});