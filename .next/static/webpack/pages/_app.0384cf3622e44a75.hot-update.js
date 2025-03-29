/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/_app",{

/***/ "(pages-dir-browser)/./src/contexts/NotificationContext.js":
/*!*********************************************!*\
  !*** ./src/contexts/NotificationContext.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



;
    // Wrapped in an IIFE to avoid polluting the global scope
    ;
    (function () {
        var _a, _b;
        // Legacy CSS implementations will `eval` browser code in a Node.js context
        // to extract CSS. For backwards compatibility, we need to check we're in a
        // browser context before continuing.
        if (typeof self !== 'undefined' &&
            // AMP / No-JS mode does not inject these helpers:
            '$RefreshHelpers$' in self) {
            // @ts-ignore __webpack_module__ is global
            var currentExports = module.exports;
            // @ts-ignore __webpack_module__ is global
            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;
            // This cannot happen in MainTemplate because the exports mismatch between
            // templating and execution.
            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);
            // A module can be accepted automatically based on its exports, e.g. when
            // it is a Refresh Boundary.
            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {
                // Save the previous exports signature on update so we can compare the boundary
                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)
                module.hot.dispose(function (data) {
                    data.prevSignature =
                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);
                });
                // Unconditionally accept an update to this module, we'll check if it's
                // still a Refresh Boundary later.
                // @ts-ignore importMeta is replaced in the loader
                module.hot.accept();
                // This field is set when the previous version of this module was a
                // Refresh Boundary, letting us know we need to check for invalidation or
                // enqueue an update.
                if (prevSignature !== null) {
                    // A boundary can become ineligible if its exports are incompatible
                    // with the previous exports.
                    //
                    // For example, if you add/remove/change exports, we'll want to
                    // re-execute the importing modules, and force those components to
                    // re-render. Similarly, if you convert a class component to a
                    // function, we want to invalidate the boundary.
                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {
                        module.hot.invalidate();
                    }
                    else {
                        self.$RefreshHelpers$.scheduleUpdate();
                    }
                }
            }
            else {
                // Since we just executed the code for the module, it's possible that the
                // new exports made it ineligible for being a boundary.
                // We only care about the case when we were _previously_ a boundary,
                // because we already accepted this update (accidental side effect).
                var isNoLongerABoundary = prevSignature !== null;
                if (isNoLongerABoundary) {
                    module.hot.invalidate();
                }
            }
        }
    })();


/***/ }),

/***/ "(pages-dir-browser)/./src/pages/_app.js":
/*!***************************!*\
  !*** ./src/pages/_app.js ***!
  \***************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(pages-dir-browser)/./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _components_Layout__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/Layout */ \"(pages-dir-browser)/./src/components/Layout.js\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../styles/globals.css */ \"(pages-dir-browser)/./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ \"(pages-dir-browser)/./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _contexts_NotificationContext__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../contexts/NotificationContext */ \"(pages-dir-browser)/./src/contexts/NotificationContext.js\");\n/* harmony import */ var _contexts_NotificationContext__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_contexts_NotificationContext__WEBPACK_IMPORTED_MODULE_4__);\n\nvar _s = $RefreshSig$();\n\n\n\n\nfunction MyApp(param) {\n    let { Component, pageProps } = param;\n    _s();\n    // Start the trading algorithm when the app loads\n    (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)({\n        \"MyApp.useEffect\": ()=>{\n            // Function to start the trading algorithm\n            const startAlgorithm = {\n                \"MyApp.useEffect.startAlgorithm\": async ()=>{\n                    try {\n                        // Make a request to start the algorithm\n                        const response = await fetch('/api/algorithm/start', {\n                            method: 'POST'\n                        });\n                        if (!response.ok) {\n                            console.error('Failed to start algorithm:', await response.text());\n                        } else {\n                            console.log('Trading algorithm started successfully');\n                        }\n                    } catch (error) {\n                        console.error('Error starting algorithm:', error);\n                    }\n                }\n            }[\"MyApp.useEffect.startAlgorithm\"];\n            // Call the function to start the algorithm\n            startAlgorithm();\n        // No cleanup needed as the algorithm should keep running\n        }\n    }[\"MyApp.useEffect\"], []);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_contexts_NotificationContext__WEBPACK_IMPORTED_MODULE_4__.NotificationProvider, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_Layout__WEBPACK_IMPORTED_MODULE_1__[\"default\"], {\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"/Users/emraan.adem/Documents/Projects/Nervala/Nervala.files/src/pages/_app.js\",\n                lineNumber: 36,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"/Users/emraan.adem/Documents/Projects/Nervala/Nervala.files/src/pages/_app.js\",\n            lineNumber: 35,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/emraan.adem/Documents/Projects/Nervala/Nervala.files/src/pages/_app.js\",\n        lineNumber: 34,\n        columnNumber: 5\n    }, this);\n}\n_s(MyApp, \"OD7bBpZva5O2jO+Puf00hKivP7c=\");\n_c = MyApp;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\nvar _c;\n$RefreshReg$(_c, \"MyApp\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1icm93c2VyKS8uL3NyYy9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUEwQztBQUNYO0FBQ0c7QUFDcUM7QUFFdkUsU0FBU0csTUFBTSxLQUF3QjtRQUF4QixFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBRSxHQUF4Qjs7SUFDYixpREFBaUQ7SUFDakRKLGdEQUFTQTsyQkFBQztZQUNSLDBDQUEwQztZQUMxQyxNQUFNSztrREFBaUI7b0JBQ3JCLElBQUk7d0JBQ0Ysd0NBQXdDO3dCQUN4QyxNQUFNQyxXQUFXLE1BQU1DLE1BQU0sd0JBQXdCOzRCQUNuREMsUUFBUTt3QkFDVjt3QkFFQSxJQUFJLENBQUNGLFNBQVNHLEVBQUUsRUFBRTs0QkFDaEJDLFFBQVFDLEtBQUssQ0FBQyw4QkFBOEIsTUFBTUwsU0FBU00sSUFBSTt3QkFDakUsT0FBTzs0QkFDTEYsUUFBUUcsR0FBRyxDQUFDO3dCQUNkO29CQUNGLEVBQUUsT0FBT0YsT0FBTzt3QkFDZEQsUUFBUUMsS0FBSyxDQUFDLDZCQUE2QkE7b0JBQzdDO2dCQUNGOztZQUVBLDJDQUEyQztZQUMzQ047UUFFQSx5REFBeUQ7UUFDM0Q7MEJBQUcsRUFBRTtJQUVMLHFCQUNFLDhEQUFDSiwrRUFBb0JBO2tCQUNuQiw0RUFBQ0YsMERBQU1BO3NCQUNMLDRFQUFDSTtnQkFBVyxHQUFHQyxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7O0FBSWhDO0dBbENTRjtLQUFBQTtBQW9DVCxpRUFBZUEsS0FBS0EsRUFBQyIsInNvdXJjZXMiOlsiL1VzZXJzL2VtcmFhbi5hZGVtL0RvY3VtZW50cy9Qcm9qZWN0cy9OZXJ2YWxhL05lcnZhbGEuZmlsZXMvc3JjL3BhZ2VzL19hcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExheW91dCBmcm9tICcuLi9jb21wb25lbnRzL0xheW91dCc7XG5pbXBvcnQgJy4uL3N0eWxlcy9nbG9iYWxzLmNzcyc7XG5pbXBvcnQgeyB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBOb3RpZmljYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbnRleHRzL05vdGlmaWNhdGlvbkNvbnRleHQnO1xuXG5mdW5jdGlvbiBNeUFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH0pIHtcbiAgLy8gU3RhcnQgdGhlIHRyYWRpbmcgYWxnb3JpdGhtIHdoZW4gdGhlIGFwcCBsb2Fkc1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIEZ1bmN0aW9uIHRvIHN0YXJ0IHRoZSB0cmFkaW5nIGFsZ29yaXRobVxuICAgIGNvbnN0IHN0YXJ0QWxnb3JpdGhtID0gYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gTWFrZSBhIHJlcXVlc3QgdG8gc3RhcnQgdGhlIGFsZ29yaXRobVxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCcvYXBpL2FsZ29yaXRobS9zdGFydCcsIHtcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHN0YXJ0IGFsZ29yaXRobTonLCBhd2FpdCByZXNwb25zZS50ZXh0KCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdUcmFkaW5nIGFsZ29yaXRobSBzdGFydGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzdGFydGluZyBhbGdvcml0aG06JywgZXJyb3IpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBDYWxsIHRoZSBmdW5jdGlvbiB0byBzdGFydCB0aGUgYWxnb3JpdGhtXG4gICAgc3RhcnRBbGdvcml0aG0oKTtcblxuICAgIC8vIE5vIGNsZWFudXAgbmVlZGVkIGFzIHRoZSBhbGdvcml0aG0gc2hvdWxkIGtlZXAgcnVubmluZ1xuICB9LCBbXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8Tm90aWZpY2F0aW9uUHJvdmlkZXI+XG4gICAgICA8TGF5b3V0PlxuICAgICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XG4gICAgICA8L0xheW91dD5cbiAgICA8L05vdGlmaWNhdGlvblByb3ZpZGVyPlxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBNeUFwcDsgIl0sIm5hbWVzIjpbIkxheW91dCIsInVzZUVmZmVjdCIsIk5vdGlmaWNhdGlvblByb3ZpZGVyIiwiTXlBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJzdGFydEFsZ29yaXRobSIsInJlc3BvbnNlIiwiZmV0Y2giLCJtZXRob2QiLCJvayIsImNvbnNvbGUiLCJlcnJvciIsInRleHQiLCJsb2ciXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(pages-dir-browser)/./src/pages/_app.js\n"));

/***/ })

});