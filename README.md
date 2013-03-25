jqundo
======

Undo for jQuery v0.0.1

Pass in a function which does some reversible jQuery stuff 
(very, very limited support right now).  e.g.,

*Transaction.do(function() { $('#mydiv').slideUp(); });*

If there is an equivalent reversible method, calling undo will perform
the opposite of the last function passed to Transaction.do. e.g.,

*Transaction.undo();*

NOTE: Do not use in production.  I mean it.  Just a PoC.  Not good yet.  Chill.
