extern crate cfg_if;
extern crate wasm_bindgen;

mod utils;

use comacro::proc_macro2::TokenStream;
use std::str::FromStr;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct PatternDef(comacro::PatternDef);

#[wasm_bindgen]
impl PatternDef {
    #[wasm_bindgen(constructor)]
    pub fn new(args: &str, body: &str) -> Result<PatternDef, JsValue> {
        let args = TokenStream::from_str(args).map_err(|_| "invalid token in args".to_owned())?;
        let body = TokenStream::from_str(body).map_err(|_| "invalid token in body".to_owned())?;
        Ok(PatternDef(comacro::PatternDef::lex(args, body)))
    }

    pub fn to_string(&self) -> String {
        self.0.to_string()
    }

    pub fn parse(self) -> Result<Pattern, JsValue> {
        Ok(Pattern(self.0.parse().map_err(|_| "failed to parse".to_owned())?))
        //Ok(Pattern(self.0.parse().map_err(|e| e.to_string())?))
    }
}

#[wasm_bindgen]
pub struct Input(comacro::Input);

#[wasm_bindgen]
impl Input {
    #[wasm_bindgen(constructor)]
    pub fn new(stmts: &str) -> Result<Input, JsValue> {
        let stmts = TokenStream::from_str(stmts).map_err(|_| "invalid token in input".to_owned())?;
        Ok(Input(comacro::Input::parse(stmts).map_err(|_| "failed to parse input".to_owned())?))
    }

    pub fn tree_repr(&self) -> String {
        self.0.debug_tree_repr()
    }
}

#[wasm_bindgen]
pub struct Pattern(comacro::Pattern);

#[wasm_bindgen]
impl Pattern {
    pub fn tree_repr(&self) -> String {
        self.0.debug_tree_repr()
    }

    pub fn flat_repr(&self) -> String {
        self.0.debug_flat_repr()
    }

    pub fn fragment(&self) -> String {
        self.0.fragment()
    }

    pub fn compile(&self) -> Ir {
        Ir(self.0.compile())
    }
}

#[wasm_bindgen]
pub struct Ir(comacro::Ir);

#[wasm_bindgen]
impl Ir {
    pub fn get_match(&self, input: &Input) -> String {
        if let Some(m) = self.0.matches(&input.0.stmts, &input.0.compile()).next() {
            format!("[{},{}]", m.context, m.bindings)
        } else {
            String::new()
        }
    }
}
