/*global getElementList, processValueNode, processNode */

var tabCounter;
var createDictionaryTable, createListTable;

function createCollapsibleStructure(node, nodeInfo) {
    
    // Save out current tab index value so it can be consistent across expanded and collapsed divs. 
    var currentTabIndex = tabCounter;
    // Increase global tab counter so that each node in the tree has a higher index than
    // the last node, but the expanded and collapsed views of each node have the same tab index.
    tabCounter += 1;

    // Create the top-level div for this node, which holds both expanded and collapsed views.
    var currentNode = document.createElement("div");
    currentNode.className = "collapsible";
    
    var displayTitle = nodeInfo.caption; //['caption'];

    // Process attributes which appear on some tags.
    if (node.hasAttributes() ) {
      
      // If the tag has a name, add that to the branch title
      var name = node.attributes.name;
      if( name ) { 
        displayTitle += ': ' + name.nodeValue;
      }
      
      // If the tag has a line number, add it to the branch title and the collapsible div's attributes.
      var lineNumber = node.attributes.line;    
      if ( lineNumber ) {
        displayTitle += ' (line ' + lineNumber.nodeValue + ')';
         
        var lineNumberAttribute = document.createAttribute('lineNumber');
        lineNumberAttribute.nodeValue = lineNumber.nodeValue;
        currentNode.setAttributeNode(lineNumberAttribute);
       }
    }
    
    // Create the expanded view div
    var expandedNode = document.createElement("div");
    
    // Use the nodeInfo dictionary of display metadata to decide whether to show or hide the node
    // by default.
    if( nodeInfo.expanded ) {
      expandedNode.className = "expanded";
    }
    else {
      expandedNode.className = "expanded hidden";
    }
    
    // Create line div that holds the title and button for the expanded view
    var lineNode = document.createElement("div");
    lineNode.className = "line"; 
    // Create expand button
    var button = document.createElement("span");
    button.className = "button collapse-button";
    button.tabIndex = currentTabIndex;
    
    // Create title text
    var title = document.createElement("span");
    title.className = "text";
    title.appendChild(document.createTextNode(displayTitle));

    // Hook the nodes together -- expanded ( line ( button title ) expandedContent( .. )
    lineNode.appendChild(button);
    lineNode.appendChild(title);
    
    // Put the line node under the expanded div
    expandedNode.appendChild(lineNode);

    // Create div that holds the actual children displayed in the expanded view.
    var expandedContent = document.createElement("div");
    expandedContent.className = "collapsible-content";
    
    // Now get the children (value nodes), process them, and add them to the new collapsible-content sub-tree.
    var children = getElementList(node);
    
    var index;
    var newChild;
    if ( nodeInfo.leaf ) {
      // If the node is a leaf, we assume all children are value nodes, because that is
      // the definition of a leaf node here.
      
      for (index = 0; index < children.length; index += 1) {
  
        newChild = processValueNode(children[index]);
        expandedContent.appendChild(newChild);
      }
    }
    else {
      // Otherwise, start the whole node processing process over again for the child branches.
      for (index = 0; index < children.length; index += 1) {
        
        newChild = processNode(children[index]);
        expandedContent.appendChild(newChild);
      }
    }
    
    // Put the expandedContent div under the expanded div, after the line div.
    expandedNode.appendChild(expandedContent);
    
    // Hook the expanded div to the root collapsible node that we'll return.
    currentNode.appendChild(expandedNode); 
    
    // Create all the nodes for the collapsed div subtree.
    var collapsedNode = document.createElement("div");
    // Use the nodeInfo dictionary of display metadata to decide whether to show or hide the node
    // by default.
    if( nodeInfo.expanded ) {
      collapsedNode.className = "collapsed hidden";
    }
    else {
      collapsedNode.className = "collapsed";
    }
    
    lineNode = document.createElement("div");
    lineNode.className = "line";
    
    // Create expand button
    button = document.createElement("span");
    button.className = "button expand-button";
    button.tabIndex = currentTabIndex;

    // Create title text
    title = document.createElement("span");
    title.className = "text";
    title.appendChild(document.createTextNode(displayTitle + ' ...'));
    
    // Hook the nodes together -- collapsed ( line(  button title ))
    lineNode.appendChild(button);
    lineNode.appendChild(title);
    collapsedNode.appendChild(lineNode);
    
    // Hook the collapsed div to the root collapsible node that we'll return.
    currentNode.appendChild(collapsedNode);    
    
    return currentNode;    
}

function processNode(node) {
      
   // This is a dictionary of node names (from the xml markup) with metadata about how
   // to display them. "Leaf" indicates if that node can contain other tags in this dictionary,
   // and "expanded" indicates whether to initially display the node as expanded in the tree view.
   var nodeDict = {
     'algorithm_input': {'caption': "Algorithm input(s)", 'leaf': true, 'expanded': true},
                         
     'algorithm_output': {'caption':"Algorithm output(s)", 'leaf': true, 'expanded': true},
                          
     'parameters': {'caption': "Parameter(s)", 'leaf': true, 'expanded': false },
                    
     'variable': {'caption': "Variable update", 'leaf': true,'expanded': false },
                  
     'loop_variable': {'caption': "Loop variable update", 'leaf': true,'expanded': false },
                       
     'trace': {'caption': "Algorithm trace GO!", 'leaf': false, 'expanded': true},
               
     'function': {'caption': "Function call", 'leaf': false,'expanded': false},
                  
     'loop': {'caption': "Loop", 'leaf': false, 'expanded': false },
     
     'iteration': {'caption': "Iteration", 'leaf': false, 'expanded': false },
     
     'if': {'caption': "If branch taken", 'leaf': false, 'expanded': false },
     
     'else': {'caption': "Else branch taken", 'leaf': false, 'expanded': false }        
   };
   
   var currentTag = node.tagName.toLowerCase();
   if ( currentTag in nodeDict ) {
      // Pass the node as well as the display caption for the branch.
      return createCollapsibleStructure(node, nodeDict[currentTag]);
   }
}

function buildTraceTreeMarkup(treeRoot) {
  // Basic idea here: walk the tree recursively, building the necessary markup for each tree level
  // This should be much simpler since we are dealing with a tree, rather than parsing the markup directly
  
  // Should eventually remove the root (<trace> tag) tree from the DOM completely (so there will be no 
  // custom tags in the final output), and in its place add the generated tree of divs and spans.

  // Replace the tree rooted at the trace tag (which contains all of the custom tags) with the markup
  // tree structure we generated.
  
  // Initialize global counter for tabindex at the next value after the rest of the page's tab order.
  tabCounter = 5;
  
  var tempRoot = document.getElementsByTagName('variable')[0];
  var convertedTreeRoot = processNode(treeRoot);
  
  var container = treeRoot.parentNode;
  container.replaceChild(convertedTreeRoot, treeRoot);

}

function processValueNode(treeNode) {
  // This is a function that processes the lowest level node, the leaf node <value> which
  // is the one that actually displays content as opposed to just structure.

  if( treeNode.tagName.toLowerCase() != "value") {
    return null;
  }

    // Note: I'm assuming here that the value node has only a single text node child, which will be
    // true as long as there is no extra whitespace between the enclosing tags and the text.
    var valueName = treeNode.getAttribute('name');
    var valueText = treeNode.childNodes[0].nodeValue;
    
    var currentNode = document.createElement("span");
    currentNode.className = "text";

    // Regardless of what follows, we want to display the name of the value first
    var textNode = document.createTextNode(valueName + ': ');
    currentNode.appendChild(textNode);
    
    var table;
    if( valueText.indexOf('{') === 0 ) {
    // If the text starts with {, then it is a dictionary (so display keys and values) 

      // The eval statement assigns the executed(!) dictionary literal to textDict
      // It's a hack so I don't have to parse out the dictionary syntax on either side, and will
      // have to be altered anyway if I want to support any other than dictionary syntax.
      var textDict;
      eval('textDict = ' + valueText);
      
      table = createDictionaryTable(textDict);
      currentNode.appendChild(table);
      
    } else if( valueText.indexOf('[') === 0) {
    // If the text start with [, then it is a list (so display indices and values)
       
      // The eval statement assigns the executed(!) list literal to textList
      var textList;
      eval('textList = ' + valueText);
      
      table = createListTable(textList);
      currentNode.appendChild(table);
      
    } else {
    // Otherwise it's just a single-value variable that can be displayed as text.
      textNode = document.createTextNode(valueText);
      currentNode.appendChild(textNode);
    }
 
    return currentNode;
}

// Helper function to create a table for displaying a dictionary in table form. 
// Returns a table element node.
function createDictionaryTable(inputDict) {
  
    var table = document.createElement("table");
    var keyRow = document.createElement("tr");
    var valueRow = document.createElement("tr");
    
    var cell = document.createElement('td');
    cell.appendChild(document.createTextNode('key'));
    keyRow.appendChild(cell);
    
    cell = document.createElement('td');
    cell.appendChild(document.createTextNode('value'));
    valueRow.appendChild(cell);
    
    // Build a table with a row of the keys followed by a row of the values.
    for( var key in inputDict ) {
      
      // Create table cell element and give it a child text node consisting of the current dictionary key
      cell = document.createElement('td');
      cell.appendChild(document.createTextNode(key));
      // Add the new key cell to the key row
      keyRow.appendChild(cell);
      
      // Create table cell element and give it a child text node consisting of the current dictionary value
      cell = document.createElement('td');
      cell.appendChild(document.createTextNode(inputDict[key]));
      // Add the new value cell to the value row
      valueRow.appendChild(cell);
    } 
    
    // Add the two rows to the table
    table.appendChild(keyRow);
    table.appendChild(valueRow);
    
    // Return the table node that we built.
    return table;     
}

// Helper function to create a table for displaying a list in table form (like the dictionary table but show indices
// instead of keys.) Returns a table element node.
function createListTable(inputList) {

    var table = document.createElement("table");
    var indexRow = document.createElement("tr");
    var valueRow = document.createElement("tr");
    
    var cell = document.createElement('td');
    cell.appendChild(document.createTextNode('index'));
    indexRow.appendChild(cell);
    
    cell = document.createElement('td');
    cell.appendChild(document.createTextNode('value'));
    valueRow.appendChild(cell);
    
    // Build a table with a row of the keys followed by a row of the values.
    for( var index = 0; index < inputList.length; index += 1) {
      // Create table cell element and give it a child text node consisting of the current list index
      cell = document.createElement('td');
      cell.appendChild(document.createTextNode(index));
      // Add the new index cell to the index row
      indexRow.appendChild(cell);
      
      // Create table cell element and give it a child text node consisting of the current list item
      cell = document.createElement('td');
      cell.appendChild(document.createTextNode(inputList[index]));
      // Add the new value cell to the value row
      valueRow.appendChild(cell);
    } 
    
    // Add the two rows to the table
    table.appendChild(valueRow);
    table.appendChild(indexRow);
    
    // Return the table node that we built.
    return table;    
}