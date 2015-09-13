(function () {

    function nodeListToArray(nodeList) {

        if (nodeList instanceof Node) {
            // If is a single node, simply return array
            // containing the single node
            return [nodeList];

        } else if (nodeList instanceof NodeList) {
            // If is a NodeList, convert using Array.prototype.slice technique
            // See:
            // https://developer.mozilla.org/en/docs/Web/API/NodeList
            // 'Converting a NodeList to an Array'
            return Array.prototype.slice.call(nodeList);

        } else if (Array.isArray(nodeList)) {
            // If is array, simply return it
            return nodeList;

        } else {
            // Otherwise, throw error
            throw new Error('Could not convert nodeList into Array');
        }
    }


    function JSONtoCSS(styles) {

        var str = '';

        for (prop in styles) {
            str += prop + ':' + styles[prop] + ';';
        }

        return str;
    }

    /**
     * Style properties to be mimiced by the highlighter element
     * @type {Array}
     */
    var MIMIC_STYLES = [
        'border-top-left-radius',
        'border-top-right-radius',
        'border-bottom-left-radius',
        'border-bottom-right-radius',
    ];

    /**
     * Helper methods for manipulating DOMNodes
     * @type {Object}
     */
    var DOMHelpers = {
        /**
         * Retrieves the computed style of an given element
         * @param  {DOMNode} element The element from which to read computedSytles
         * @return {Object}          Object with the computed styles
         */
        getComputedStyle: function (element) {

            if (!element) {
                throw new Error('No element for getComputedStyle(element)');
            }

            var cs = {};

            // Get the computed cs of the element
            var _cs = window.getComputedStyle(element);

            for (var i = _cs.length - 1; i >=0; i--) {
                var prop = _cs[i];

                cs[prop] = _cs.getPropertyValue(prop);
            }

            return cs;
        },

        /**
         * Retrieves the attributes of a given element
         * @param  {DOMNode} element The element from which to read attributes
         * @return {Object}          Object with all attributes
         */
        getAttributes: function (element) {

            if (!element) {
                throw new Error('No element for getAttributes(element)');
            }

            // Object on which to store attributes
            var attributes = {};

            var _attrs = element.attributes;

            for (var i = _attrs.length - 1; i >= 0; i--) {
                attributes[_attrs[i].name] = _attrs[i].value;
            }

            return attributes;
        },
    };


    Polymer({
        is: 'carbo-highlighter',

        properties: {
            target: {
                type: Object,
                notify: true,
                observer: '_onTargetChange',
            },

            surfaceStyles: {
                type: Object,
                notify: true,
                observer: '_onSurfaceStylesChange',
            }
        },

        ready: function () {

            // Array of highlighters
            this._highlighters = [];

            this.target = [];
        },

        /**
         * Highlights a given nodeList
         * @param  {DOMNode} nodeList The node to be highlighted
         */
        setTarget: function (nodeList, force) {
            // Convert nodeList to array
            nodeList = nodeListToArray(nodeList);

            this.set('target', nodeList)
        },

        /**
         * Removes highlight.
         */
        hide: function () {

            var wrapper = this.$.wrapper;

            this.toggleClass('show', false, wrapper);

            // Unmimic styles
            MIMIC_STYLES.forEach(function (styleProp) {
                delete wrapper.style[styleProp];
            });

            delete this.target;
        },

        _createHighlighter: function (targetNode, options) {



            var highlighter = this._getHighlighter(targetNode) || {};

            // Set target node
            highlighter.targetNode = targetNode;
            highlighter.state = 'active';

            // The bounding rectangle for the targetNode to be hightlighted
            var rect = targetNode.getBoundingClientRect();

            var wrapperStyle = {
                left  : rect.left   + 'px',
                top   : rect.top    + 'px',
                width : rect.width  + 'px',
                height: rect.height + 'px',
            };

            highlighter.wrapperStyle = JSONtoCSS(wrapperStyle);

            this.push('_highlighters', highlighter);

            return highlighter;
        },

        _getHighlighter: function (targetNode) {
            return _.find(this._highlighters, function (hlt, index) {
                return hlt.targetNode === targetNode;
            });
        },

        _destroyHighlighter: function (targetNode) {

            var index = _.indexOf(this._highlighters, function (hlt) {
                return hlt.targetNode = targetNode;
            });

            this.splice('_highlighters', index, 1);
        },

        /**
         * Handles changes on the element
         */
        _onTargetChange: function (target, _target) {

            var toRemove = [];

            if (_target) {

                // Loop old targets to check which ones should be removed
                _target.forEach(function (node) {

                    var shouldRemain = target.indexOf(node) !== -1;

                    if (!shouldRemain) {
                        toRemove.push(node);
                    }
                });
            }

            // Loop nodes to remove their highlighters
            toRemove.forEach(function (node) {

                this._destroyHighlighter(node);

            }.bind(this));

            // Loop target and create a new highlighter for each node
            target.forEach(function (targetNode) {

                // Create highlighter only if no highlighter 
                // has been created for it

                this._createHighlighter(targetNode);

            }.bind(this));

            // this._setSurfaceStyles();

        },

        /**
         * Handle changes on the border
         */
        _onSurfaceStylesChange: function () {
            var surface = this.$.surface;

            console.log('_onSurfaceStylesChange');

            for (prop in this.surfaceStyles) {
                surface.style[prop] = this.surfaceStyles[prop];
            }
        },

        /**
         * Surface styles
         */
        _setSurfaceStyles: function (styles) {
            // There are some styles that interfere drastically 
            // on the positioning, such as border radius.
            // We want to mimic those styles from 
            // the highlighted element to the wrapper
            var computedStyle = DOMHelpers.getComputedStyle(this.target);

            // get the surface element
            var surface = this.$.surface;

            //forEach - para cada um dos itens do array MIMIC_STYLES
            MIMIC_STYLES.forEach(function (styleProp) {
                if (computedStyle[styleProp]) {
                    // Simply copy the styles
                    surface.style[styleProp] = computedStyle[styleProp];
                }
            });

            // Set border styles
        },

    });

})();