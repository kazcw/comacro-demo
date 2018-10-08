#!/bin/sh

# fill in outputs of examples for no-JS fallback
# TODO: do this with an npm templating plugin
# TODO: get outputs by running the script headlessly

I_CODE='<div class="code" style="border: 2px solid black; padding: 8px;">macro pattern1(<div id="args" class="code editable" style="display: inline-block;" contenteditable="true">$t:ident, $x:expr, $y:expr</div>) {<pre id="body" class="editable" contenteditable="true" style="margin-left: 2em; padding: 4px; margin-top: 2px;">let $t = $x;<br>$x = $y;<br>$y = $t;</pre>}</div>'
I_TREES='<div id="trees"><table class="tree"><tbody><tr><td colspan="6" style="width: 24em;" class="treecell occupied">StmtSeq</td></tr><tr><td colspan="2" style="width: 8em;" class="treecell occupied">Local</td><td colspan="2" style="width: 8em;" class="treecell occupied">Semi</td><td colspan="2" style="width: 8em;" class="treecell occupied">Semi</td></tr><tr><td colspan="1" style="width: 4em;" class="treecell occupied">Ident</td><td colspan="1" style="width: 4em;" class="treecell occupied leaf">$2</td><td colspan="2" style="width: 8em;" class="treecell occupied">Assign</td><td colspan="2" style="width: 8em;" class="treecell occupied">Assign</td></tr><tr><td colspan="1" style="width: 4em;" class="treecell occupied leaf">$1</td><td colspan="1" style="width: 4em;" class="treecell" rowspan="1"></td><td colspan="1" style="width: 4em;" class="treecell occupied leaf">$2</td><td colspan="1" style="width: 4em;" class="treecell occupied leaf">$3</td><td colspan="1" style="width: 4em;" class="treecell occupied leaf">$3</td><td colspan="1" style="width: 4em;" class="treecell occupied">Path</td></tr><tr><td colspan="5" style="width: 20em;" class="treecell" rowspan="1"></td><td colspan="1" style="width: 4em;" class="treecell occupied leaf">$1</td></tr></tbody></table></div>'
I_SER='<pre class="code" id="ser">Local{ Ident{ $1 } $2 }<br>Semi{ Assign{ $2 $3 } }<br>Semi{ Assign{ $3 Path{ $1 } } }</pre>'
I_MATCHES='<pre id="matches" class="code">Local{ Ident{ foo } Call{ Path{ Some } Lit{ 23 } } }<br>Local{ Ident{ bar } Call{ Path{ mem replace } Reference{ Path{ foo } } Path{ None } } }<br><span class="block match">Local{ Ident{ Ident{ temp }<sup>1</sup> } Expr{ Path{ foo } }<sup>2</sup> }<br>Semi{ Assign{ Expr{ Path{ foo } }<sup>2</sup> Expr{ Path{ bar } }<sup>3</sup> } }<br>Semi{ Assign{ Expr{ Path{ bar } }<sup>3</sup> Path{ Ident{ temp }<sup>1</sup> } } }</span><br>Local{ Ident{ nothing } Binary{ Binary{ Path{ Vec } Path{ Option } } Call{ Path{ new } } } }<br>Local{ Ident{ nothing } MethodCall{ MethodCall{ Path{ nothing } map Closure{ Ident{ x } Path{ x } } } flatten } }<br>Local{ Ident{ zero } MethodCall{ MethodCall{ Path{ nothing } collect } len } }</pre>'

M_CODE='<div class="code" style="border: 2px solid black; padding: 8px;">macro pattern1(<div id="args" class="code editable" style="display: inline-block;" contenteditable="true">$x:expr, $y:expr</div>) {<pre id="body" class="editable" style="margin-left: 2em; padding: 4px; margin-top: 2px;" contenteditable="true">$x.map($y).flatten()</pre>}</div>'
M_TREES='<div id="trees"><table class="tree"><tbody><tr><td colspan="4" style="width: 16em;" class="treecell occupied">MethodCall</td></tr><tr><td colspan="3" style="width: 12em;" class="treecell occupied">MethodCall</td><td colspan="1" style="width: 4em;" class="treecell occupied leaf">flatten</td></tr><tr><td colspan="1" style="width: 4em;" class="treecell occupied leaf">$1</td><td colspan="1" style="width: 4em;" class="treecell occupied leaf">map</td><td colspan="1" style="width: 4em;" class="treecell occupied leaf">$2</td><td colspan="1" style="width: 4em;" class="treecell" rowspan="1"></td></tr></tbody></table></div>'
M_SER='<pre class="code" id="ser">MethodCall{ MethodCall{ $1 map $2 } flatten }</pre>'
M_MATCHES='<pre id="matches" class="code">Local{ Ident{ foo } Call{ Path{ Some } Lit{ 23 } } }<br>Local{ Ident{ bar } Call{ Path{ mem replace } Reference{ Path{ foo } } Path{ None } } }<br>Local{ Ident{ temp } Path{ foo } }<br>Semi{ Assign{ Path{ foo } Path{ bar } } }<br>Semi{ Assign{ Path{ bar } Path{ temp } } }<br>Local{ Ident{ nothing } Binary{ Binary{ Path{ Vec } Path{ Option } } Call{ Path{ new } } } }<br>Local{ Ident{ nothing } <span class="match">MethodCall{ MethodCall{ Expr{ Path{ nothing } }<sup>1</sup> map Expr{ Closure{ Ident{ x } Path{ x } } }<sup>2</sup> } flatten }</span> }<br>Local{ Ident{ zero } MethodCall{ MethodCall{ Path{ nothing } collect } len } }</pre>'

U_CODE='<div class="code" style="border: 2px solid black; padding: 8px;">macro pattern1(<div id="args" class="code editable" style="display: inline-block;" contenteditable="true">$x:expr</div>) {<pre id="body" class="editable" style="margin-left: 2em; padding: 4px; margin-top: 2px;" contenteditable="true">$x.collect().len()</pre>}</div>'
U_TREES='<div id="trees"><table class="tree"><tbody><tr><td colspan="3" style="width: 12em;" class="treecell occupied">MethodCall</td></tr><tr><td colspan="2" style="width: 8em;" class="treecell occupied">MethodCall</td><td colspan="1" style="width: 4em;" class="treecell occupied leaf">len</td></tr><tr><td colspan="1" style="width: 4em;" class="treecell occupied leaf">$1</td><td colspan="1" style="width: 4em;" class="treecell occupied leaf">collect</td><td colspan="1" style="width: 4em;" class="treecell" rowspan="1"></td></tr></tbody></table></div>'
U_SER='<pre class="code" id="ser">MethodCall{ MethodCall{ $1 collect } len }</pre>'
U_MATCHES='<pre id="matches" class="code">Local{ Ident{ foo } Call{ Path{ Some } Lit{ 23 } } }<br>Local{ Ident{ bar } Call{ Path{ mem replace } Reference{ Path{ foo } } Path{ None } } }<br>Local{ Ident{ temp } Path{ foo } }<br>Semi{ Assign{ Path{ foo } Path{ bar } } }<br>Semi{ Assign{ Path{ bar } Path{ temp } } }<br>Local{ Ident{ nothing } Binary{ Binary{ Path{ Vec } Path{ Option } } Call{ Path{ new } } } }<br>Local{ Ident{ nothing } MethodCall{ MethodCall{ Path{ nothing } map Closure{ Ident{ x } Path{ x } } } flatten } }<br>Local{ Ident{ zero } <span class="match">MethodCall{ MethodCall{ Expr{ Path{ nothing } }<sup>1</sup> collect } len }</span> }</pre>'

R_CODE='<div class="code" style="border: 2px solid black; padding: 8px;">macro pattern1(<div id="args" class="code editable" style="display: inline-block;" contenteditable="true">$x:expr</div>) {<pre id="body" class="editable" style="margin-left: 2em; padding: 4px; margin-top: 2px;" contenteditable="true">mem::replace($x, None)</pre>}</div>'
R_TREES='<div id="trees"><table class="tree"><tbody><tr><td colspan="4" style="width: 16em;" class="treecell occupied">Call</td></tr><tr><td colspan="2" style="width: 8em;" class="treecell occupied">Path</td><td colspan="1" style="width: 4em;" class="treecell occupied leaf">$1</td><td colspan="1" style="width: 4em;" class="treecell occupied">Path</td></tr><tr><td colspan="1" style="width: 4em;" class="treecell occupied leaf">mem</td><td colspan="1" style="width: 4em;" class="treecell occupied leaf">replace</td><td colspan="1" style="width: 4em;" class="treecell" rowspan="1"></td><td colspan="1" style="width: 4em;" class="treecell occupied leaf">None</td></tr></tbody></table></div>'
R_SER='<pre class="code" id="ser">Call{ Path{ mem replace } $1 Path{ None } }</pre>'
R_MATCHES='<pre id="matches" class="code">Local{ Ident{ foo } Call{ Path{ Some } Lit{ 23 } } }<br>Local{ Ident{ bar } <span class="match">Call{ Path{ mem replace } Expr{ Reference{ Path{ foo } } }<sup>1</sup> Path{ None } }</span> }<br>Local{ Ident{ temp } Path{ foo } }<br>Semi{ Assign{ Path{ foo } Path{ bar } } }<br>Semi{ Assign{ Path{ bar } Path{ temp } } }<br>Local{ Ident{ nothing } Binary{ Binary{ Path{ Vec } Path{ Option } } Call{ Path{ new } } } }<br>Local{ Ident{ nothing } MethodCall{ MethodCall{ Path{ nothing } map Closure{ Ident{ x } Path{ x } } } flatten } }<br>Local{ Ident{ zero } MethodCall{ MethodCall{ Path{ nothing } collect } len } }</pre>'

sed -e "s|<!--CODE-->|$I_CODE|" -e "s|<!--TREES-->|$I_TREES|" -e "s|<!--SER-->|$I_SER|" -e "s|<!--MATCHES-->|$I_MATCHES|" template.html > index.html
sed -e "s|<!--CODE-->|$M_CODE|" -e "s|<!--TREES-->|$M_TREES|" -e "s|<!--SER-->|$M_SER|" -e "s|<!--MATCHES-->|$M_MATCHES|" template.html > map_flatten.html
sed -e "s|<!--CODE-->|$U_CODE|" -e "s|<!--TREES-->|$U_TREES|" -e "s|<!--SER-->|$U_SER|" -e "s|<!--MATCHES-->|$U_MATCHES|" template.html > useless_collect.html
sed -e "s|<!--CODE-->|$R_CODE|" -e "s|<!--TREES-->|$R_TREES|" -e "s|<!--SER-->|$R_SER|" -e "s|<!--MATCHES-->|$R_MATCHES|" template.html > replace_none.html