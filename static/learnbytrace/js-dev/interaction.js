/*global window, addHighlight, setup, buildTraceTreeMarkup, collapseLevel, 
  expandLevel, getChildByClassName, expandViewportHeight, addStyleClass, removeStyleClass,
  selectCodeLine, selectTraceLine, getElementList */

// TODO: think about scoping and such. This is global right now.
var oldLineNumber;
var oldSelection;

// Set the page to run the setup function when it loads.
window.onload = setup;

function setup() {

  // Before we can assign listeners, we have to alter the DOM tree representing the custom 
  // XML tags for the trace tree to convert it into a hierarchy of divs and spans
  var traceTreeRoot = document.getElementsByTagName('trace')[0];
  buildTraceTreeMarkup(traceTreeRoot);
   
  var index;
  var element;
  // Register event listeners for highlighting selected line in trace view and pseudocode view  
  var collapsibleDivs = document.getElementsByClassName('collapsible');
  for (index = 0; index < collapsibleDivs.length; index += 1) {
    
    element = collapsibleDivs[index];
    element.addEventListener('click', addHighlight, true);
  }
  
  // Register event listeners for the buttons that collapse and expand the trace view tree.
  var collapseButtons = document.getElementsByClassName('collapse-button');
  for(index = 0; index < collapseButtons.length; index += 1) {
    element = collapseButtons[index];
    element.addEventListener('click', collapseLevel, false);
  }
  
  var expandButtons = document.getElementsByClassName('expand-button');
  for(index = 0; index < expandButtons.length; index += 1) {
    element = expandButtons[index];
    element.addEventListener('click', expandLevel, false);
  }
  
  // On page load, start out by highlighting line 0, the first line.
  var traceDiv = document.getElementById('trace-container');
  var topCollapsible = getChildByClassName(traceDiv, 'collapsible');
  // Use the javascript "apply" method to invoke the event handler with topCollapsible as the context.
  addHighlight.apply(topCollapsible);
  
  // Also try to expand the viewport to fit the available window height.
  expandViewportHeight();
}

function expandViewportHeight() {
  // Note this does not work on IE, but we aren't supporting all browsers anyway and it already has
  // a default height, this is just an enhancement where possible.
  var viewportHeight = document.documentElement.clientHeight;
  
  // If viewport height is defined 
  if( viewportHeight >= 750) {
    
    var traceView = document.getElementById('trace-container');
    addStyleClass(traceView, 'long');
    var codeView = document.getElementById('code-container');
    addStyleClass(codeView, 'long');
    var dataView = document.getElementById('dataset-container');
    addStyleClass(dataView, 'long');
  }
}

// This is a function to expand a visible level in the div hierarchy. It does this by hiding
// the "collapsed" div and showing the "expanded" div.
function expandLevel() {

  var currentDiv = this.parentElement.parentElement;
  addStyleClass(currentDiv, 'hidden');

  var parent = currentDiv.parentElement;
  var enabledDiv = getChildByClassName(parent,'expanded');
  removeStyleClass(enabledDiv, 'hidden');

}

// This is a function to collapse a visible level in the div hierarchy. It does this by hiding
// the "expanded" div and showing the "collapsed" div
function collapseLevel() {
  
  var currentDiv = this.parentElement.parentElement;  
  addStyleClass(currentDiv, 'hidden'); 

  var parent = currentDiv.parentElement;
  var enabledDiv = getChildByClassName(parent, 'collapsed');
  removeStyleClass(enabledDiv, 'hidden');
}

/* This function is the event handler for switching the selected line when you click on a node in the trace view. 
 * It highlights the node that was clicked on in the trace view as well as the line of pseudocode that matches
 * the lineNumber attribute. If there is no lineNumber attribute, the event bubbles up until it finds one that does have it.
 */
function addHighlight() {
  
  // If the current div has a lineNumber, highlight the corresponding line in the pseudocode.
  var lineNumber = this.attributes.lineNumber; 
  if (lineNumber) {
  
    // Highlight the target line in the pseudocode view
    selectCodeLine(lineNumber.nodeValue);
  }
    
   // Show which line is selected in the trace view as well
   selectTraceLine(this);
}

/* This function switches the current visually highlighted line in the trace tree to the given DOM element.
 */
function selectTraceLine(selection) {

    var index;
    var childElements;
    var target;
    // Kill old selection
    if( oldSelection ) {
      
      // Get child elements of currently selected div.
      childElements = getElementList(oldSelection);
      
      // Loop through them (should only be two div's, one of class expanded and one of class collapsed')
      for(index = 0; index < childElements.length; index += 1) {
        
        // Pull the line sub-node out of each one and remove the style to hide the selection.
        target = childElements[index].getElementsByClassName('line')[0];
        removeStyleClass(target, 'selected');
      }    
    }
    
    // Now show new selection
    childElements = getElementList(selection);
    for(index = 0; index < childElements.length; index += 1 ) {
        // Pull the line sub-node out of each one and remove the style to hide the selection.
        target = childElements[index].getElementsByClassName('line')[0];
        addStyleClass(target, 'selected');
    }
    
    // And update the global reference :( to the currently selected element.
    oldSelection = selection;
}

/* This function switches the current visually highlighted line of pseudocode to the given line number.
 */
function selectCodeLine(lineNumber) {
  var line,
      oldLine;
  
  // If something is currently highlighted, unhighlight it.
  if( oldLineNumber ) {
    oldLine = document.getElementById('pseudocode_' + oldLineNumber);
    removeStyleClass(oldLine, 'highlighted');
  }
  
  // Higlight the new line number
  line = document.getElementById('pseudocode_' + lineNumber);
  addStyleClass(line, 'highlighted');
  
  // And update the global :( which tracks what's currently highlighted.
  oldLineNumber = lineNumber;
}
