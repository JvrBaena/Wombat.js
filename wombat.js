var w = w || {};


/*
Bind implementation for browsers where it is not supported.

We add bind to Function.prototype. When passed a context, it returns the function binded to that context
var luis = {name: "luis"};
var name = "paco";
function hey(){
  console.log(this.name);
};

hey() --> "paco"

var heyLu = hey.bind(luis);
heyLu() --> "luis"

*/
if(!Function.prototype.bind){
  Function.prototype.bind = function(context){
    if(typeof this !== "function"){throw new TypeError("bind(): 'This' is not bindable");}
    var that = this;
    return function(){
      return that.apply(context, arguments);
    }
  }
}

// if(!NodeList.prototype.forEach){
//   NodeList.prototype.forEach = function(fun) {
//     if (typeof fun !== "function") throw new TypeError();
//     for (var i = 0; i < this.length; i++) {
//       fun.call(this, this[i]);
//     }
//   };
// }
// 
// if(!NodeList.prototype.toArray){
//   NodeList.prototype.toArray = function(){
//    return Array.prototype.slice.call(this);
//   }; 
// }

/*
When invoked with a property name, this function returns another function that receives an object
and returns the property of that object. This allows us to make map(prop("name"))
*/
if(typeof prop !== "function"){
  var prop = function(attr){
    if(typeof attr !== "string"){ throw new TypeError("prop(): Argument not a String");}
    return function(obj){
      return obj[attr];
    }
  }
}

w = function(WOMBAT){ 
  /* Defines one function per HTML tag to create markup  http://www.w3schools.com/html5/html5_reference.asp*/
  var _markup = ["a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button", "canvas",
                "caption", "cite", "code", "col", "colgroup", "command", "datalist", "dd", "del", "details", "dfn", "div", "dl", "dt", "em", "footer",
                "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "keygen",
                "kbd", "label", "legend", "li", "link", "map", "mark", "menu", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option",
                "output", "p", "param", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span",
                "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track",
                "u", "ul", "var", "video", "wbr"];
  
  var _wombat = function(element){
    this.e = element;
    
    this.$ = (function(aQuery){
      return new _wombat(this.querySelector(aQuery));
    }).bind(this.e);
    
    this.$$ = (function(aQuery){
      var _els = this.querySelectorAll(aQuery);
      var _ret = [];
      for(var i = 0; i < _els.length; i++){
        _ret.push(new _wombat(_els[i]));
      }
      return _ret;
    }).bind(this.e);
    
    this.addEventHandler = function(type, handler){
      if(this.e.addEventListener){
        this.e.addEventListener(type, handler, false);
      }else if(element.attachEvent){
        this.e.attachEvent("on" + type, handler);
      }else{
        this.e["on" + type] = handler;
      };
      
    };
    
    this.withCSS = function(css){
      /* Nicholas Zakas' Professional Javascript for Web Developers p. 390*/
      var supportsDOM2CSS2 = document.implementation.hasFeature("CSS2", "2.0");
      if(typeof css === "string"){
        if(supportsDOM2CSS2){
          this.e.style.cssText = css; 
        }else{
          var props = css.split(";");
          for(var i = 0; i < props.length ; i++){
            if(props[i] === "float"){
              this.e.style["cssFloat"] !== undefined ? this.e.style["cssFloat"] = props[i] : this.e.style["styleFloat"] = props[i];
            }
          }
        }
      }else if(typeof css === "object"){
        for(var prop in css){
          if(css.hasOwnProperty(prop)){
            if(prop === "float"){
              this.e.style["cssFloat"] !== undefined ? this.e.style["cssFloat"] = css[prop] : this.e.style["styleFloat"] = css[prop];
            }else{
              this.e.style[prop] = css[prop];                
            }
          }
        }
      }
      return this;
    }
    
    this.withId = function(id){
      if(typeof id === "string"){
        this.e.setAttribute("id", id);
      }else{ throw new TypeError("withId(): Argument not a String");}
      return this;
    }
    
    this.withClass = function(css){
      if(typeof css === "string"){
        this.e.setAttribute("class", css);
      }else{ throw new TypeError("withClass(): Argument not a String");}
      return this;
    }    
  };
   
  var lib = {};
  /* QuerySelector (Devuelve el primero)*/
  var $ = (function(aQuery){
    if(typeof aQuery === "string"){
      return new _wombat(this.querySelector(aQuery));      
    }else if(_isElement(aQuery)){
      return new _wombat(aQuery);      
    }
  }).bind(document);

  lib["$"]= $;
  /* QuerySelectorAll (Devuelve todos)*/
  var $$ = (function(aQuery){
    var _els = this.querySelectorAll(aQuery);
    var _ret = [];
    for(var i = 0; i < _els.length; i++){
      _ret.push(new _wombat(_els[i]));
    }
    return _ret;
  }).bind(document);

  lib["$$"]= $$;
  
  
  /* http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object */
  //Returns true if it is a DOM node
  function _isNode(o){
    return (
      typeof Node === "object" ? o instanceof Node : 
      o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
    );
  }

  //Returns true if it is a DOM element    
  function _isElement(o){
    return (
      typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
      o && typeof o === "object" && o.nodeType === 1 && typeof o.nodeName==="string"
  );
  }  
  
  /*Receives a string argument representing the type of DOM element to create and a variable number of extra parameters that works like this:
    
    If first extra argument is a string --> Assign it as the textContent of the Element
    If we receive a list of HTMLElements --> Append them as children of the Element
    
  */
  var _el = function(elem, attrs){
    if(typeof elem !== "string" || _markup.indexOf(elem) === -1){ throw new TypeError("_el(): First argument should be a string representing an html element");}
    try{
      var args = Array.prototype.slice.call(arguments);
      var el = document.createElement(elem);
      if(typeof attrs === "string"){
        el.textContent = attrs;
      }else if(arguments.length > 2){
        for(var obj in args){
          if(_isElement(args[obj])){ //Non HTMLElements are ignored
            el.appendChild(args[obj]);
          }else if(!_isElement(args[obj]) && args[obj].e){
            el.appendChild(args[obj].e);
          }
        }
      }else if(arguments.length === 2 && typeof attrs === "object" && _isElement(attrs)){ //In case only ONE HTMLElement is provided
        el.appendChild(attrs);
      }
      return new _wombat(el);
    }catch(err){
      throw err;
    }
  }
  
  /* Currying of _el with each one of the markup elements so that we have a function for each one 
    This allows us to write markup-like js code:

    w.div(
      w.h1("HOLA").withClass("title"),
      w.div(
        w.p("Texto").withCSS("float:left;"),
        w.ul(
          w.li("1"),
          w.li("2")
        ).withId("listing")
      )
    )

    Creates a _wombat object whose e attribute contains:

    "<h1 class="title">HOLA</h1><div><p style="float: left; ">Texto</p><ul id="listing"><li>1</li><li>2</li></ul></div>"
  */
  _markup.forEach(function(e){
    lib[e] = function(){
      return function(){
        /*http://debuggable.com/posts/turning-javascript-s-arguments-object-into-an-array:4ac50ef8-3bd0-4a2d-8c2e-535ccbdd56cb*/
        var args = Array.prototype.slice.call(arguments);
        args.unshift(e);
        return _el.apply(this, args);
      };
    }();
  });

  
  return lib;
}(w);