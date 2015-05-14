LOG.inform("XMLDOC.DomReader loaded");

XMLDOC.DomReader = function(root) {

   this.dom = root;

   /**
    * The current endNode the reader is on
    */
   this.node = root;

   /**
    * Get the current endNode the reader is on
    * @type XMLDOC.Parser.node
    */
   XMLDOC.DomReader.prototype.getNode = function() {
      return this.node;
   };

   /**
    * Set the endNode the reader should be positioned on.
    * @param node {XMLDOC.Parser.node}
    */
   XMLDOC.DomReader.prototype.setNode = function(node) {
      this.node = node;
   };

   /**
    * A helper method to make sure the current endNode will
    * never return null, unless null is passed as the root.
    * @param step {String} An expression to evaluate - should return a endNode or null
    */
   XMLDOC.DomReader.prototype.navigate = function(step) {
      var n;
      if ((n = step) != null)
      {
         this.node = n;
         return this.node;
      }
      return null;
   };

   /**
    * Get the root endNode of the current endNode's document.
    */
   XMLDOC.DomReader.prototype.root = function() {
      this.navigate(this.dom);
   };

   /**
    * Get the parent of the current endNode.
    */
   XMLDOC.DomReader.prototype.parent = function() {
      return this.navigate(this.node.parentNode());
   };

   /**
    * Get the first child of the current endNode.
    */
   XMLDOC.DomReader.prototype.firstChild = function() {
      return this.navigate(this.node.firstChild());
   };

   /**
    * Get the last child of the current endNode.
    */
   XMLDOC.DomReader.prototype.lastChild = function() {
      return this.navigate(this.node.lastChild());
   };

   /**
    * Get the next sibling of the current endNode.
    */
   XMLDOC.DomReader.prototype.nextSibling = function() {
      return this.navigate(this.node.nextSibling());
   };

   /**
    * Get the previous sibling of the current endNode.
    */
   XMLDOC.DomReader.prototype.prevSibling = function() {
      return this.navigate(this.node.prevSibling());
   };

   //===============================================================================================
   // Support methods

   /**
    * Walk the tree starting with the current endNode, calling the plug-in for
    * each endNode visited.  Each time the plug-in is called, the DomReader
    * is passed as the only parameter.  Use the {@link XMLDOC.DomReader#getNode} method
    * to access the current endNode.   <i>This method uses a depth first traversal pattern.</i>
    *
    * @param srcFile {String} The source file being evaluated
    */
   XMLDOC.DomReader.prototype.getSymbols = function(srcFile)
   {
      XMLDOC.DomReader.symbols = [];
      XMLDOC.DomReader.currentFile = srcFile;
      JSDOC.Symbol.srcFile = (srcFile || "");

      if (defined(JSDOC.PluginManager)) {
         JSDOC.PluginManager.run("onDomGetSymbols", this);
      }

      return XMLDOC.DomReader.symbols;
   };

   /**
    * Find the endNode with the given name using a depth first traversal.
    * Does not modify the DomReader's current endNode.
    *
    * @param name {String} The name of the endNode to find
    * @return the endNode that was found, or null if not found
    */
   XMLDOC.DomReader.prototype.findNode = function(name)
   {
      var findNode = null;

      // Start at the current endNode and move into the subtree,
      // looking for the endNode with the given name
      function deeper(node, find)
      {
         var look = null;

         if (node) {
            if (node.name == find)
            {
               return node;
            }

            if (node.firstChild())
            {
               look = deeper(node.firstChild(), find);
            }

            if (!look && node.nextSibling())
            {
               look = deeper(node.nextSibling(), find);
            }
         }

         return look;
      }

      return deeper(this.getNode().firstChild(), name);
   };

   /**
    * Find the next endNode with the given name using a depth first traversal.
    *
    * @param name {String} The name of the endNode to find
    */
   XMLDOC.DomReader.prototype.findPreviousNode = function(name)
   {
   };

};

