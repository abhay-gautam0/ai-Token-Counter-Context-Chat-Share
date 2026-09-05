import { Tiktoken } from "js-tiktoken/lite";
import o200k_base from "js-tiktoken/ranks/o200k_base";

const encoder = new Tiktoken(o200k_base);

globalThis.AITokenizer = {
    count(text) {
        return encoder.encode(text).length;
    }
};

console.log("AI Token Tally: real tokenizer loaded");