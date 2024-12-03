"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/cadastros/setores/page",{

/***/ "(app-pages-browser)/./app/cadastros/setores/page.tsx":
/*!****************************************!*\
  !*** ./app/cadastros/setores/page.tsx ***!
  \****************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ Setores; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _components_DynamicCrudComponent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/components/DynamicCrudComponent */ \"(app-pages-browser)/./components/DynamicCrudComponent.tsx\");\n/* harmony import */ var _components_ui_card__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/components/ui/card */ \"(app-pages-browser)/./components/ui/card.tsx\");\n/* harmony import */ var _app_hooks_useSetoresHook__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/app/hooks/useSetoresHook */ \"(app-pages-browser)/./app/hooks/useSetoresHook.tsx\");\n/* harmony import */ var _app_hooks_usePessoasHook__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/app/hooks/usePessoasHook */ \"(app-pages-browser)/./app/hooks/usePessoasHook.tsx\");\n/* harmony import */ var react_toastify__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-toastify */ \"(app-pages-browser)/./node_modules/react-toastify/dist/react-toastify.esm.mjs\");\n/* harmony import */ var react_toastify_dist_ReactToastify_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-toastify/dist/ReactToastify.css */ \"(app-pages-browser)/./node_modules/react-toastify/dist/ReactToastify.css\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\n\n\n\n\n\nfunction Setores() {\n    _s();\n    const { index: listarSetores, changeStatus } = (0,_app_hooks_useSetoresHook__WEBPACK_IMPORTED_MODULE_4__.useSetoresHook)();\n    const { index: listarPessoas } = (0,_app_hooks_usePessoasHook__WEBPACK_IMPORTED_MODULE_5__.usePessoasHook)();\n    const [data, setData] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);\n    const [pessoasOptions, setPessoasOptions] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);\n    // Função para carregar a lista de setores\n    const carregarSetores = async ()=>{\n        try {\n            const response = await listarSetores();\n            console.log(\"Setores carregados:\", response); // Verificar o retorno\n            if (response) {\n                setData(response);\n            }\n        } catch (error) {\n            console.error(\"Erro ao carregar os setores:\", error);\n        }\n    };\n    // Função para carregar a lista de pessoas\n    const carregarPessoas = async ()=>{\n        try {\n            const response = await listarPessoas();\n            console.log(\"Pessoas carregadas:\", response); // Verificar o retorno\n            if (response) {\n                const options = response.map((pessoa)=>({\n                        value: pessoa.id,\n                        label: pessoa.nome\n                    }));\n                if (Array.isArray(options) && options.length) {\n                    options.unshift({\n                        value: \"00\",\n                        label: \"Selecione...\"\n                    });\n                }\n                setPessoasOptions(options);\n            }\n        } catch (error) {\n            console.error(\"Erro ao carregar a lista de pessoas:\", error);\n        }\n    };\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        carregarSetores();\n        carregarPessoas();\n    }, []);\n    // Campos do formulário\n    const formSetores = [\n        {\n            name: \"descricao\",\n            label: \"Descri\\xe7\\xe3o\",\n            type: \"text\",\n            required: true\n        },\n        {\n            name: \"pessoa_id\",\n            label: \"Respons\\xe1vel\",\n            type: \"select\",\n            lookup: true,\n            fetchOptions: async ()=>pessoasOptions\n        }\n    ];\n    // Função para buscar os dados\n    const fetchData = async ()=>{\n        console.log(\"Dados atuais:\", data); // Verificar estado dos dados\n        return data;\n    };\n    // Funções para manipulação de dados\n    const saveData = async (id, formData)=>{\n        if (id) {\n            setData((prevData)=>prevData.map((item)=>item.id === id ? {\n                        ...item,\n                        ...formData\n                    } : item));\n            console.log(\"Atualizando registro:\", id, formData);\n        } else {\n            const newId = data.length ? Math.max(...data.map((item)=>item.id)) + 1 : 1;\n            setData((prevData)=>[\n                    ...prevData,\n                    {\n                        id: newId,\n                        ...formData,\n                        active: true\n                    }\n                ]);\n            console.log(\"Criando novo registro:\", formData);\n        }\n        return {\n            success: true\n        };\n    };\n    const deleteData = async (id)=>{\n        setData((prevData)=>prevData.filter((item)=>item.id !== id));\n        console.log(\"Excluindo registro com id:\", id);\n        return {\n            success: true\n        };\n    };\n    const toggleStatus = async (id)=>{\n        const statusSetor = await changeStatus(id);\n        if (statusSetor) {\n            react_toastify__WEBPACK_IMPORTED_MODULE_6__.toast.success(\"Status do setor alterado com sucesso.\");\n            setData((prevData)=>prevData.map((item)=>item.id === id ? {\n                        ...item,\n                        active: !item.active\n                    } : item));\n            console.log(\"Alterando status do registro com id \".concat(id, \" para \").concat(statusSetor ? \"Ativo\" : \"Inativo\"));\n            return {\n                success: true\n            };\n        } else {\n            console.error(\"Erro ao alterar status do setor:\", id);\n            return {\n                success: false\n            };\n        }\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_card__WEBPACK_IMPORTED_MODULE_3__.Card, {\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_card__WEBPACK_IMPORTED_MODULE_3__.CardHeader, {\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_card__WEBPACK_IMPORTED_MODULE_3__.CardTitle, {\n                        children: \"Cadastro de Setores\"\n                    }, void 0, false, {\n                        fileName: \"/home/paulo/Desenvolvimento/Avaliacao/ConnectSkills/connecta-app-front/app/cadastros/setores/page.tsx\",\n                        lineNumber: 134,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_card__WEBPACK_IMPORTED_MODULE_3__.CardDescription, {\n                        children: \"Gerenciamento de setores e respons\\xe1veis.\"\n                    }, void 0, false, {\n                        fileName: \"/home/paulo/Desenvolvimento/Avaliacao/ConnectSkills/connecta-app-front/app/cadastros/setores/page.tsx\",\n                        lineNumber: 135,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"/home/paulo/Desenvolvimento/Avaliacao/ConnectSkills/connecta-app-front/app/cadastros/setores/page.tsx\",\n                lineNumber: 133,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_card__WEBPACK_IMPORTED_MODULE_3__.CardContent, {\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_DynamicCrudComponent__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n                    fields: formSetores,\n                    fetchData: fetchData,\n                    saveData: saveData,\n                    deleteData: deleteData,\n                    toggleStatus: toggleStatus\n                }, void 0, false, {\n                    fileName: \"/home/paulo/Desenvolvimento/Avaliacao/ConnectSkills/connecta-app-front/app/cadastros/setores/page.tsx\",\n                    lineNumber: 141,\n                    columnNumber: 9\n                }, this)\n            }, void 0, false, {\n                fileName: \"/home/paulo/Desenvolvimento/Avaliacao/ConnectSkills/connecta-app-front/app/cadastros/setores/page.tsx\",\n                lineNumber: 140,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"/home/paulo/Desenvolvimento/Avaliacao/ConnectSkills/connecta-app-front/app/cadastros/setores/page.tsx\",\n        lineNumber: 132,\n        columnNumber: 5\n    }, this);\n}\n_s(Setores, \"TTe777ilxUhXKtvAe8Z0oqbw3ec=\", false, function() {\n    return [\n        _app_hooks_useSetoresHook__WEBPACK_IMPORTED_MODULE_4__.useSetoresHook,\n        _app_hooks_usePessoasHook__WEBPACK_IMPORTED_MODULE_5__.usePessoasHook\n    ];\n});\n_c = Setores;\nvar _c;\n$RefreshReg$(_c, \"Setores\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2FwcC9jYWRhc3Ryb3Mvc2V0b3Jlcy9wYWdlLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFFNEM7QUFDeUI7QUFPdkM7QUFDOEI7QUFDQTtBQUVMO0FBQ1I7QUFFaEMsU0FBU1c7O0lBQ3RCLE1BQU0sRUFBRUMsT0FBT0MsYUFBYSxFQUFFQyxZQUFZLEVBQUUsR0FBR04seUVBQWNBO0lBQzdELE1BQU0sRUFBRUksT0FBT0csYUFBYSxFQUFFLEdBQUdOLHlFQUFjQTtJQUUvQyxNQUFNLENBQUNPLE1BQU1DLFFBQVEsR0FBR2hCLCtDQUFRQSxDQUFDLEVBQUU7SUFDbkMsTUFBTSxDQUFDaUIsZ0JBQWdCQyxrQkFBa0IsR0FBR2xCLCtDQUFRQSxDQUFDLEVBQUU7SUFFdkQsMENBQTBDO0lBQzFDLE1BQU1tQixrQkFBa0I7UUFDdEIsSUFBSTtZQUNGLE1BQU1DLFdBQVcsTUFBTVI7WUFDdkJTLFFBQVFDLEdBQUcsQ0FBQyx1QkFBdUJGLFdBQVcsc0JBQXNCO1lBQ3BFLElBQUlBLFVBQVU7Z0JBQ1pKLFFBQVFJO1lBQ1Y7UUFDRixFQUFFLE9BQU9HLE9BQU87WUFDZEYsUUFBUUUsS0FBSyxDQUFDLGdDQUFnQ0E7UUFDaEQ7SUFDRjtJQUVBLDBDQUEwQztJQUMxQyxNQUFNQyxrQkFBa0I7UUFDdEIsSUFBSTtZQUNGLE1BQU1KLFdBQVcsTUFBTU47WUFDdkJPLFFBQVFDLEdBQUcsQ0FBQyx1QkFBdUJGLFdBQVcsc0JBQXNCO1lBQ3BFLElBQUlBLFVBQVU7Z0JBQ1osTUFBTUssVUFBVUwsU0FBU00sR0FBRyxDQUFDLENBQUNDLFNBQTBDO3dCQUN0RUMsT0FBT0QsT0FBT0UsRUFBRTt3QkFDaEJDLE9BQU9ILE9BQU9JLElBQUk7b0JBQ3BCO2dCQUNBLElBQUlDLE1BQU1DLE9BQU8sQ0FBQ1IsWUFBWUEsUUFBUVMsTUFBTSxFQUFFO29CQUM1Q1QsUUFBUVUsT0FBTyxDQUFDO3dCQUFFUCxPQUFPO3dCQUFNRSxPQUFPO29CQUFlO2dCQUN2RDtnQkFDQVosa0JBQWtCTztZQUNwQjtRQUNGLEVBQUUsT0FBT0YsT0FBTztZQUNkRixRQUFRRSxLQUFLLENBQUMsd0NBQXdDQTtRQUN4RDtJQUNGO0lBRUF4QixnREFBU0EsQ0FBQztRQUNSb0I7UUFDQUs7SUFDRixHQUFHLEVBQUU7SUFFTCx1QkFBdUI7SUFDdkIsTUFBTVksY0FBYztRQUNsQjtZQUFFQyxNQUFNO1lBQWFQLE9BQU87WUFBYVEsTUFBTTtZQUFRQyxVQUFVO1FBQUs7UUFDdEU7WUFDRUYsTUFBTTtZQUNOUCxPQUFPO1lBQ1BRLE1BQU07WUFDTkUsUUFBUTtZQUNSQyxjQUFjLFVBQVl4QjtRQUM1QjtLQUNEO0lBRUQsOEJBQThCO0lBQzlCLE1BQU15QixZQUFZO1FBQ2hCckIsUUFBUUMsR0FBRyxDQUFDLGlCQUFpQlAsT0FBTyw2QkFBNkI7UUFDakUsT0FBT0E7SUFDVDtJQUVBLG9DQUFvQztJQUNwQyxNQUFNNEIsV0FBVyxPQUFPZCxJQUFtQmU7UUFDekMsSUFBSWYsSUFBSTtZQUNOYixRQUFRLENBQUM2QixXQUNQQSxTQUFTbkIsR0FBRyxDQUFDLENBQUNvQixPQUNaQSxLQUFLakIsRUFBRSxLQUFLQSxLQUFLO3dCQUFFLEdBQUdpQixJQUFJO3dCQUFFLEdBQUdGLFFBQVE7b0JBQUMsSUFBSUU7WUFHaER6QixRQUFRQyxHQUFHLENBQUMseUJBQXlCTyxJQUFJZTtRQUMzQyxPQUFPO1lBQ0wsTUFBTUcsUUFBUWhDLEtBQUttQixNQUFNLEdBQ3JCYyxLQUFLQyxHQUFHLElBQUlsQyxLQUFLVyxHQUFHLENBQUMsQ0FBQ29CLE9BQVNBLEtBQUtqQixFQUFFLEtBQUssSUFDM0M7WUFDSmIsUUFBUSxDQUFDNkIsV0FBYTt1QkFDakJBO29CQUNIO3dCQUFFaEIsSUFBSWtCO3dCQUFPLEdBQUdILFFBQVE7d0JBQUVNLFFBQVE7b0JBQUs7aUJBQ3hDO1lBQ0Q3QixRQUFRQyxHQUFHLENBQUMsMEJBQTBCc0I7UUFDeEM7UUFDQSxPQUFPO1lBQUVPLFNBQVM7UUFBSztJQUN6QjtJQUVBLE1BQU1DLGFBQWEsT0FBT3ZCO1FBQ3hCYixRQUFRLENBQUM2QixXQUFhQSxTQUFTUSxNQUFNLENBQUMsQ0FBQ1AsT0FBU0EsS0FBS2pCLEVBQUUsS0FBS0E7UUFDNURSLFFBQVFDLEdBQUcsQ0FBQyw4QkFBOEJPO1FBQzFDLE9BQU87WUFBRXNCLFNBQVM7UUFBSztJQUN6QjtJQUVBLE1BQU1HLGVBQWUsT0FBT3pCO1FBQzFCLE1BQU0wQixjQUFjLE1BQU0xQyxhQUFhZ0I7UUFFdkMsSUFBSTBCLGFBQWE7WUFDZjlDLGlEQUFLQSxDQUFDMEMsT0FBTyxDQUFDO1lBQ2RuQyxRQUFRLENBQUM2QixXQUNQQSxTQUFTbkIsR0FBRyxDQUFDLENBQUNvQixPQUNaQSxLQUFLakIsRUFBRSxLQUFLQSxLQUFLO3dCQUFFLEdBQUdpQixJQUFJO3dCQUFFSSxRQUFRLENBQUNKLEtBQUtJLE1BQU07b0JBQUMsSUFBSUo7WUFHekR6QixRQUFRQyxHQUFHLENBQ1QsdUNBQ0VpQyxPQURxQzFCLElBQUcsVUFFekMsT0FEQzBCLGNBQWMsVUFBVTtZQUc1QixPQUFPO2dCQUFFSixTQUFTO1lBQUs7UUFDekIsT0FBTztZQUNMOUIsUUFBUUUsS0FBSyxDQUFDLG9DQUFvQ007WUFDbEQsT0FBTztnQkFBRXNCLFNBQVM7WUFBTTtRQUMxQjtJQUNGO0lBRUEscUJBQ0UsOERBQUNqRCxxREFBSUE7OzBCQUNILDhEQUFDRywyREFBVUE7O2tDQUNULDhEQUFDQywwREFBU0E7a0NBQUM7Ozs7OztrQ0FDWCw4REFBQ0YsZ0VBQWVBO2tDQUFDOzs7Ozs7Ozs7Ozs7MEJBS25CLDhEQUFDRCw0REFBV0E7MEJBQ1YsNEVBQUNGLHdFQUFvQkE7b0JBQ25CdUQsUUFBUXBCO29CQUNSTSxXQUFXQTtvQkFDWEMsVUFBVUE7b0JBQ1ZTLFlBQVlBO29CQUNaRSxjQUFjQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLeEI7R0FySXdCNUM7O1FBQ3lCSCxxRUFBY0E7UUFDNUJDLHFFQUFjQTs7O0tBRnpCRSIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9hcHAvY2FkYXN0cm9zL3NldG9yZXMvcGFnZS50c3g/MzdkNiJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGNsaWVudCc7XG5cbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgRHluYW1pY0NydWRDb21wb25lbnQgZnJvbSAnQC9jb21wb25lbnRzL0R5bmFtaWNDcnVkQ29tcG9uZW50JztcbmltcG9ydCB7XG4gIENhcmQsXG4gIENhcmRDb250ZW50LFxuICBDYXJkRGVzY3JpcHRpb24sXG4gIENhcmRIZWFkZXIsXG4gIENhcmRUaXRsZSxcbn0gZnJvbSAnQC9jb21wb25lbnRzL3VpL2NhcmQnO1xuaW1wb3J0IHsgdXNlU2V0b3Jlc0hvb2sgfSBmcm9tICdAL2FwcC9ob29rcy91c2VTZXRvcmVzSG9vayc7XG5pbXBvcnQgeyB1c2VQZXNzb2FzSG9vayB9IGZyb20gJ0AvYXBwL2hvb2tzL3VzZVBlc3NvYXNIb29rJztcblxuaW1wb3J0IHsgVG9hc3RDb250YWluZXIsIHRvYXN0IH0gZnJvbSBcInJlYWN0LXRvYXN0aWZ5XCI7XG5pbXBvcnQgXCJyZWFjdC10b2FzdGlmeS9kaXN0L1JlYWN0VG9hc3RpZnkuY3NzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNldG9yZXMoKSB7XG4gIGNvbnN0IHsgaW5kZXg6IGxpc3RhclNldG9yZXMsIGNoYW5nZVN0YXR1cyB9ID0gdXNlU2V0b3Jlc0hvb2soKTtcbiAgY29uc3QgeyBpbmRleDogbGlzdGFyUGVzc29hcyB9ID0gdXNlUGVzc29hc0hvb2soKTtcblxuICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZShbXSk7XG4gIGNvbnN0IFtwZXNzb2FzT3B0aW9ucywgc2V0UGVzc29hc09wdGlvbnNdID0gdXNlU3RhdGUoW10pO1xuXG4gIC8vIEZ1bsOnw6NvIHBhcmEgY2FycmVnYXIgYSBsaXN0YSBkZSBzZXRvcmVzXG4gIGNvbnN0IGNhcnJlZ2FyU2V0b3JlcyA9IGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBsaXN0YXJTZXRvcmVzKCk7XG4gICAgICBjb25zb2xlLmxvZygnU2V0b3JlcyBjYXJyZWdhZG9zOicsIHJlc3BvbnNlKTsgLy8gVmVyaWZpY2FyIG8gcmV0b3Jub1xuICAgICAgaWYgKHJlc3BvbnNlKSB7XG4gICAgICAgIHNldERhdGEocmVzcG9uc2UpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvIGFvIGNhcnJlZ2FyIG9zIHNldG9yZXM6JywgZXJyb3IpO1xuICAgIH1cbiAgfTtcblxuICAvLyBGdW7Dp8OjbyBwYXJhIGNhcnJlZ2FyIGEgbGlzdGEgZGUgcGVzc29hc1xuICBjb25zdCBjYXJyZWdhclBlc3NvYXMgPSBhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbGlzdGFyUGVzc29hcygpO1xuICAgICAgY29uc29sZS5sb2coJ1Blc3NvYXMgY2FycmVnYWRhczonLCByZXNwb25zZSk7IC8vIFZlcmlmaWNhciBvIHJldG9ybm9cbiAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gcmVzcG9uc2UubWFwKChwZXNzb2E6IHsgaWQ6IG51bWJlcjsgbm9tZTogc3RyaW5nIH0pID0+ICh7XG4gICAgICAgICAgdmFsdWU6IHBlc3NvYS5pZCxcbiAgICAgICAgICBsYWJlbDogcGVzc29hLm5vbWUsXG4gICAgICAgIH0pKTtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9ucykgJiYgb3B0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICBvcHRpb25zLnVuc2hpZnQoeyB2YWx1ZTogJzAwJywgbGFiZWw6ICdTZWxlY2lvbmUuLi4nIH0pO1xuICAgICAgICB9XG4gICAgICAgIHNldFBlc3NvYXNPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvIGFvIGNhcnJlZ2FyIGEgbGlzdGEgZGUgcGVzc29hczonLCBlcnJvcik7XG4gICAgfVxuICB9O1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY2FycmVnYXJTZXRvcmVzKCk7XG4gICAgY2FycmVnYXJQZXNzb2FzKCk7XG4gIH0sIFtdKTtcblxuICAvLyBDYW1wb3MgZG8gZm9ybXVsw6FyaW9cbiAgY29uc3QgZm9ybVNldG9yZXMgPSBbXG4gICAgeyBuYW1lOiAnZGVzY3JpY2FvJywgbGFiZWw6ICdEZXNjcmnDp8OjbycsIHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICB7XG4gICAgICBuYW1lOiAncGVzc29hX2lkJyxcbiAgICAgIGxhYmVsOiAnUmVzcG9uc8OhdmVsJyxcbiAgICAgIHR5cGU6ICdzZWxlY3QnLFxuICAgICAgbG9va3VwOiB0cnVlLFxuICAgICAgZmV0Y2hPcHRpb25zOiBhc3luYyAoKSA9PiBwZXNzb2FzT3B0aW9ucyxcbiAgICB9LFxuICBdO1xuXG4gIC8vIEZ1bsOnw6NvIHBhcmEgYnVzY2FyIG9zIGRhZG9zXG4gIGNvbnN0IGZldGNoRGF0YSA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zb2xlLmxvZygnRGFkb3MgYXR1YWlzOicsIGRhdGEpOyAvLyBWZXJpZmljYXIgZXN0YWRvIGRvcyBkYWRvc1xuICAgIHJldHVybiBkYXRhO1xuICB9O1xuXG4gIC8vIEZ1bsOnw7VlcyBwYXJhIG1hbmlwdWxhw6fDo28gZGUgZGFkb3NcbiAgY29uc3Qgc2F2ZURhdGEgPSBhc3luYyAoaWQ6IG51bWJlciB8IG51bGwsIGZvcm1EYXRhOiBhbnkpID0+IHtcbiAgICBpZiAoaWQpIHtcbiAgICAgIHNldERhdGEoKHByZXZEYXRhKSA9PlxuICAgICAgICBwcmV2RGF0YS5tYXAoKGl0ZW0pID0+XG4gICAgICAgICAgaXRlbS5pZCA9PT0gaWQgPyB7IC4uLml0ZW0sIC4uLmZvcm1EYXRhIH0gOiBpdGVtXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZygnQXR1YWxpemFuZG8gcmVnaXN0cm86JywgaWQsIGZvcm1EYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbmV3SWQgPSBkYXRhLmxlbmd0aFxuICAgICAgICA/IE1hdGgubWF4KC4uLmRhdGEubWFwKChpdGVtKSA9PiBpdGVtLmlkKSkgKyAxXG4gICAgICAgIDogMTtcbiAgICAgIHNldERhdGEoKHByZXZEYXRhKSA9PiBbXG4gICAgICAgIC4uLnByZXZEYXRhLFxuICAgICAgICB7IGlkOiBuZXdJZCwgLi4uZm9ybURhdGEsIGFjdGl2ZTogdHJ1ZSB9LFxuICAgICAgXSk7XG4gICAgICBjb25zb2xlLmxvZygnQ3JpYW5kbyBub3ZvIHJlZ2lzdHJvOicsIGZvcm1EYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICB9O1xuXG4gIGNvbnN0IGRlbGV0ZURhdGEgPSBhc3luYyAoaWQ6IG51bWJlcikgPT4ge1xuICAgIHNldERhdGEoKHByZXZEYXRhKSA9PiBwcmV2RGF0YS5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uaWQgIT09IGlkKSk7XG4gICAgY29uc29sZS5sb2coJ0V4Y2x1aW5kbyByZWdpc3RybyBjb20gaWQ6JywgaWQpO1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgfTtcblxuICBjb25zdCB0b2dnbGVTdGF0dXMgPSBhc3luYyAoaWQ6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHN0YXR1c1NldG9yID0gYXdhaXQgY2hhbmdlU3RhdHVzKGlkKTtcblxuICAgIGlmIChzdGF0dXNTZXRvcikge1xuICAgICAgdG9hc3Quc3VjY2VzcyhcIlN0YXR1cyBkbyBzZXRvciBhbHRlcmFkbyBjb20gc3VjZXNzby5cIik7XG4gICAgICBzZXREYXRhKChwcmV2RGF0YSkgPT5cbiAgICAgICAgcHJldkRhdGEubWFwKChpdGVtKSA9PlxuICAgICAgICAgIGl0ZW0uaWQgPT09IGlkID8geyAuLi5pdGVtLCBhY3RpdmU6ICFpdGVtLmFjdGl2ZSB9IDogaXRlbVxuICAgICAgICApXG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIGBBbHRlcmFuZG8gc3RhdHVzIGRvIHJlZ2lzdHJvIGNvbSBpZCAke2lkfSBwYXJhICR7XG4gICAgICAgICAgc3RhdHVzU2V0b3IgPyAnQXRpdm8nIDogJ0luYXRpdm8nXG4gICAgICAgIH1gXG4gICAgICApO1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvIGFvIGFsdGVyYXIgc3RhdHVzIGRvIHNldG9yOicsIGlkKTtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlIH07XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPENhcmQ+XG4gICAgICA8Q2FyZEhlYWRlcj5cbiAgICAgICAgPENhcmRUaXRsZT5DYWRhc3RybyBkZSBTZXRvcmVzPC9DYXJkVGl0bGU+XG4gICAgICAgIDxDYXJkRGVzY3JpcHRpb24+XG4gICAgICAgICAgR2VyZW5jaWFtZW50byBkZSBzZXRvcmVzIGUgcmVzcG9uc8OhdmVpcy5cbiAgICAgICAgPC9DYXJkRGVzY3JpcHRpb24+XG4gICAgICA8L0NhcmRIZWFkZXI+XG5cbiAgICAgIDxDYXJkQ29udGVudD5cbiAgICAgICAgPER5bmFtaWNDcnVkQ29tcG9uZW50XG4gICAgICAgICAgZmllbGRzPXtmb3JtU2V0b3Jlc31cbiAgICAgICAgICBmZXRjaERhdGE9e2ZldGNoRGF0YX1cbiAgICAgICAgICBzYXZlRGF0YT17c2F2ZURhdGF9XG4gICAgICAgICAgZGVsZXRlRGF0YT17ZGVsZXRlRGF0YX1cbiAgICAgICAgICB0b2dnbGVTdGF0dXM9e3RvZ2dsZVN0YXR1c31cbiAgICAgICAgLz5cbiAgICAgIDwvQ2FyZENvbnRlbnQ+XG4gICAgPC9DYXJkPlxuICApO1xufVxuIl0sIm5hbWVzIjpbInVzZUVmZmVjdCIsInVzZVN0YXRlIiwiRHluYW1pY0NydWRDb21wb25lbnQiLCJDYXJkIiwiQ2FyZENvbnRlbnQiLCJDYXJkRGVzY3JpcHRpb24iLCJDYXJkSGVhZGVyIiwiQ2FyZFRpdGxlIiwidXNlU2V0b3Jlc0hvb2siLCJ1c2VQZXNzb2FzSG9vayIsInRvYXN0IiwiU2V0b3JlcyIsImluZGV4IiwibGlzdGFyU2V0b3JlcyIsImNoYW5nZVN0YXR1cyIsImxpc3RhclBlc3NvYXMiLCJkYXRhIiwic2V0RGF0YSIsInBlc3NvYXNPcHRpb25zIiwic2V0UGVzc29hc09wdGlvbnMiLCJjYXJyZWdhclNldG9yZXMiLCJyZXNwb25zZSIsImNvbnNvbGUiLCJsb2ciLCJlcnJvciIsImNhcnJlZ2FyUGVzc29hcyIsIm9wdGlvbnMiLCJtYXAiLCJwZXNzb2EiLCJ2YWx1ZSIsImlkIiwibGFiZWwiLCJub21lIiwiQXJyYXkiLCJpc0FycmF5IiwibGVuZ3RoIiwidW5zaGlmdCIsImZvcm1TZXRvcmVzIiwibmFtZSIsInR5cGUiLCJyZXF1aXJlZCIsImxvb2t1cCIsImZldGNoT3B0aW9ucyIsImZldGNoRGF0YSIsInNhdmVEYXRhIiwiZm9ybURhdGEiLCJwcmV2RGF0YSIsIml0ZW0iLCJuZXdJZCIsIk1hdGgiLCJtYXgiLCJhY3RpdmUiLCJzdWNjZXNzIiwiZGVsZXRlRGF0YSIsImZpbHRlciIsInRvZ2dsZVN0YXR1cyIsInN0YXR1c1NldG9yIiwiZmllbGRzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./app/cadastros/setores/page.tsx\n"));

/***/ }),

/***/ "(app-pages-browser)/./node_modules/react-toastify/dist/react-toastify.esm.mjs":
/*!*****************************************************************!*\
  !*** ./node_modules/react-toastify/dist/react-toastify.esm.mjs ***!
  \*****************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Bounce: function() { return /* binding */ H; },
/* harmony export */   Flip: function() { return /* binding */ Y; },
/* harmony export */   Icons: function() { return /* binding */ z; },
/* harmony export */   Slide: function() { return /* binding */ F; },
/* harmony export */   ToastContainer: function() { return /* binding */ Q; },
/* harmony export */   Zoom: function() { return /* binding */ X; },
/* harmony export */   collapseToast: function() { return /* binding */ f; },
/* harmony export */   cssTransition: function() { return /* binding */ g; },
/* harmony export */   toast: function() { return /* binding */ B; },
/* harmony export */   useToast: function() { return /* binding */ N; },
/* harmony export */   useToastContainer: function() { return /* binding */ L; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js");
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! clsx */ "(app-pages-browser)/./node_modules/clsx/dist/clsx.mjs");
/* __next_internal_client_entry_do_not_use__ Bounce,Flip,Icons,Slide,ToastContainer,Zoom,collapseToast,cssTransition,toast,useToast,useToastContainer auto */ 

const c = (e)=>"number" == typeof e && !isNaN(e), d = (e)=>"string" == typeof e, u = (e)=>"function" == typeof e, p = (e)=>d(e) || u(e) ? e : null, m = (e)=>/*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_0__.isValidElement)(e) || d(e) || u(e) || c(e);
function f(e, t, n) {
    void 0 === n && (n = 300);
    const { scrollHeight: o, style: s } = e;
    requestAnimationFrame(()=>{
        s.minHeight = "initial", s.height = o + "px", s.transition = "all ".concat(n, "ms"), requestAnimationFrame(()=>{
            s.height = "0", s.padding = "0", s.margin = "0", setTimeout(t, n);
        });
    });
}
function g(t) {
    let { enter: a, exit: r, appendPosition: i = !1, collapse: l = !0, collapseDuration: c = 300 } = t;
    return function(t) {
        let { children: d, position: u, preventExitTransition: p, done: m, nodeRef: g, isIn: y, playToast: v } = t;
        const h = i ? "".concat(a, "--").concat(u) : a, T = i ? "".concat(r, "--").concat(u) : r, E = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(0);
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(()=>{
            const e = g.current, t = h.split(" "), n = (o)=>{
                o.target === g.current && (v(), e.removeEventListener("animationend", n), e.removeEventListener("animationcancel", n), 0 === E.current && "animationcancel" !== o.type && e.classList.remove(...t));
            };
            e.classList.add(...t), e.addEventListener("animationend", n), e.addEventListener("animationcancel", n);
        }, []), (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(()=>{
            const e = g.current, t = ()=>{
                e.removeEventListener("animationend", t), l ? f(e, m, c) : m();
            };
            y || (p ? t() : (E.current = 1, e.className += " ".concat(T), e.addEventListener("animationend", t)));
        }, [
            y
        ]), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, d);
    };
}
function y(e, t) {
    return null != e ? {
        content: e.content,
        containerId: e.props.containerId,
        id: e.props.toastId,
        theme: e.props.theme,
        type: e.props.type,
        data: e.props.data || {},
        isLoading: e.props.isLoading,
        icon: e.props.icon,
        status: t
    } : {};
}
const v = new Map;
let h = [];
const T = new Set, E = (e)=>T.forEach((t)=>t(e)), b = ()=>v.size > 0;
function I(e, t) {
    var n;
    if (t) return !(null == (n = v.get(t)) || !n.isToastActive(e));
    let o = !1;
    return v.forEach((t)=>{
        t.isToastActive(e) && (o = !0);
    }), o;
}
_c = I;
function _(e, t) {
    m(e) && (b() || h.push({
        content: e,
        options: t
    }), v.forEach((n)=>{
        n.buildToast(e, t);
    }));
}
function C(e, t) {
    v.forEach((n)=>{
        null != t && null != t && t.containerId ? (null == t ? void 0 : t.containerId) === n.id && n.toggle(e, null == t ? void 0 : t.id) : n.toggle(e, null == t ? void 0 : t.id);
    });
}
_c1 = C;
function L(e) {
    const { subscribe: o, getSnapshot: s, setProps: i } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(function(e) {
        const n = e.containerId || 1;
        return {
            subscribe (o) {
                const s = function(e, n, o) {
                    let s = 1, r = 0, i = [], l = [], f = [], g = n;
                    const v = new Map, h = new Set, T = ()=>{
                        f = Array.from(v.values()), h.forEach((e)=>e());
                    }, E = (e)=>{
                        l = null == e ? [] : l.filter((t)=>t !== e), T();
                    }, b = (e)=>{
                        const { toastId: n, onOpen: s, updateId: a, children: r } = e.props, i = null == a;
                        e.staleId && v.delete(e.staleId), v.set(n, e), l = [
                            ...l,
                            e.props.toastId
                        ].filter((t)=>t !== e.staleId), T(), o(y(e, i ? "added" : "updated")), i && u(s) && s(/*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_0__.isValidElement)(r) && r.props);
                    };
                    return {
                        id: e,
                        props: g,
                        observe: (e)=>(h.add(e), ()=>h.delete(e)),
                        toggle: (e, t)=>{
                            v.forEach((n)=>{
                                null != t && t !== n.props.toastId || u(n.toggle) && n.toggle(e);
                            });
                        },
                        removeToast: E,
                        toasts: v,
                        clearQueue: ()=>{
                            r -= i.length, i = [];
                        },
                        buildToast: (n, l)=>{
                            if (((t)=>{
                                let { containerId: n, toastId: o, updateId: s } = t;
                                const a = n ? n !== e : 1 !== e, r = v.has(o) && null == s;
                                return a || r;
                            })(l)) return;
                            const { toastId: f, updateId: h, data: I, staleId: _, delay: C } = l, L = ()=>{
                                E(f);
                            }, N = null == h;
                            N && r++;
                            const $ = {
                                ...g,
                                style: g.toastStyle,
                                key: s++,
                                ...Object.fromEntries(Object.entries(l).filter((e)=>{
                                    let [t, n] = e;
                                    return null != n;
                                })),
                                toastId: f,
                                updateId: h,
                                data: I,
                                closeToast: L,
                                isIn: !1,
                                className: p(l.className || g.toastClassName),
                                bodyClassName: p(l.bodyClassName || g.bodyClassName),
                                progressClassName: p(l.progressClassName || g.progressClassName),
                                autoClose: !l.isLoading && (w = l.autoClose, k = g.autoClose, !1 === w || c(w) && w > 0 ? w : k),
                                deleteToast () {
                                    const e = v.get(f), { onClose: n, children: s } = e.props;
                                    u(n) && n(/*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_0__.isValidElement)(s) && s.props), o(y(e, "removed")), v.delete(f), r--, r < 0 && (r = 0), i.length > 0 ? b(i.shift()) : T();
                                }
                            };
                            var w, k;
                            $.closeButton = g.closeButton, !1 === l.closeButton || m(l.closeButton) ? $.closeButton = l.closeButton : !0 === l.closeButton && ($.closeButton = !m(g.closeButton) || g.closeButton);
                            let P = n;
                            /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_0__.isValidElement)(n) && !d(n.type) ? P = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_0__.cloneElement)(n, {
                                closeToast: L,
                                toastProps: $,
                                data: I
                            }) : u(n) && (P = n({
                                closeToast: L,
                                toastProps: $,
                                data: I
                            }));
                            const M = {
                                content: P,
                                props: $,
                                staleId: _
                            };
                            g.limit && g.limit > 0 && r > g.limit && N ? i.push(M) : c(C) ? setTimeout(()=>{
                                b(M);
                            }, C) : b(M);
                        },
                        setProps (e) {
                            g = e;
                        },
                        setToggle: (e, t)=>{
                            v.get(e).toggle = t;
                        },
                        isToastActive: (e)=>l.some((t)=>t === e),
                        getSnapshot: ()=>f
                    };
                }(n, e, E);
                v.set(n, s);
                const r = s.observe(o);
                return h.forEach((e)=>_(e.content, e.options)), h = [], ()=>{
                    r(), v.delete(n);
                };
            },
            setProps (e) {
                var t;
                null == (t = v.get(n)) || t.setProps(e);
            },
            getSnapshot () {
                var e;
                return null == (e = v.get(n)) ? void 0 : e.getSnapshot();
            }
        };
    }(e)).current;
    i(e);
    const l = (0,react__WEBPACK_IMPORTED_MODULE_0__.useSyncExternalStore)(o, s, s);
    return {
        getToastToRender: function(t) {
            if (!l) return [];
            const n = new Map;
            return e.newestOnTop && l.reverse(), l.forEach((e)=>{
                const { position: t } = e.props;
                n.has(t) || n.set(t, []), n.get(t).push(e);
            }), Array.from(n, (e)=>t(e[0], e[1]));
        },
        isToastActive: I,
        count: null == l ? void 0 : l.length
    };
}
_c2 = L;
function N(e) {
    const [t, o] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(!1), [a, r] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(!1), l = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null), c = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)({
        start: 0,
        delta: 0,
        removalDistance: 0,
        canCloseOnClick: !0,
        canDrag: !1,
        didMove: !1
    }).current, { autoClose: d, pauseOnHover: u, closeToast: p, onClick: m, closeOnClick: f } = e;
    var g, y;
    function h() {
        o(!0);
    }
    function T() {
        o(!1);
    }
    function E(n) {
        const o = l.current;
        c.canDrag && o && (c.didMove = !0, t && T(), c.delta = "x" === e.draggableDirection ? n.clientX - c.start : n.clientY - c.start, c.start !== n.clientX && (c.canCloseOnClick = !1), o.style.transform = "translate3d(".concat("x" === e.draggableDirection ? "".concat(c.delta, "px, var(--y)") : "0, calc(".concat(c.delta, "px + var(--y))"), ",0)"), o.style.opacity = "" + (1 - Math.abs(c.delta / c.removalDistance)));
    }
    function b() {
        document.removeEventListener("pointermove", E), document.removeEventListener("pointerup", b);
        const t = l.current;
        if (c.canDrag && c.didMove && t) {
            if (c.canDrag = !1, Math.abs(c.delta) > c.removalDistance) return r(!0), e.closeToast(), void e.collapseAll();
            t.style.transition = "transform 0.2s, opacity 0.2s", t.style.removeProperty("transform"), t.style.removeProperty("opacity");
        }
    }
    null == (y = v.get((g = {
        id: e.toastId,
        containerId: e.containerId,
        fn: o
    }).containerId || 1)) || y.setToggle(g.id, g.fn), (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(()=>{
        if (e.pauseOnFocusLoss) return document.hasFocus() || T(), window.addEventListener("focus", h), window.addEventListener("blur", T), ()=>{
            window.removeEventListener("focus", h), window.removeEventListener("blur", T);
        };
    }, [
        e.pauseOnFocusLoss
    ]);
    const I = {
        onPointerDown: function(t) {
            if (!0 === e.draggable || e.draggable === t.pointerType) {
                c.didMove = !1, document.addEventListener("pointermove", E), document.addEventListener("pointerup", b);
                const n = l.current;
                c.canCloseOnClick = !0, c.canDrag = !0, n.style.transition = "none", "x" === e.draggableDirection ? (c.start = t.clientX, c.removalDistance = n.offsetWidth * (e.draggablePercent / 100)) : (c.start = t.clientY, c.removalDistance = n.offsetHeight * (80 === e.draggablePercent ? 1.5 * e.draggablePercent : e.draggablePercent) / 100);
            }
        },
        onPointerUp: function(t) {
            const { top: n, bottom: o, left: s, right: a } = l.current.getBoundingClientRect();
            "touchend" !== t.nativeEvent.type && e.pauseOnHover && t.clientX >= s && t.clientX <= a && t.clientY >= n && t.clientY <= o ? T() : h();
        }
    };
    return d && u && (I.onMouseEnter = T, e.stacked || (I.onMouseLeave = h)), f && (I.onClick = (e)=>{
        m && m(e), c.canCloseOnClick && p();
    }), {
        playToast: h,
        pauseToast: T,
        isRunning: t,
        preventExitTransition: a,
        toastRef: l,
        eventHandlers: I
    };
}
_c3 = N;
function $(t) {
    let { delay: n, isRunning: o, closeToast: s, type: a = "default", hide: r, className: i, style: c, controlledProgress: d, progress: p, rtl: m, isIn: f, theme: g } = t;
    const y = r || d && 0 === p, v = {
        ...c,
        animationDuration: "".concat(n, "ms"),
        animationPlayState: o ? "running" : "paused"
    };
    d && (v.transform = "scaleX(".concat(p, ")"));
    const h = (0,clsx__WEBPACK_IMPORTED_MODULE_1__["default"])("Toastify__progress-bar", d ? "Toastify__progress-bar--controlled" : "Toastify__progress-bar--animated", "Toastify__progress-bar-theme--".concat(g), "Toastify__progress-bar--".concat(a), {
        "Toastify__progress-bar--rtl": m
    }), T = u(i) ? i({
        rtl: m,
        type: a,
        defaultClassName: h
    }) : (0,clsx__WEBPACK_IMPORTED_MODULE_1__["default"])(h, i), E = {
        [d && p >= 1 ? "onTransitionEnd" : "onAnimationEnd"]: d && p < 1 ? null : ()=>{
            f && s();
        }
    };
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        className: "Toastify__progress-bar--wrp",
        "data-hidden": y
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        className: "Toastify__progress-bar--bg Toastify__progress-bar-theme--".concat(g, " Toastify__progress-bar--").concat(a)
    }), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        role: "progressbar",
        "aria-hidden": y ? "true" : "false",
        "aria-label": "notification timer",
        className: T,
        style: v,
        ...E
    }));
}
let w = 1;
const k = ()=>"" + w++;
function P(e) {
    return e && (d(e.toastId) || c(e.toastId)) ? e.toastId : k();
}
_c4 = P;
function M(e, t) {
    return _(e, t), t.toastId;
}
_c5 = M;
function x(e, t) {
    return {
        ...t,
        type: t && t.type || e,
        toastId: P(t)
    };
}
function A(e) {
    return (t, n)=>M(t, x(e, n));
}
_c6 = A;
function B(e, t) {
    return M(e, x("default", t));
}
_c7 = B;
B.loading = (e, t)=>M(e, x("default", {
        isLoading: !0,
        autoClose: !1,
        closeOnClick: !1,
        closeButton: !1,
        draggable: !1,
        ...t
    })), B.promise = function(e, t, n) {
    let o, { pending: s, error: a, success: r } = t;
    s && (o = d(s) ? B.loading(s, n) : B.loading(s.render, {
        ...n,
        ...s
    }));
    const i = {
        isLoading: null,
        autoClose: null,
        closeOnClick: null,
        closeButton: null,
        draggable: null
    }, l = (e, t, s)=>{
        if (null == t) return void B.dismiss(o);
        const a = {
            type: e,
            ...i,
            ...n,
            data: s
        }, r = d(t) ? {
            render: t
        } : t;
        return o ? B.update(o, {
            ...a,
            ...r
        }) : B(r.render, {
            ...a,
            ...r
        }), s;
    }, c = u(e) ? e() : e;
    return c.then((e)=>l("success", r, e)).catch((e)=>l("error", a, e)), c;
}, B.success = A("success"), B.info = A("info"), B.error = A("error"), B.warning = A("warning"), B.warn = B.warning, B.dark = (e, t)=>M(e, x("default", {
        theme: "dark",
        ...t
    })), B.dismiss = function(e) {
    !function(e) {
        var t;
        if (b()) {
            if (null == e || d(t = e) || c(t)) v.forEach((t)=>{
                t.removeToast(e);
            });
            else if (e && ("containerId" in e || "id" in e)) {
                const t = v.get(e.containerId);
                t ? t.removeToast(e.id) : v.forEach((t)=>{
                    t.removeToast(e.id);
                });
            }
        } else h = h.filter((t)=>null != e && t.options.toastId !== e);
    }(e);
}, B.clearWaitingQueue = function(e) {
    void 0 === e && (e = {}), v.forEach((t)=>{
        !t.props.limit || e.containerId && t.id !== e.containerId || t.clearQueue();
    });
}, B.isActive = I, B.update = function(e, t) {
    void 0 === t && (t = {});
    const n = ((e, t)=>{
        var n;
        let { containerId: o } = t;
        return null == (n = v.get(o || 1)) ? void 0 : n.toasts.get(e);
    })(e, t);
    if (n) {
        const { props: o, content: s } = n, a = {
            delay: 100,
            ...o,
            ...t,
            toastId: t.toastId || e,
            updateId: k()
        };
        a.toastId !== e && (a.staleId = e);
        const r = a.render || s;
        delete a.render, M(r, a);
    }
}, B.done = (e)=>{
    B.update(e, {
        progress: 1
    });
}, B.onChange = function(e) {
    return T.add(e), ()=>{
        T.delete(e);
    };
}, B.play = (e)=>C(!0, e), B.pause = (e)=>C(!1, e);
const O = "undefined" != typeof window ? react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect : react__WEBPACK_IMPORTED_MODULE_0__.useEffect, D = (t)=>{
    let { theme: n, type: o, isLoading: s, ...a } = t;
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("svg", {
        viewBox: "0 0 24 24",
        width: "100%",
        height: "100%",
        fill: "colored" === n ? "currentColor" : "var(--toastify-icon-color-".concat(o, ")"),
        ...a
    });
}, z = {
    info: function(t) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(D, {
            ...t
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
            d: "M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm.25 5a1.5 1.5 0 11-1.5 1.5 1.5 1.5 0 011.5-1.5zm2.25 13.5h-4a1 1 0 010-2h.75a.25.25 0 00.25-.25v-4.5a.25.25 0 00-.25-.25h-.75a1 1 0 010-2h1a2 2 0 012 2v4.75a.25.25 0 00.25.25h.75a1 1 0 110 2z"
        }));
    },
    warning: function(t) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(D, {
            ...t
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
            d: "M23.32 17.191L15.438 2.184C14.728.833 13.416 0 11.996 0c-1.42 0-2.733.833-3.443 2.184L.533 17.448a4.744 4.744 0 000 4.368C1.243 23.167 2.555 24 3.975 24h16.05C22.22 24 24 22.044 24 19.632c0-.904-.251-1.746-.68-2.44zm-9.622 1.46c0 1.033-.724 1.823-1.698 1.823s-1.698-.79-1.698-1.822v-.043c0-1.028.724-1.822 1.698-1.822s1.698.79 1.698 1.822v.043zm.039-12.285l-.84 8.06c-.057.581-.408.943-.897.943-.49 0-.84-.367-.896-.942l-.84-8.065c-.057-.624.25-1.095.779-1.095h1.91c.528.005.84.476.784 1.1z"
        }));
    },
    success: function(t) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(D, {
            ...t
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
            d: "M12 0a12 12 0 1012 12A12.014 12.014 0 0012 0zm6.927 8.2l-6.845 9.289a1.011 1.011 0 01-1.43.188l-4.888-3.908a1 1 0 111.25-1.562l4.076 3.261 6.227-8.451a1 1 0 111.61 1.183z"
        }));
    },
    error: function(t) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(D, {
            ...t
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
            d: "M11.983 0a12.206 12.206 0 00-8.51 3.653A11.8 11.8 0 000 12.207 11.779 11.779 0 0011.8 24h.214A12.111 12.111 0 0024 11.791 11.766 11.766 0 0011.983 0zM10.5 16.542a1.476 1.476 0 011.449-1.53h.027a1.527 1.527 0 011.523 1.47 1.475 1.475 0 01-1.449 1.53h-.027a1.529 1.529 0 01-1.523-1.47zM11 12.5v-6a1 1 0 012 0v6a1 1 0 11-2 0z"
        }));
    },
    spinner: function() {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
            className: "Toastify__spinner"
        });
    }
}, R = (n)=>{
    const { isRunning: o, preventExitTransition: s, toastRef: r, eventHandlers: i, playToast: c } = N(n), { closeButton: d, children: p, autoClose: m, onClick: f, type: g, hideProgressBar: y, closeToast: v, transition: h, position: T, className: E, style: b, bodyClassName: I, bodyStyle: _, progressClassName: C, progressStyle: L, updateId: w, role: k, progress: P, rtl: M, toastId: x, deleteToast: A, isIn: B, isLoading: O, closeOnClick: D, theme: R } = n, S = (0,clsx__WEBPACK_IMPORTED_MODULE_1__["default"])("Toastify__toast", "Toastify__toast-theme--".concat(R), "Toastify__toast--".concat(g), {
        "Toastify__toast--rtl": M
    }, {
        "Toastify__toast--close-on-click": D
    }), H = u(E) ? E({
        rtl: M,
        position: T,
        type: g,
        defaultClassName: S
    }) : (0,clsx__WEBPACK_IMPORTED_MODULE_1__["default"])(S, E), F = function(e) {
        let { theme: n, type: o, isLoading: s, icon: r } = e, i = null;
        const l = {
            theme: n,
            type: o
        };
        return !1 === r || (u(r) ? i = r({
            ...l,
            isLoading: s
        }) : /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_0__.isValidElement)(r) ? i = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_0__.cloneElement)(r, l) : s ? i = z.spinner() : ((e)=>e in z)(o) && (i = z[o](l))), i;
    }(n), X = !!P || !m, Y = {
        closeToast: v,
        type: g,
        theme: R
    };
    let q = null;
    return !1 === d || (q = u(d) ? d(Y) : /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_0__.isValidElement)(d) ? /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_0__.cloneElement)(d, Y) : function(t) {
        let { closeToast: n, theme: o, ariaLabel: s = "close" } = t;
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", {
            className: "Toastify__close-button Toastify__close-button--".concat(o),
            type: "button",
            onClick: (e)=>{
                e.stopPropagation(), n(e);
            },
            "aria-label": s
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("svg", {
            "aria-hidden": "true",
            viewBox: "0 0 14 16"
        }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
            fillRule: "evenodd",
            d: "M7.71 8.23l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75L1 11.98l3.75-3.75L1 4.48 2.48 3l3.75 3.75L9.98 3l1.48 1.48-3.75 3.75z"
        })));
    }(Y)), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(h, {
        isIn: B,
        done: A,
        position: T,
        preventExitTransition: s,
        nodeRef: r,
        playToast: c
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        id: x,
        onClick: f,
        "data-in": B,
        className: H,
        ...i,
        style: b,
        ref: r
    }, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        ...B && {
            role: k
        },
        className: u(I) ? I({
            type: g
        }) : (0,clsx__WEBPACK_IMPORTED_MODULE_1__["default"])("Toastify__toast-body", I),
        style: _
    }, null != F && /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        className: (0,clsx__WEBPACK_IMPORTED_MODULE_1__["default"])("Toastify__toast-icon", {
            "Toastify--animate-icon Toastify__zoom-enter": !O
        })
    }, F), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", null, p)), q, /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement($, {
        ...w && !X ? {
            key: "pb-".concat(w)
        } : {},
        rtl: M,
        theme: R,
        delay: m,
        isRunning: o,
        isIn: B,
        closeToast: v,
        hide: y,
        type: g,
        style: L,
        className: C,
        controlledProgress: X,
        progress: P || 0
    })));
}, S = function(e, t) {
    return void 0 === t && (t = !1), {
        enter: "Toastify--animate Toastify__".concat(e, "-enter"),
        exit: "Toastify--animate Toastify__".concat(e, "-exit"),
        appendPosition: t
    };
}, H = g(S("bounce", !0)), F = g(S("slide", !0)), X = g(S("zoom")), Y = g(S("flip")), q = {
    position: "top-right",
    transition: H,
    autoClose: 5e3,
    closeButton: !0,
    pauseOnHover: !0,
    pauseOnFocusLoss: !0,
    draggable: "touch",
    draggablePercent: 80,
    draggableDirection: "x",
    role: "alert",
    theme: "light"
};
function Q(t) {
    let o = {
        ...q,
        ...t
    };
    const s = t.stacked, [a, r] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(!0), c = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null), { getToastToRender: d, isToastActive: m, count: f } = L(o), { className: g, style: y, rtl: v, containerId: h } = o;
    function T(e) {
        const t = (0,clsx__WEBPACK_IMPORTED_MODULE_1__["default"])("Toastify__toast-container", "Toastify__toast-container--".concat(e), {
            "Toastify__toast-container--rtl": v
        });
        return u(g) ? g({
            position: e,
            rtl: v,
            defaultClassName: t
        }) : (0,clsx__WEBPACK_IMPORTED_MODULE_1__["default"])(t, p(g));
    }
    function E() {
        s && (r(!0), B.play());
    }
    return O(()=>{
        if (s) {
            var e;
            const t = c.current.querySelectorAll('[data-in="true"]'), n = 12, s = null == (e = o.position) ? void 0 : e.includes("top");
            let r = 0, i = 0;
            Array.from(t).reverse().forEach((e, t)=>{
                const o = e;
                o.classList.add("Toastify__toast--stacked"), t > 0 && (o.dataset.collapsed = "".concat(a)), o.dataset.pos || (o.dataset.pos = s ? "top" : "bot");
                const l = r * (a ? .2 : 1) + (a ? 0 : n * t);
                o.style.setProperty("--y", "".concat(s ? l : -1 * l, "px")), o.style.setProperty("--g", "".concat(n)), o.style.setProperty("--s", "" + (1 - (a ? i : 0))), r += o.offsetHeight, i += .025;
            });
        }
    }, [
        a,
        f,
        s
    ]), /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
        ref: c,
        className: "Toastify",
        id: h,
        onMouseEnter: ()=>{
            s && (r(!1), B.pause());
        },
        onMouseLeave: E
    }, d((t, n)=>{
        const o = n.length ? {
            ...y
        } : {
            ...y,
            pointerEvents: "none"
        };
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", {
            className: T(t),
            style: o,
            key: "container-".concat(t)
        }, n.map((t)=>{
            let { content: n, props: o } = t;
            return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_0__.createElement(R, {
                ...o,
                stacked: s,
                collapseAll: E,
                isIn: m(o.toastId, o.containerId),
                style: o.style,
                key: "toast-".concat(o.key)
            }, n);
        }));
    }));
}
_c8 = Q;
 //# sourceMappingURL=react-toastify.esm.mjs.map
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8;
$RefreshReg$(_c, "I");
$RefreshReg$(_c1, "C");
$RefreshReg$(_c2, "L");
$RefreshReg$(_c3, "N");
$RefreshReg$(_c4, "P");
$RefreshReg$(_c5, "M");
$RefreshReg$(_c6, "A");
$RefreshReg$(_c7, "B");
$RefreshReg$(_c8, "Q");


/***/ })

});