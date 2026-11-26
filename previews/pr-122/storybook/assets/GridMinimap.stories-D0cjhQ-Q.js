import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{h as t,n,o as r}from"./iframe-C0zLdXOX.js";import{n as i,t as a}from"./src-3Use5Y8F.js";var o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{a(),n(),o=t(),{useArgs:s}=__STORYBOOK_MODULE_PREVIEW_API__,{fn:c}=__STORYBOOK_MODULE_TEST__,l={title:`Product/Grid/GridMinimap`,component:i,args:{gameStatus:{"0,0":`#22c55e`,"1,0":`#22c55e`,"20,20":`#3b82f6`},viewportMetrics:{columns:30,rows:20,offsetX:0,offsetY:0},cellSize:10,minCellSize:2,maxCellSize:24,isBoardMaximized:!1,handlePanUp:c(),handlePanDown:c(),handlePanLeft:c(),handlePanRight:c(),handleCenter:c(),handleZoomIn:c(),handleZoomOut:c(),panViewportToWorldCoordinate:c(),toggleBoardMaximized:c()},render:function(e){let[,t]=s(),{mode:n}=r();return(0,o.jsx)(`div`,{className:`grid-stage storybook-grid`,"data-theme-mode":n,children:(0,o.jsx)(i,{...e,handleZoomIn:()=>{e.handleZoomIn(),t({cellSize:Math.min(e.maxCellSize,e.cellSize+1)})},handleZoomOut:()=>{e.handleZoomOut(),t({cellSize:Math.max(e.minCellSize,e.cellSize-1)})},toggleBoardMaximized:()=>{e.toggleBoardMaximized?.(),t({isBoardMaximized:!e.isBoardMaximized})}})})}},u={},d={args:{gameStatus:{}}},f={args:{cellSize:24}},p={args:{isBoardMaximized:!0}},m=[`Default`,`EmptyBoard`,`ZoomLimit`,`Maximized`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    gameStatus: {}
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    cellSize: 24
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    isBoardMaximized: true
  }
}`,...p.parameters?.docs?.source}}}})))()}h();export{u as Default,d as EmptyBoard,p as Maximized,f as ZoomLimit,m as __namedExportsOrder,l as default};