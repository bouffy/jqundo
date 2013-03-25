/*
do/undo jquery methods v0.0.0.0.0.0.1 beta

Pass in a function which does some reversible jQuery stuff 
(very, very limited support right now).  e.g.,

Transaction.do(function() {
 $('#mydiv').slideUp();
});

If there is an equivalent reversible method, calling undo will perform
the opposite of the last function passed to Transaction.do. e.g.,

Transaction.undo();

NOTE: Do not use in production.  I mean it.  Just a PoC.  Not good yet.  Chill.

@last_updated 3.24.2013 
@author Michael Boufford
*/
var Transaction = Transaction || {};

// Contains the last transaciton if one exists
Transaction.last = null;

Transaction.methods = (function() {
    var methods = {},
        mapping = [ 
            [ 'show', 'hide' ],
            [ 'slideUp', 'slideDown' ],
            [ 'fadeIn', 'fadeOut']
        ];
    
    // Builds mappings that go both ways 
    // i.e., show/hide, hide/show
    for(var i = 0; i < mappings.length; i++) {
      methods[mapping[i][0]] = mapping[i][1];
      methods[mapping[i][1]] = mapping[i][0];
    }
    
    return methods;
}());

Transaction.undo = (function() {
  var m = Transaction.methods,
      tmp;
    
  function invert(body) {
    // First replace elements with tokenized equivalents
    for(k in m) {
      if(m.hasOwnProperty(k)) {
        tmp = new RegExp('[^\{]' + m[k] + '(?=[^\}])');
        body = body.replace(tmp, '{{' + m[k] + '}}');
      }
    }

    // Then replace the tokens with their reversible equivalents
    for(k in m) {
      if(m.hasOwnProperty(k)) {
        // Since RegExp in JS doesn't include lookbehinds
        // the . operator was included in the repalce match, 
        // so it must be replaced when the token is replaced
        body = body.replace('{{' + m[k] + '}}', '.' + k);
      }
    }
    
    return body;
  }

  return function() {
    var tx, body;

    if(!Transaction.last) throw new Error('No last transaction to undo');

    tx = Transaction.last;
    body = tx.args.pop();

    tx.args.push(invert(body));
    return (Function.apply(this, tx.args)).apply(this, tx.vals);
  }
}());

Transaction.do = (function() {
  var paramsRegex = /function\W?(\(\)|\((.*)\))/;

  function funcBody(f) {
    if(f) {
      // Extract function body in the laziest way imaginable
      return f.substring(f.indexOf('{') + 1, f.lastIndexOf('}'));
    }

    throw new Error('No function provided');
  }

  function getArgs(f) {
    var argStr;
      
    if(f) {
      argStr = paramsRegex.exec(f);
      return (argStr[2]) ? argStr[2].split(/\,\W?/g) : []; 
    }

    throw new Error('No function provided');
  }

  return function() {
    var args, vals, f;

    if(arguments.length === 0) return undefined;

    vals = Array.prototype.slice.call(arguments);
    f = vals.shift();
    args = getArgs(f.toString());
    args.push(funcBody(f.toString()));
      
    // TODO: probably should hang onto this?
    Transaction.last = { args: args, vals: vals };
      
    return (Function.apply(this, args)).apply(this, vals);
  };
}());