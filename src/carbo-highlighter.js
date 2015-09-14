(function () {


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
                observer: 'updatePosition',
            },

            surfaceStyle: {
                type: Object,
                notify: true,
                observer: '_updateSurfaceStyle',
            },

            state: {
                type: String,
                notify: true,
                value: 'inactive'
            }
        },

        ready: function () {

            window.addEventListener('scroll', this.updatePosition.bind(this));
        },

        updatePosition: function () {

            if (this.target) {
                // The wrapper DOMNode
                var wrapper = this.$.wrapper;
                // The bounding rectangle for the element to be hightlighted
                var rect    = this.target.getBoundingClientRect();

                // Set positions
                wrapper.style.left   = rect.left   + 'px';
                wrapper.style.top    = rect.top    + 'px';
                wrapper.style.width  = rect.width  + 'px';
                wrapper.style.height = rect.height + 'px';

                this._updateSurfaceStyle();
            }
        },

        /**
         * Surface style
         */
        _updateSurfaceStyle: function () {

            if (this.target) {
                // There are some style that interfere drastically 
                // on the positioning, such as border radius.
                // We want to mimic those style from 
                // the highlighted element to the wrapper
                var computedStyle = DOMHelpers.getComputedStyle(this.target);

                // get the surface element
                var surface = this.$.surface;

                //forEach - para cada um dos itens do array MIMIC_STYLES
                MIMIC_STYLES.forEach(function (styleProp) {
                    if (computedStyle[styleProp]) {
                        // Simply copy the style
                        surface.style[styleProp] = computedStyle[styleProp];
                    }
                });

                // Set surfaceStyle
                for (prop in this.surfaceStyle) {
                    surface.style[prop] = this.surfaceStyle[prop];
                }
            }
        },

        highlight: function (target, surfaceStyle) {
            this.set('state', 'active');

            this.set('target', target);

            if (surfaceStyle) {
                this.set('surfaceStyle', surfaceStyle);
            }
        },

        /**
         * Removes highlight.
         */
        hide: function () {

            var wrapper = this.$.wrapper;

            this.set('state', 'inactive');

            // Unmimic styles
            MIMIC_STYLES.forEach(function (styleProp) {
                delete wrapper.style[styleProp];
            });

            this.set('target', false);
        },

    });

})();