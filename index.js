'use strict';

import * as comacro from "rust-comacro";

const args = document.getElementById("args");
const body = document.getElementById("body");
const patErrs = document.getElementById("pat_errs");
const trees = document.getElementById("trees");
const ser = document.getElementById("ser");
const input = document.getElementById("inpt");
const inErrs = document.getElementById("in_errs");

const matches = document.getElementById("matches");

const EXAMPLES = {
    "manual_swap": { args: "$t:ident, $x:expr, $y:expr", body: "let $t = $x;\n$x = $y;\n$y = $t;" },
    "map_flatten": { args: "$x:expr, $y:expr", body: "$x.map($y).flatten()" },
    "replace_none": { args: "$x:expr", body: "mem::replace($x, None)" },
    "useless_collect": { args: "$x:expr", body: "$x.collect().len()" },
};

function example() {
    const ex = EXAMPLES[this.id];
    args.innerText = ex.args;
    body.innerText = ex.body;
    updatePattern();
    return false;
}

var pat;
var ir;

function setError(errs, e) {
    if (e === null) {
        errs.style.display = "none";
    } else {
        errs.innerText = "error: " + e;
        errs.style.display = "block";
    }
}

function flat_repr_inner(ast, bindings, inner) {
    if (!Array.isArray(ast)) {
        if (inner !== undefined && ast === "$1") {
            return '<span class="match">' + flat_repr_inner(inner, bindings) + '</span>';
        }
        if (bindings !== undefined && ast[0] === "$") {
            return flat_repr_inner(bindings[ast[1]-1]) + "<sup>" + ast[1] + "</sup>";
        }
        return ast;
    }
    let children = [ast[0] + "{"];
    for (var i=1, len=ast.length; i<len; i++)
        children.push(flat_repr_inner(ast[i], bindings, inner));
    children.push("}");
    return children.join(" ");
}

function flat_repr(ast, inner, bindings) {
    if (inner !== undefined && ast === "$1") {
        let flat = [];
        for (var i=0; i<inner.length; i++)
            flat.push(flat_repr_inner(inner[i], bindings));
        return '<span class="block match">' + flat.join("<br>") + '</span>';
    } else
        return flat_repr_inner(ast, bindings, inner);
}

function flat_reprs(asts, inner, bindings) {
    let flat = [];
    for (var i=0; i<asts.length; i++)
        flat.push(flat_repr(asts[i], inner, bindings));
    return flat.join("<br>");
}

function updatePattern() {
    var patdef;
    try {
        // get pattern token stream
        patdef = new comacro.PatternDef(args.innerText, body.innerText);
    } catch (e) {
        setError(patErrs, e);
        ir = null;
        return;
    }
    setError(patErrs, null);
    try {
        // parse pattern
        pat = patdef.parse();
    } catch (e) {
        setError(patErrs, e);
        ir = null;
        return;
    }
    setError(patErrs, null);
    let asts = JSON.parse(pat.tree_repr());
    if (asts.length === 1) {
        asts = asts[0];
    } else {
        asts.unshift("StmtSeq");
    }
    const parseTree = makeTree(asts);
    trees.innerHTML = "";
    trees.appendChild(parseTree); // output parse tree
    ser.innerText = pat.flat_repr(); // output serialized form
    try {
        // compile pattern
        ir = pat.compile();
    } catch (e) {
        setError(patErrs, e);
        ir = null;
        return;
    }
    setError(patErrs, null);
    updateInput(); // matches may have changed
}

function setInputUnmatched(inp) {
    let asts = JSON.parse(inp.tree_repr());
    matches.innerHTML = flat_reprs(asts); // output serialized form
}

function updateInput() {
    var inp;
    try {
        inp = new comacro.Input(input.innerText);
    } catch (e) {
        setError(inErrs, e);
        return;
    }
    setError(inErrs, null);

    if (ir === null) {
        setInputUnmatched(inp);
        return;
    }

    var match;
    try {
        match = ir.get_match(inp);
    } catch (e) {
        setError(inErrs, e);
        setInputUnmatched(inp);
        return;
    }
    setError(inErrs, null);

    if (match === "") {
        setInputUnmatched(inp);
        return;
    }

    match = JSON.parse(match);
    let context = match[0];
    let bindings = match[1];
    let pat_ast = JSON.parse(pat.tree_repr());
    if (pat.fragment() !== "StmtSeq") {
        pat_ast = pat_ast[0];
    }
    matches.innerHTML = flat_reprs(context, pat_ast, bindings);
}

function newCell(row, weight) {
    const cell = row.insertCell(-1);
    cell.colSpan = weight;
    cell.style.width = weight * 4 + "em";
    cell.classList.add("treecell");
    return cell;
}

function createCell(info, value, weight, r) {
    // on reaching a new row, make TRs and pad for columns that have been empty
    // in this row so far
    const lastRow = info.table.rows.length - 1;
    for (var i = lastRow; i < r; i++) {
        info.table.insertRow(-1);
    }
    if (r > lastRow && info.width) {
        newCell(info.table.rows[lastRow+1], info.width).rowSpan = r - lastRow;
    }

    const cell = newCell(info.table.rows[r], weight || 1);
    cell.innerText = value;
    cell.classList.add("occupied");

    if (!weight) {
        cell.classList.add("leaf");
        // empty column down to bottom
        info.width += 1;
        let below = info.table.rows.length - 1 - r;
        if (below > 0) {
            newCell(info.table.rows[r + 1], 1).rowSpan = below;
        }
    }
}

function renderTree(info, node, r) {
    const children = Array.isArray(node) ? (node.length - 1) : 0;
    const value = Array.isArray(node) ? node[0] : node;
    let weight = 0;
    for (var i = 0; i < children; i++) {
        weight += renderTree(info, node[1 + i], r + 1);
    }
    createCell(info, value, weight, r);
    return weight || 1;
}

function makeTree(ast) {
    const table = document.createElement("TABLE");
    table.classList.add("tree");
    renderTree({ table: table, width: 0 }, ast, 0);
    return table;
}

updatePattern();

args.oninput = updatePattern;
body.oninput = updatePattern;
input.oninput = updateInput;

for (var x in EXAMPLES) {
    if (!EXAMPLES.hasOwnProperty(x))
        continue;
    const ex = document.getElementById(x);
    ex.href = "#";
    ex.onclick = example;
    ex.keydown = example;
}

