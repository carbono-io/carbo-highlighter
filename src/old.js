setTarget:             if (!element) {
                throw new Error('No element for setTarget(element)');
            }

            // If the new highlighted element is the same as the 
            // currentActive one, just let it be.
            if (this.target === element && !force) {
                return; 
            }

            // If there is an element hide it
            if (this.target) {
                this.hide();
            }

            // Save the element to the active element
            this.target = element;

            // The wrapper DOMNode
            var wrapper = this.$.wrapper;
            // The bounding rectangle for the element to be hightlighted
            var rect    = element.getBoundingClientRect();
            
            this.toggleClass('show', true, wrapper);

            // Set positions
            wrapper.style.left   = rect.left   + 'px';
            wrapper.style.top    = rect.top    + 'px';
            wrapper.style.width  = rect.width  + 'px';
            wrapper.style.height = rect.height + 'px';

            this._setSurfaceStyles();
