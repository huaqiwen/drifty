<div style="text-align: center;">

  <h1><code>wasm-drifty</code></h1>
  <p>
    <a href="https://travis-ci.org/rustwasm/wasm-pack-template"><img src="https://img.shields.io/travis/rustwasm/wasm-pack-template.svg?style=flat-square" alt="Build Status" /></a>
  </p>
 </div>

## About

This is a multiplayer drift game which uses the Rust language as the backend and Javascript with the Babylon.js engine as the frontend. 

[tutorials]: https://rustwasm.github.io/docs/wasm-pack/tutorials/index.html
[template-docs]: https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/index.html

## 🚴 Usage

### 🛠️ Build with `wasm-pack build`

```
wasm-pack build
```

### 🏃 Run in LocalHost with `tsc` and `npm run start` in `\www` directory
Change directory to `/www`
```
cd www
```
Build `.ts` to `.js` with `tsc`
```
tsc
```
Run in LocalHost with `npm run start`
```
npm run start
```
