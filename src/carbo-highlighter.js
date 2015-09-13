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
            element: {
                type: Object,
                notify: true,
            }
        },

        ready: function () {

            if (this.element) {
                this.highlight(this.element, true);
            }
        },

        /**
         * Highlights a given element
         * @param  {DOMNode} element The node to be highlighted
         */
        highlight: function (element, force) {
            if (!element) {
                throw new Error('No element for highlight(element)');
            }

            // If the new highlighted element is the same as the 
            // currentActive one, just let it be.
            if (this.element === element && !force) {
                return; 
            }

            // If there is an element unHighlight it
            if (this.element) {
                this.unHighlight(this.element);
            }

            // Save the element to the active element
            this.element = element;

            // The wrapper DOMNode
            var wrapper = this.$.wrapper;
            // The bounding rectangle for the element to be hightlighted
            var rect        = element.getBoundingClientRect();
            
            this.toggleClass('show', true, wrapper);

            // Set positions
            wrapper.style.left   = rect.left   + 'px';
            wrapper.style.top    = rect.top    + 'px';
            wrapper.style.width  = rect.width  + 'px';
            wrapper.style.height = rect.height + 'px';

            // There are some styles that interfere drastically 
            // on the positioning, such as border radius.
            // We want to mimic those styles from 
            // the highlighted element to the wrapper
            var computedStyle = DOMHelpers.getComputedStyle(element);

            // get the surface element
            var surface = this.$.surface;

            //forEach - para cada um dos itens do array MIMIC_STYLES
            MIMIC_STYLES.forEach(function (styleProp) {
                if (computedStyle[styleProp]) {
                    // Simply copy the styles
                    surface.style[styleProp] = computedStyle[styleProp];
                }
            });
        },

        /**
         * Removes highlight.
         */
        unHighlight: function () {

            var wrapper = this.$.wrapper;

            this.toggleClass('show', false, wrapper);

            // Unmimic styles
            MIMIC_STYLES.forEach(function (styleProp) {
                delete wrapper.style[styleProp];
            });

            delete this.element;
        },
    });

})();