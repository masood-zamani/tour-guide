import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import  terser from "@rollup/plugin-terser"
import postcss from 'rollup-plugin-postcss';
import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import typescript from 'rollup-plugin-typescript2';


export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.esm.js',
      format: 'esm',   // ES Module format
      sourcemap: true  // Enable source maps
    }
  ],
  plugins: [
    resolve(),      // Allows node_modules resolution
    commonjs(),     // Converts CommonJS modules to ES6
    postcss({
      extract: true,  // Extract CSS into a separate file
      minimize: true, // Minify CSS
      sourceMap: true // Generate CSS source map
    }),
    babel({ babelHelpers: 'bundled' }), // Transpile ES6/ES7 to ES5
    terser() ,       // Minify the bundle
    typescript(),    // Compile TypeScript files
    // copy({
    //   targets:[
    //     { src: 'src/expression-editor.d.ts', dest: 'dist' }
    //   ]
    // })
  ]
};
