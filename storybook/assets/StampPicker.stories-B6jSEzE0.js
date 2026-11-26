import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{m as t,t as n}from"./src-BcWuYDGe.js";import{h as r,n as i,o as a}from"./iframe-C0zLdXOX.js";import{o,r as s}from"./createLucideIcon-C7jWNSS1.js";import{i as c,r as l,t as u}from"./src-CoolDZw3.js";var d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{n(),i(),s(),u(),d=r(),{useArgs:f}=__STORYBOOK_MODULE_PREVIEW_API__,{fn:p}=__STORYBOOK_MODULE_TEST__,m={title:`Product/Controls/StampPicker`,component:t,args:{selectedPaletteId:`classic`,activeEditTool:`stamp`,stampRotation:0,stampPattern:null,stampPreviewPattern:null,stampPatternName:``,searchQuery:``,selectedCategory:`all`,onSearchQueryChange:p(),onCategoryChange:p(),onEditToolChange:p(),onStampPatternSelect:p(),onRotateStamp:p()},render:function(e){let[,n]=f(),{mode:r}=a();return(0,d.jsx)(`div`,{className:`grid-stage storybook-grid`,"data-theme-mode":r,children:(0,d.jsx)(t,{...e,stampPreviewPattern:e.stampPreviewPattern?l(e.stampPreviewPattern,e.stampRotation??0):e.stampPreviewPattern,onSearchQueryChange:t=>{e.onSearchQueryChange?.(t),n({searchQuery:t})},onCategoryChange:t=>{e.onCategoryChange?.(t),n({selectedCategory:t})},onStampPatternSelect:t=>{e.onStampPatternSelect?.(t),n({stampPattern:t,stampPreviewPattern:t})},onRotateStamp:()=>{e.onRotateStamp?.(),n({stampRotation:c(e.stampRotation??0)})}})})}},h={},g={args:{stampPattern:o,stampPreviewPattern:o,stampPatternName:`Glider`}},_={args:{searchQuery:`no-such-pattern`}},v={args:{stampPattern:o,stampPreviewPattern:o,stampPatternName:`Glider`,stampRotation:90}},y=[`Default`,`Selected`,`EmptySearch`,`Rotated`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    stampPattern: glider,
    stampPreviewPattern: glider,
    stampPatternName: 'Glider'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    searchQuery: 'no-such-pattern'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    stampPattern: glider,
    stampPreviewPattern: glider,
    stampPatternName: 'Glider',
    stampRotation: 90
  }
}`,...v.parameters?.docs?.source}}}})))()}b();export{h as Default,_ as EmptySearch,v as Rotated,g as Selected,y as __namedExportsOrder,m as default};