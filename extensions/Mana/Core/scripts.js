/**
 * @category    Mana
 * @package     Mana_Core
 * @copyright   Copyright (c) http://www.manadev.com
 * @license     http://www.manadev.com/license  Proprietary License
 */

;var Mana = Mana || {};

(function($, undefined) {


    $.extend(Mana, {
        _singletons: {},

        /**
         * Defines JavaScript class/module
         * @param name class/module name
         * @param dependencies
         * @param callback
         */
        define:function (name, dependencies, callback) {
            var resolved = Mana._resolveDependencyNames(dependencies);
            return define(name, resolved.names, function() {
                return callback.apply(this, Mana._resolveDependencies(arguments, resolved.deps));
            });
        },

        require:function(dependencies, callback) {
            var resolved = Mana._resolveDependencyNames(dependencies);
            return require(resolved.names, function () {
                return callback.apply(this, Mana._resolveDependencies(arguments, resolved.deps));
            });
        },

        _resolveDependencyNames: function(dependencies) {
            var depNames = [];
            var deps = [];
            $.each(dependencies, function (index, dependency) {
                var pos = dependency.indexOf(':');
                var dep = { name:dependency, resolver:'' };
                if (pos != -1) {
                    dep = { name:dependency.substr(pos + 1), resolver:dependency.substr(0, pos) };
                }

                Mana._resolveDependencyName(dep);

                depNames.push(dep.name);
                deps.push(dep);
            });

            return { names: depNames, deps: deps};
        },

        _resolveDependencies:function (args, deps) {
            $.each(args, function (index, arg) {
                args[index] = Mana._resolveDependency(deps[index], arg);
            });

            return args;
        },

        _resolveDependencyName: function(dep) {
        },

        _resolveDependency:function (dep, value) {
            switch (dep.resolver) {
                case 'singleton':
                    if (Mana._singletons[dep.name] === undefined) {
                        Mana._singletons[dep.name] = new value();
                    }
                    return Mana._singletons[dep.name];
            }
            return value;
        }

    });
})(jQuery);

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function (undefined) {
    var initializing = false, fnTest = /xyz/.test(function () { xyz;}) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    Mana.Object = function () {
    };

    // Create a new Class that inherits from this class
    Mana.Object.extend = function (className, prop) {
        if (prop === undefined) {
            prop = className;
            className = undefined;
        }
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            //noinspection JSUnfilteredForInLoop
            prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function (name, fn) {
                    return function () {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        //noinspection JSUnfilteredForInLoop
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        var Object;
        if (className === undefined) {
            // All construction is actually done in the init method
            Object = function Object() { if (!initializing && this._init) this._init.apply(this, arguments); };
        }
        else {
            // give constructor a meaningful name for easier debugging
            eval("Object = function " + className.replace(/\//g, '_') + "() { if (!initializing && this._init) this._init.apply(this, arguments); };");
        }

        // Populate our constructed prototype object
        Object.prototype = prototype;

        // Enforce the constructor to be what we expect
        Object.prototype.constructor = Object;

        // And make this class extendable
        Object.extend = arguments.callee;

        return Object;
    };
})();

Mana.define('Mana/Core', ['jquery'], function ($) {
    return Mana.Object.extend('Mana/Core', {
        getClasses: function(element) {
            return element.className.split(/\s+/);
        },
        getPrefixedClass: function(element, prefix) {
            var result = '';
            //noinspection FunctionWithInconsistentReturnsJS
            $.each(this.getClasses(element), function(key, value) {
                if (value.indexOf(prefix) == 0) {
                    result = value.substr(prefix.length);
                    return false;
                }
            });

            return result;
        },
        base64Decode: function (data) {
            // Decodes string using MIME base64 algorithm
            //
            // version: 1109.2015
            // discuss at: http://phpjs.org/functions/base64_decode
            // +   original by: Tyler Akins (http://rumkin.com)
            // +   improved by: Thunder.m
            // +      input by: Aman Gupta
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   bugfixed by: Onno Marsman
            // +   bugfixed by: Pellentesque Malesuada
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +      input by: Brett Zamir (http://brett-zamir.me)
            // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // -    depends on: utf8_decode
            // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
            // *     returns 1: 'Kevin van Zonneveld'
            // mozilla has this native
            // - but breaks in 2.0.0.12!
            //if (typeof this.window['btoa'] == 'function') {
            //    return btoa(data);
            //}
            var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
                ac = 0,
                dec = "",
                tmp_arr = [];

            if (!data) {
                return data;
            }

            data += '';

            do { // unpack four hexets into three octets using index points in b64
                h1 = b64.indexOf(data.charAt(i++));
                h2 = b64.indexOf(data.charAt(i++));
                h3 = b64.indexOf(data.charAt(i++));
                h4 = b64.indexOf(data.charAt(i++));

                bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

                o1 = bits >> 16 & 0xff;
                o2 = bits >> 8 & 0xff;
                o3 = bits & 0xff;

                if (h3 == 64) {
                    tmp_arr[ac++] = String.fromCharCode(o1);
                } else if (h4 == 64) {
                    tmp_arr[ac++] = String.fromCharCode(o1, o2);
                } else {
                    tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
                }
            } while (i < data.length);

            dec = tmp_arr.join('');
            dec = this.utf8Decode(dec);

            return dec;
        },
        utf8Decode: function (str_data) {
            // Converts a UTF-8 encoded string to ISO-8859-1
            //
            // version: 1109.2015
            // discuss at: http://phpjs.org/functions/utf8_decode
            // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
            // +      input by: Aman Gupta
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   improved by: Norman "zEh" Fuchs
            // +   bugfixed by: hitwork
            // +   bugfixed by: Onno Marsman
            // +      input by: Brett Zamir (http://brett-zamir.me)
            // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // *     example 1: utf8_decode('Kevin van Zonneveld');
            // *     returns 1: 'Kevin van Zonneveld'
            var tmp_arr = [],
                i = 0,
                ac = 0,
                c1 = 0,
                c2 = 0,
                c3 = 0;

            str_data += '';

            while (i < str_data.length) {
                c1 = str_data.charCodeAt(i);
                if (c1 < 128) {
                    tmp_arr[ac++] = String.fromCharCode(c1);
                    i++;
                } else if (c1 > 191 && c1 < 224) {
                    c2 = str_data.charCodeAt(i + 1);
                    tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = str_data.charCodeAt(i + 1);
                    c3 = str_data.charCodeAt(i + 2);
                    tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }

            return tmp_arr.join('');
        },
        urlDecode: function(data) {
            return this.base64Decode(data.replace('-', '+').replace('_', '/').replace(',', '='));
        },
        // Array Remove - By John Resig (MIT Licensed)
        arrayRemove:function (array, from, to) {
            var rest = array.slice((to || from) + 1 || array.length);
            array.length = from < 0 ? array.length + from : from;
            return array.push.apply(array, rest);
        },
        getBlockAlias: function(parentId, childId) {
            var pos;
            if ((pos = childId.indexOf(parentId + '-')) === 0) {
                return childId.substr((parentId + '-').length);
            }
            else {
                return childId;
            }
        }
    });
});
Mana.define('Mana/Core/Ajax', ['jquery', 'singleton:Mana/Core/Layout'], function ($, layout) {
    return Mana.Object.extend('Mana/Core/Ajax', {
        get:function (url, callback, options) {
            var self = this;
            options = this._before(options, url);
            $.get(window.encodeURI(url))
                .done(function (response) { self._done(response, callback, options, url); })
                .fail(function (error) { self._fail(error, options, url)})
                .complete(function () { self._complete(options, url); });
        },
        post:function (url, data, callback, options) {
            var self = this;
            options = this._before(options, url, data);
            $.post(window.encodeURI(url), data)
                .done(function (response) { self._done(response, callback, options, url, data); })
                .fail(function (error) { self._fail(error, options, url, data)})
                .complete(function () { self._complete(options, url, data); });
        },
        _before: function(options, url, data) {
            var page = layout.getPageBlock();
            options = $.extend({
                showOverlay:page.getShowOverlay(),
                showWait:page.getShowWait(),
                showDebugMessages:page.getShowDebugMessages()
            }, options);

            if (options.showOverlay) {
                page.showOverlay();
            }
            if (options.showWait) {
                page.showWait();
            }

            return options;
        },
        _done:function (response, callback, options, url, data) {
            try {
                var content = response;
                try {
                    response = $.parseJSON(response);
                }
                catch (e) {
                    callback(content, { url:url});
                    return;
                }
                if (!response) {
                    if (options.showDebugMessages) {
                        alert('No response.');
                    }
                }
                else if (response.error) {
                    if (options.showDebugMessages) {
                        alert(response.error);
                    }
                }
                else {
                    callback(response, { url:url});
                }
            }
            catch (error) {
                if (options.showDebugMessages) {
                    alert((typeof(error) == 'string' ? error : error.message) + "\n" +
                        (response && typeof(response) == 'string' ? response : ''));
                }
            }
        },
        _fail:function (error, options, url, data) {
            if (options.showDebugMessages) {
                alert(error.status + (error.responseText ? ': ' + error.responseText : ''));
            }
        },
        _complete:function (options, url, data) {
            var page = layout.getPageBlock();
            if (options.showOverlay) {
                page.hideOverlay();
            }
            if (options.showWait) {
                page.hideWait();
            }
        }
    });
});
Mana.define('Mana/Core/Block', ['jquery', 'singleton:Mana/Core', 'singleton:Mana/Core/Layout'], function($, core, layout, undefined) {
    return Mana.Object.extend('Mana/Core/Block', {
        _init: function() {
            this._id = '';
            this._element = null;
            this._parent = null;
            this._children = [];
            this._namedChildren = {};
            this._isSelfContained = false;
            this._eventHandlers = {};
            this._subscribeToHtmlEvents()._subscribeToBlockEvents();
        },
        _subscribeToHtmlEvents: function() {
            return this;
        },
        _subscribeToBlockEvents:function () {
            return this;
        },
        getElement:function() {
            return this._element;
        },
        setElement:function (value) {
            this._element = value;
            return this;
        },
        addChild:function (child) {
            this._children.push(child);
            if (child.getId()) {
                this._namedChildren[core.getBlockAlias(this.getId(), child.getId())] = child;
            }
            child._parent = this;
            return this;
        },
        removeChild: function(child) {
            var index = $.inArray(child, this._children);
            if (index != -1) {
                core.arrayRemove(this._children, index);
                if (child.getId()) {
                    delete this._namedChildren[core.getBlockAlias(this.getId(), child.getId())];
                }
            }
            child._parent = null;
            return this;
        },
        getIsSelfContained: function() {
            return this._isSelfContained;
        },
        setIsSelfContained: function(value) {
            this._isSelfContained = value;
            return this;
        },
        getId:function () {
            return this._id || this.getElement().id;
        },
        setId:function (value) {
            this._id = value;
            return this;
        },
        getParent: function() {
            return this._parent;
        },
        getChild: function(name) {
            return this._namedChildren[name];
        },
        getChildren: function() {
            return this._children;
        },
        _trigger: function(name, e) {
            if (!e.stopped && this._eventHandlers[name] !== undefined) {
                $.each(this._eventHandlers[name], function(key, value) {
                    var result = value.callback.call(value.target, e);
                    if (result === false) {
                        e.stopped = true;
                    }
                    return result;
                });
            }
            return e.result;
        },
        trigger: function(name, e, bubble, propagate) {
            if (e === undefined) {
                e = {};
            }
            if (e.target === undefined) {
                e.target = this;
            }
            if (propagate === undefined) {
                propagate = false;
            }
            if (bubble === undefined) {
                bubble = true;
            }
            this._trigger(name, e);
            if (propagate) {
                $.each(this.getChildren(), function (index, child) {
                    child.trigger(name, e, false, propagate);
                });
            }
            if (bubble && this.getParent()) {
                this.getParent().trigger(name, e, bubble, false);
            }
            return e.result;
        },
        on: function(name, target, callback, sortOrder) {
            if (this._eventHandlers[name] === undefined) {
                this._eventHandlers[name] = [];
            }
            if (sortOrder === undefined) {
                sortOrder = 0;
            }
            this._eventHandlers[name].push({target: target, callback: callback, sortOrder: sortOrder});
            this._eventHandlers[name].sort(function(a, b) {
                if (a.sortOrder < b.sortOrder) return -1;
                if (a.sortOrder > b.sortOrder) return 1;
                return 0;
            });
            return this;
        },
        off:function (name, target, callback) {
            if (this._eventHandlers[name] === undefined) {
                this._eventHandlers[name] = [];
            }
            var found = -1;
            $.each(this._eventHandlers[name], function(index, handler) {
                if (handler.target == target && handler.callback == callback) {
                    found = index;
                    return false;
                }
                else {
                    return true;
                }
            });

            if (found != -1) {
                core.arrayRemove(this._eventHandlers[name], found);
            }
        },
        setContent: function(content) {
            if ($.type(content) != 'string') {
                if (content.content && this.getId() && content.content[this.getId()]) {
                    content = content.content[this.getId()];
                }
                else {
                    return this;
                }
            }

            var vars = layout.beginGeneratingBlocks(this);
            content = $(content);
            $(this.getElement()).replaceWith(content);
            this.setElement(content[0]);
            layout.endGeneratingBlocks(vars);

            return this;
        }
    });
});
Mana.define('Mana/Core/PageBlock', ['jquery', 'Mana/Core/Block'], function ($, Block, undefined) {
    return Block.extend('Mana/Core/PageBlock', {
        _init: function() {
            this._super();
        },
        showOverlay: function() {
            var overlay = $('<div class="m-overlay"></div>');
            overlay.appendTo(this.getElement());
            overlay.css({left:0, top:0}).width($(document).width()).height($(document).height());
            return this;
        },
        hideOverlay: function() {
            $('.m-overlay').remove();
            return this;
        },
        showWait: function() {
            $('#m-wait').show();
            return this;
        },
        hideWait: function() {
            $('#m-wait').hide();
            return this;
        },
        getShowDebugMessages: function() {
            if (this._showDebugMessages === undefined) {
                this._showDebugMessages = true;
            }
            return this._showDebugMessages;
        },
        getShowOverlay:function () {
            if (this._showOverlay === undefined) {
                this._showOverlay = true;
            }
            return this._showOverlay;
        },
        getShowWait:function () {
            if (this._showWait === undefined) {
                this._showWait = true;
            }
            return this._showWait;
        }
    });
});
Mana.define('Mana/Core/Layout', ['jquery', 'singleton:Mana/Core'], function ($, core, undefined) {
    return Mana.Object.extend('Mana/Core/Layout', {
        _init: function() {
            this._pageBlock = null;
        },
        getPageBlock: function() {
            return this._pageBlock;
        },
        beginGeneratingBlocks: function(parentBlock) {
            var vars = {
                parentBlock: parentBlock,
                namedBlocks: {}
            };
            if (parentBlock) {
                parentBlock.trigger('unload', {}, false, true);
                parentBlock.trigger('unbind', {}, false, true);
                vars.namedBlocks = this._removeAnonymousBlocks(parentBlock);
            }
            return vars;
        },
        endGeneratingBlocks: function(vars) {
            var parentBlock = vars.parentBlock, namedBlocks = vars.namedBlocks;
            var self = this;
            this._collectBlockTypes(parentBlock ? parentBlock.getElement() : document.body, function (blockTypes) {
                if (!self._pageBlock) {
                    var PageBlock = blockTypes['Mana/Core/PageBlock'];
                    self._pageBlock = new PageBlock()
                        .setElement($('body')[0])
                        .setId('page');
                }
                var initialPageLoad = (parentBlock === undefined);
                if (initialPageLoad) {
                    parentBlock = self.getPageBlock();
                }

                self._generateBlocksInElement(parentBlock.getElement(), parentBlock, blockTypes, namedBlocks);
                $.each(namedBlocks, function (id, namedBlock) {
                    namedBlock.parent.removeChild(namedBlock.child);
                });
                parentBlock.trigger('bind', {}, false, true);
                parentBlock.trigger('load', {}, false, true);

                // BREAKPOINT: all generated client side blocks
                var a = 1;
            });
        },
        _collectBlockTypes: function(element, callback) {
            var blockTypeNames = ['Mana/Core/PageBlock'];
            this._collectBlockTypesInElement(element, blockTypeNames);
            Mana.require(blockTypeNames, function() {
                var blockTypeValues = arguments;;
                var blockTypes = {};
                $.each(blockTypeNames, function(key, value) {
                    if (blockTypeValues[key]) {
                        blockTypes[value] = blockTypeValues[key];
                    }
                    else {
                        throw "Block type '" + value + "' is not defined.";
                    }
                });
                callback(blockTypes);
            });
        },
        _collectBlockTypesInElement: function(element, blockTypeNames) {
            var layout = this;
            $(element).children().each(function () {
                var blockInfo = layout._getElementBlockInfo(this);
                if (blockInfo) {
                    if (blockTypeNames.indexOf(blockInfo.typeName) == -1) {
                        blockTypeNames.push(blockInfo.typeName);
                    }
                }
                layout._collectBlockTypesInElement(this, blockTypeNames);
            });
        },
        _removeAnonymousBlocks: function(parentBlock) {
            var self = this, result = {};
            $.each(parentBlock.getChildren(), function(key, block) {
                if (block.getId()) {
                    result[block.getId()] = { parent: parentBlock, child: block};
                    self._removeAnonymousBlocks(block);
                }
                else {
                    parentBlock.removeChild(block);
                }
            });
            return result;
        },
        _getElementBlockInfo: function(element) {
            var $element = $(element);
            var id, typeName;

            if ((id = core.getPrefixedClass(element, 'mb-'))
                || (typeName = $element.attr('data-m-block'))
                || $element.hasClass('m-block'))
            {
                return {
                    id: id || $element.attr('data-m-block') || element.id,
                    typeName: typeName || $element.attr('data-m-block')
                        || (id ? 'Mana/Core/NameBlock' : 'Mana/Core/Block')
                };
            }

            return null;
        },
        _generateBlocksInElement: function(element, block, blockTypes, namedBlocks) {
            var layout = this;
            $(element).children().each(function() {
                var childBlock = layout._createBlockFromElement(this, block, blockTypes, namedBlocks);
                layout._generateBlocksInElement(this, childBlock || block, blockTypes, namedBlocks);
            });
        },
        _createBlockFromElement: function(element, parent, blockTypes, namedBlocks) {
            var blockInfo = this._getElementBlockInfo(element);

            if (blockInfo) {
                var type = blockTypes[blockInfo.typeName], block, exists = false;
                if (blockInfo.id) {
                    block = parent.getChild(core.getBlockAlias(parent.getId(), blockInfo.id));
                    if (block) {
                        exists = true;
                        delete namedBlocks[blockInfo.id];
                    }
                    else {
                        block = new type();
                    }
                    block.setId(blockInfo.id);
                }
                else {
                    block = new type();
                }
                block.setElement(element);
                if (!exists) {
                    parent.addChild(block);
                }
                return block;
            }
            else {
                return null;
            }
        }
    });
});
Mana.require(['jquery', 'singleton:Mana/Core/Layout'], function($, layout) {
    $(function() {
        var vars = layout.beginGeneratingBlocks();
        layout.endGeneratingBlocks(vars);
    });
});

//region (Obsolete) additional jQuery functions used in MANAdev extensions
(function($) {
	// this variables are private to this code block
	var _translations = {};
	var _options = {};

	// Default usage of this function is to pass a string in original language and get translated string as a 
	// result. This same function is also used to register original and translated string pairs - in this case
	// plain object with mappings is passed as the only parameter. Anyway, we expect the only parameter to be 
	// passed
	$.__ = function(key) {
		if (typeof key === "string") { // do translation
			var args = arguments;
			args[0] = _translations[key] ? _translations[key] : key;
			return $.vsprintf(args);
		}
		else { // register translation pairs
			_translations = $.extend(_translations, key);
		}
	};
	// Default usage of this function is to pass a CSS selector and get plain object of associated options as 
	// a result. This same function is used to register selector-object pairs in this case plain object with 
	// with mappings is passed as the only parameter. Anyway, we expect the only parameter to be passed
	$.options = function (selector) {
		if (typeof selector === "string") { // return associated options
			return _options[selector];
		}
		else { // register selector-options pairs
			_options = $.extend(true, _options, selector);
		}
		$(document).trigger('m-options-changed');
	};
	
	$.dynamicUpdate = function (update) {
		if (update) {
			$.each(update, function(index, update) {
				$(update.selector).html(update.html);
			});
		}
	}
	$.dynamicReplace = function (update, loud, decode) {
		if (update) {
			$.each(update, function(selector, html) {
				var selected = $(selector);
				if (selected.length) {
					var first = $(selected[0]);
					if (selected.length > 1) {
						selected.slice(1).remove();
					}
					first.replaceWith(decode ? $.utf8_decode(html) : html);
				}
				else {
					if (loud) {
						throw 'There is no content to replace.';
					}
				}
				//console.log('Selector: ' + selector);
				//console.log('HTML: ' + html);
			});
		}
	}
	
	$.errorUpdate = function(selector, error) {
		if (!selector) {
			selector = '#messages';
		}
		var messages = $(selector);
		if (messages.length) {
			messages.html('<ul class="messages"><li class="error-msg"><ul><li>' + error + '</li></ul></li></ul>');
		}
		else {
			alert(error);
		}
	}
	
	// Array Remove - By John Resig (MIT Licensed)
	$.arrayRemove = function(array, from, to) {
	  var rest = array.slice((to || from) + 1 || array.length);
	  array.length = from < 0 ? array.length + from : from;
	  return array.push.apply(array, rest);
	};
	$.mViewport = function() {
		var m = document.compatMode == 'CSS1Compat';
		return {
			l : window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
			t : window.pageYOffset || (m ? document.documentElement.scrollTop : document.body.scrollTop),
			w : window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth),
			h : window.innerHeight || (m ? document.documentElement.clientHeight : document.body.clientHeight)
		};
	}
	$.mStickTo = function(el, what) {
		var pos = $(el).offset();
		var viewport = $.mViewport();
		var top = pos.top + el.offsetHeight;
		var left = pos.left + (el.offsetWidth - what.outerWidth()) / 2;
		if (top + what.outerHeight() > viewport.t + viewport.h) {
			top = pos.top - what.outerHeight();
		}
		if (left + what.outerWidth() > viewport.l + viewport.w) {
			left = pos.left + el.offsetWidth - what.outerWidth();
		}
		what.css({left: left + 'px', top: top + 'px'});
	}

	$.fn.mMarkAttr = function (attr, condition) {
		if (condition) {
			this.attr(attr, attr);
		}
		else {
			this.removeAttr(attr);
		}
		return this;
	}; 
	// the following function is executed when DOM ir ready. If not use this wrapper, code inside could fail if
	// executed when referenced DOM elements are still being loaded.
	$(function() {
		// fix for IE 7 and IE 8 where dom:loaded may fire too early
		try {
		    if (window.mainNav) {
                window.mainNav("nav", {"show_delay":"100", "hide_delay":"100"});
            }
		}
		catch (e) {
			
		}
	});

    $.base64_decode = function (data) {
        // Decodes string using MIME base64 algorithm
        //
        // version: 1109.2015
        // discuss at: http://phpjs.org/functions/base64_decode
        // +   original by: Tyler Akins (http://rumkin.com)
        // +   improved by: Thunder.m
        // +      input by: Aman Gupta
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Onno Marsman
        // +   bugfixed by: Pellentesque Malesuada
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // -    depends on: utf8_decode
        // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
        // *     returns 1: 'Kevin van Zonneveld'
        // mozilla has this native
        // - but breaks in 2.0.0.12!
        //if (typeof this.window['btoa'] == 'function') {
        //    return btoa(data);
        //}
        var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
            ac = 0,
            dec = "",
            tmp_arr = [];

        if (!data) {
            return data;
        }

        data += '';

        do { // unpack four hexets into three octets using index points in b64
            h1 = b64.indexOf(data.charAt(i++));
            h2 = b64.indexOf(data.charAt(i++));
            h3 = b64.indexOf(data.charAt(i++));
            h4 = b64.indexOf(data.charAt(i++));

            bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

            o1 = bits >> 16 & 0xff;
            o2 = bits >> 8 & 0xff;
            o3 = bits & 0xff;

            if (h3 == 64) {
                tmp_arr[ac++] = String.fromCharCode(o1);
            } else if (h4 == 64) {
                tmp_arr[ac++] = String.fromCharCode(o1, o2);
            } else {
                tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
            }
        } while (i < data.length);

        dec = tmp_arr.join('');
        dec = $.utf8_decode(dec);

        return dec;
    };
    $.utf8_decode = function (str_data) {
        // Converts a UTF-8 encoded string to ISO-8859-1
        //
        // version: 1109.2015
        // discuss at: http://phpjs.org/functions/utf8_decode
        // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
        // +      input by: Aman Gupta
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: Norman "zEh" Fuchs
        // +   bugfixed by: hitwork
        // +   bugfixed by: Onno Marsman
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // *     example 1: utf8_decode('Kevin van Zonneveld');
        // *     returns 1: 'Kevin van Zonneveld'
        var tmp_arr = [],
            i = 0,
            ac = 0,
            c1 = 0,
            c2 = 0,
            c3 = 0;

        str_data += '';

        while (i < str_data.length) {
            c1 = str_data.charCodeAt(i);
            if (c1 < 128) {
                tmp_arr[ac++] = String.fromCharCode(c1);
                i++;
            } else if (c1 > 191 && c1 < 224) {
                c2 = str_data.charCodeAt(i + 1);
                tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = str_data.charCodeAt(i + 1);
                c3 = str_data.charCodeAt(i + 2);
                tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }

        return tmp_arr.join('');
    };

    var _popupFadeoutOptions = { overlayTime: 500, popupTime: 1000, callback: null };
    $.mSetPopupFadeoutOptions = function(options) {
        _popupFadeoutOptions = options;
    }
    $.fn.extend({
        mPopup: function(name, options) {
            var o = $.extend({
                fadeOut: { overlayTime: 0, popupTime:500, callback:null },
                fadeIn: { overlayTime: 0, popupTime:500, callback: null },
                overlay: { opacity: 0.2},
                popup: { contentSelector:'.' + name + '-text', containerClass:'m-' + name + '-popup-container', top:100 }

            }, options);
            $(this).live('click', function() {
                if ($.mPopupClosing()) {
                    return false;
                }
                // preparations
                var html = $(o.popup.contentSelector).html();
                $.mSetPopupFadeoutOptions(o.fadeOut);

                // put overlay to prevent interaction with the page and to catch 'cancel' mouse clicks
                var overlay = $('<div class="m-popup-overlay"> </div>');
                overlay.appendTo(document.body);
                overlay.css({left:0, top:0}).width($(document).width()).height($(document).height());
                overlay.animate({ opacity:o.overlay.opacity }, o.fadeIn.overlayTime, function () {
                    // all this code is called when overlay animation is over

                    // fill popup with content
                    $('#m-popup')
                        .css({"width":"auto", "height":"auto"})
                        .html(html)
                        .addClass(o.popup.containerClass)
                        .css("top", (($(window).height() - $('#m-popup').outerHeight()) / 2) - o.popup.top + $(window).scrollTop() + "px")
                        .css("left", (($(window).width() - $('#m-popup').outerWidth()) / 2) + $(window).scrollLeft() + "px")

                    // get intended height and set initial height to 0
                    var popupHeight = $('#m-popup').height();
                    $('#m-popup').show().height(0);
                    $('#m-popup').hide().css({"height":"auto"});

                    // calculate intended popup position
                    var css = {
                        left:$('#m-popup').css('left'),
                        top:$('#m-popup').css('top'),
                        width:$('#m-popup').width() + "px",
                        height:$('#m-popup').height() + "px"
                    };

                    // adjust (the only) child of popup container element
                    $('#m-popup').children().each(function () {
                        $(this).css({
                            width:($('#m-popup').width() + $(this).width() - $(this).outerWidth()) + "px",
                            height:($('#m-popup').height() + $(this).height() - $(this).outerHeight()) + "px"
                        });
                    });

                    // make popup a point
                    $('#m-popup')
                        .css({
                            top:($(window).height() / 2) - o.popup.top + $(window).scrollTop() + "px",
                            left:($(window).width() / 2) + $(window).scrollLeft() + "px",
                            width:0 + "px",
                            height:0 + "px"
                        })
                        .show();

                    // explode popup to intended size
                    $('#m-popup').animate(css, o.fadeIn.popupTime, function () {
                        if (o.fadeIn.callback) {
                            o.fadeIn.callback();
                        }
                    });
                });

                // prevent following to target link of <a> tag
                return false;
            });
        }
    });
    var _popupClosing = false;
    $.mPopupClosing = function (value) {
        if (value !== undefined) {
            _popupClosing = value;
        }
        return _popupClosing;
    };
    $.mClosePopup = function () {
        $.mPopupClosing(true);
        $('.m-popup-overlay').fadeOut(_popupFadeoutOptions.overlayTime, function() {
            $('.m-popup-overlay').remove();
            $('#m-popup').fadeOut(_popupFadeoutOptions.popupTime, function() {
                if (_popupFadeoutOptions.callback) {
                    _popupFadeoutOptions.callback();
                }
                $.mPopupClosing(false);
            });
        })
        return false;
    };

    $(function () {
        $('.m-popup-overlay').live('click', $.mClosePopup);
        $('#m-popup .m-close-popup').live('click', $.mClosePopup);
        $(document).keydown(function (e) {
            if ($('.m-popup-overlay').length) {
                if (e.keyCode == 27) {
                    return $.mClosePopup();
                }
            }
        });
    });
})(jQuery);
//endregion