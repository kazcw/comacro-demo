import * as comacro from "rust-comacro";

let args = document.getElementById("args");
let body = document.getElementById("body");
let errs = document.getElementById("errs");
let trees = document.getElementById("trees");
let ser = document.getElementById("ser");

function setError(e) {
    if (e === null) {
        errs.style.display = "none";
    } else {
        errs.innerText = "oops: " + e;
        errs.style.display = "block";
    }
}

function updatePattern() {
    console.timeStamp("start updatePattern");
    var patdef;
    try {
        // get pattern token stream
        patdef = new comacro.PatternDef(args.innerText, body.innerText);
    } catch (e) {
        setError(e);
        return;
    }
    setError(null);
    //updatePatTs(patdef.to_string()); // output token stream
    console.timeStamp("about to parse");
    var pat;
    try {
        // parse pattern
        pat = patdef.parse();
    } catch (e) {
        setError(e);
        return;
    }
    console.timeStamp("parsed");
    setError(null);
    /*
    var ir;
    try {
        // compile pattern
        ir = pat.compile();
    } catch (e) {
        setError(e);
        return;
    }
    setError(null);
    */
    console.timeStamp("about to JSON.parse the tree_repr");
    let asts = JSON.parse(pat.tree_repr());
    console.timeStamp("did JSON.parse the tree_repr");
    trees.innerHTML = "";
    // unified tree
    asts.unshift("StmtSeq");
    console.timeStamp("before makeTree");
    makeTree(asts, trees); // output parse tree
    console.timeStamp("after makeTree");

    ser.innerText = pat.flat_repr(); // output serialized form
}

function updatePatTs(ts) {
    patts.innerHTML = "";
    let stmts = ts.split(";");
    let re = /[$] ([*@]) /g;
    for (var i = 0, len = stmts.length-1; i < len; i++) {
        let x = patts.insertCell(-1);
        x.innerText = stmts[i].replace(re, "$$$1");
        x.classList.add("code");
        x.classList.add("nobr");
        x.classList.add("bordered");
    }
}

class Node {
    constructor(root, children) {
        this.root = root;
        this.children = children;
    }
}

// recursive tranformation: [root, child, ..] => { root: root, children: [..] }
function unpackTree(node) {
    if (!Array.isArray(node)) {
        return new Node(node, []);
    }
    let root = node.shift();
    let children = node;
    for (var i = 0, len = children.length; i < len; i++) {
        children[i] = unpackTree(children[i]);
    }
    return new Node(root, children);
}

// find height of tallest branch
function measureTree(node) {
    let max = 1;
    let children = node.children;
    for (var i = 0, len = children.length; i < len; i++) {
        let n = measureTree(children[i]) + 1;
        if (n > max) { max = n; }
    }
    return max;
}

// - insert empty nodes as necessary to ensure each node has at least 1 child
//   down to bottom
// - mark each node with its weight
function bonzaiTree(node, height) {
    if (height == 0) { return 1; }
    let children = node.children;
    if (children.length == 0) {
        children.push(new Node(null, []));
    }
    let weight = 0;
    for (var i = 0, len = children.length; i < len; i++) {
        weight += bonzaiTree(children[i], height - 1);
    }
    node.weight = weight;
    return weight;
}

function renderTree(info, node, r) {
    let row = info.table.rows[r];
    // XXX: if we don't add children to the last row in bonzai
    if (!row) {
        return;
    }
    let cell = row.insertCell(-1);
    cell.colSpan = node.weight;
    let children = node.children;
    cell.classList.add("treecell");
    if (node.root) {
        cell.innerText = node.root;
        cell.classList.add("left");
        cell.classList.add("right");
        if (r == 0) {
            cell.classList.add("top");
        }
        if (r == info.height - 1 || children.length == 1 && children[0].root === null) {
            cell.classList.add("bottom");
        }
    }
    for (var i = 0, len = children.length; i < len; i++) {
        renderTree(info, children[i], r + 1);
    }
}

function makeTree(ast, node) {
    let root = unpackTree(ast);
    let height = measureTree(root);
    bonzaiTree(root, height);

    let table = document.createElement("TABLE");
    table.classList.add("tree");
    for (var i = 0; i < height; i++) {
        table.insertRow(-1);
    }
    node.appendChild(table);
    let info = {
        table: table,
        height: height,
        width: node.weight,
    };
    renderTree(info, root, 0);
}

args.oninput = updatePattern;
body.oninput = updatePattern;
updatePattern();
