/**
 * Copyright (c) 2013-2014 Netflix, Inc.  All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Test authentication utilities.
 * 
 * @author Wesley Miaw <wmiaw@netflix.com>
 */
var MockAuthenticationUtils = AuthenticationUtils.extend({
    /**
     * Create a new test authentication utilities instance.
     */
    init: function init() {
        /**
         * Revoked entity identities.
         * @type {Array.<string>}
         */
        var revokedEntityIdentities = {};
        /**
         * Revoked entity authentication schemes.
         * @type {Object.<string,Array.<EntityAuthenticationScheme>>}
         */
        var revokedEntityAuthSchemes = {};
        /**
         * Revoked user authentication schemes.
         * @type {Object.<string,Array.<UserAuthenticationScheme>>}
         */
        var revokedUserAuthSchemes = {};
        /**
         * Revoked entity-user authentication schemes.
         * @type {Object.<string,Object.<MslUser,Array.<UserAuthenticationScheme>>>}
         */
        var revokedEntityUserAuthSchemes = {};
        /**
         * Revoked key exchange schemes.
         * @type {Object.<string,Array.<KeyExchangeScheme>}
         */
        var revokedKeyxSchemes = {};
        
        // The properties.
        var props = {
            _revokedEntityIdentities: { value: revokedEntityIdentities, writable: true, enumerable: false, configurable: false },
            _revokedEntityAuthSchemes: { value: revokedEntityAuthSchemes, writable: true, enumerable: false, configurable: false },
            _revokedUserAuthSchemes: { value: revokedUserAuthSchemes, writable: true, enumerable: false, configurable: false },
            _revokedEntityUserAuthSchemes: { value: revokedEntityUserAuthSchemes, writable: true, enumerable: false, configurable: false },
            _revokedKeyxSchemes: { value: revokedKeyxSchemes, writable: true, enumerable: false, configurable: false },
        };
        Object.defineProperties(this, props);
    },
    
    /**
     * Reset the entity revocation state.
     */
    reset: function reset() {
        this._revokedEntityIdentities = {};
        this._revokedEntityAuthSchemes = {};
        this._revokedUserAuthSchemes = {};
        this._revokedEntityUserAuthSchemes = {};
        this._revokedKeyxSchemes = {};
    },
    
    /**
     * @param {string} identity the entity identity to revoke.
     */
    revokeEntity: function revokeEntity(identity) {
        if (this._revokedEntityIdentities.indexOf(identity) == -1)
            this._revokedEntityIdentities.push(identity);
    },
    
    /**
     * @param {string} identity the entity to accept.
     */
    accept: function accept(identity) {
        var index = this._revokedEntityIdentities.indexOf(identity);
        if (index != -1)
            this._revokedEntityIdentities.splice(index, 1);
    },

    /** @inheritDoc */
    isEntityRevoked: function isEntityRevoked(identity) {
        return this._revokedEntityIdentities.indexOf(identity) != -1;
    },
    
    /**
     * <p>This method has two acceptable parameter lists.</p>
     * 
     * <p>The first form accepts an entity identity and an entity
     * authentication, user authentication, or key exchange scheme.</p>
     * 
     * @param {string} identity the entity identity.
     * @param {EntityAuthenticationScheme|UserAuthenticationScheme|KeyExchangeScheme}
     *        scheme the scheme to permit.
     * 
     * <hr>
     * 
     * <p>The second form accepts an entity identity, MSL user, and an entity
     * authentication, user authentication, or key exchange scheme.</p>
     * 
     * @param {string} identity the entity identity.
     * @param {MslUser} user the MSL user.
     * @param {UserAuthenticationScheme} scheme the scheme to disallow.
     */
    permitScheme: function permitScheme(identity, arg1, arg2) {
        var user, scheme;
        if (arg1 instanceof MslUser) {
            user = arg1;
            scheme = arg2;
        } else {
            user = null;
            scheme = arg1;
        }
        
        // Form 2: entity + user => user auth scheme
        if (user) {
            var entityUsers = this._revokedEntityUserAuthSchemes[identity];
            if (!entityUsers) return;
            var revokedSchemes = entityUsers[user.uniqueKey()];
            if (!revokedSchemes) return;
            var index = revokedSchemes.indexOf(scheme);
            if (index != -1)
                revokedSchemes.splice(index, 1);
            return;
        }
        
        // Form 1: entity => entity auth scheme
        if (scheme instanceof EntityAuthenticationScheme) {
            var revokedSchemes = this._revokedEntityAuthSchemes[identity];
            if (!revokedSchemes) return;
            var index = revokedSchemes.indexOf(scheme);
            if (index != -1)
                revokedSchemes.splice(index, 1);
            return;
        }

        // Form 1: entity => user auth scheme
        if (scheme instanceof UserAuthenticationScheme) {
            var revokedSchemes = this._revokedUserAuthSchemes[identity];
            if (!revokedSchemes) return;
            var index = revokedSchemes.indexOf(scheme);
            if (index != -1)
                revokedSchemes.splice(index, 1);
            return;
        }

        // Form 1: entity => key exchange scheme
        if (scheme instanceof KeyExchangeScheme) {
            var revokedSchemes = this._revokedKeyxSchemes[identity];
            if (!revokedSchemes) return;
            var index = revokedSchemes.indexOf(scheme);
            if (index != -1)
                revokedSchemes.splice(index, 1);
            return;
        }
    },

    /**
     * <p>This method has two acceptable parameter lists.</p>
     * 
     * <p>The first form accepts an entity identity and an entity
     * authentication, user authentication, or key exchange scheme.</p>
     * 
     * @param {string} identity the entity identity.
     * @param {EntityAuthenticationScheme|UserAuthenticationScheme|KeyExchangeScheme}
     *        scheme the scheme to disallow.
     * 
     * <hr>
     * 
     * <p>The second form accepts an entity identity, MSL user, and an entity
     * authentication, user authentication, or key exchange scheme.</p>
     * 
     * @param {string} identity the entity identity.
     * @param {MslUser} user the MSL user.
     * @param {UserAuthenticationScheme} scheme the scheme to disallow.
     */
    disallowScheme: function disallowScheme(identity, arg1, arg2) {
        var user, scheme;
        if (arg1 instanceof MslUser) {
            user = arg1;
            scheme = arg2;
        } else {
            user = null;
            scheme = arg1;
        }
        
        // Form 2: entity + user => user auth scheme
        if (user) {
            var entityUsers = this._revokedEntityUserAuthSchemes[identity];
            if (!entityUsers) {
                entityUsers = {};
                this._revokedEntityUserAuthSchemes[identity] = entityUsers;
            }
            var revokedSchemes = entityUsers[user.uniqueKey()];
            if (!revokedSchemes) {
                revokedSchemes = [];
                entityUsers[user.uniqueKey()] = revokedSchemes;
            }
            var index = revokedSchemes.indexOf(scheme);
            if (index == -1)
                revokedSchemes.push(scheme);
        }
        
        // Form 1: entity => entity auth scheme
        if (scheme instanceof EntityAuthenticationScheme) {
            var revokedSchemes = this._revokedEntityAuthSchemes[identity];
            if (!revokedSchemes) {
                revokedSchemes = [];
                this._revokedEntityAuthSchemes[identity] = revokedSchemes;
            }
            var index = revokedSchemes.indexOf(scheme);
            if (index == -1)
                revokedSchemes.push(scheme);
            return;
        }

        // Form 1: entity => user auth scheme
        if (scheme instanceof UserAuthenticationScheme) {
            var revokedSchemes = this._revokedUserAuthSchemes[identity];
            if (!revokedSchemes) {
                revokedSchemes = [];
                this._revokedEntityAuthSchemes[identity] = revokedSchemes;
            }
            var index = revokedSchemes.indexOf(scheme);
            if (index == -1)
                revokedSchemes.push(scheme);
            return;
        }

        // Form 1: entity => key exchange scheme
        if (scheme instanceof KeyExchangeScheme) {
            var revokedSchemes = this._revokedKeyxSchemes[identity];
            if (!revokedSchemes) {
                revokedSchemes = [];
                this._revokedEntityAuthSchemes[identity] = revokedSchemes;
            }
            var index = revokedSchemes.indexOf(scheme);
            if (index == -1)
                revokedSchemes.push(scheme);
            return;
        }
    },

    /** @inheritDoc */
    isSchemePermitted: function isSchemePermitted(identity, arg1, arg2) {
        var user, scheme;
        if (arg1 instanceof MslUser) {
            user = arg1;
            scheme = arg2;
        } else {
            user = null;
            scheme = arg1;
        }
        
        // Form 2: entity + user => user auth scheme
        if (user) {
            var entityUsers = this._revokedEntityUserAuthSchemes[identity];
            if (!entityUsers) return true;
            var revokedSchemes = entityUsers[user.uniqueKey()];
            if (!revokedSchemes) return true;
            return revokedSchemes.indexOf(scheme) == -1;
        }
        
        // Form 1: entity => entity auth scheme
        if (scheme instanceof EntityAuthenticationScheme) {
            var revokedSchemes = this._revokedEntityAuthSchemes[identity];
            if (!revokedSchemes) return true;
            return revokedSchemes.indexOf(scheme) == -1;
        }

        // Form 1: entity => user auth scheme
        if (scheme instanceof UserAuthenticationScheme) {
            var revokedSchemes = this._revokedUserAuthSchemes[identity];
            if (!revokedSchemes) return true;
            return revokedSchemes.indexOf(scheme) == -1;
        }

        // Form 1: entity => key exchange scheme
        if (scheme instanceof KeyExchangeScheme) {
            var revokedSchemes = this._revokedKeyxSchemes[identity];
            if (!revokedSchemes) return true;
            return revokedSchemes.indexOf(scheme) == -1;
        }
    },
});
