import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t,v as n}from"./src-BcWuYDGe.js";import{h as r}from"./iframe-C0zLdXOX.js";var i,a,o,s,c,l,u,d,f;function p(){return(p=e((()=>{t(),i=r(),{useArgs:a}=__STORYBOOK_MODULE_PREVIEW_API__,{fn:o}=__STORYBOOK_MODULE_TEST__,s={title:`Product/Controls/DrawColorPicker`,component:n,parameters:{docs:{description:{component:`Product adapter around the canonical @wintermuted/ui-react ColorPicker; not a duplicate implementation.`}}},args:{variant:`edit`,selectedPaletteId:`classic`,selectedDrawColor:`#22c55e`,draftValue:`#22c55e`,customColors:[`#ffffff`,`#000000`,`#f43f5e`,`#14b8a6`],isGameRunning:!1,onDraftChange:o(),onSelect:o(),onChange:o(),onCustomColorCommitted:o()},render:function(e){let[,t]=a();return(0,i.jsx)(n,{...e,onDraftChange:n=>{e.onDraftChange(n),t({draftValue:n})},onSelect:(n,r,i)=>{e.onSelect(n,r,i),t({selectedDrawColor:n,draftValue:n})},onChange:n=>{e.onChange(n),t({selectedDrawColor:n,draftValue:n})}})}},c={},l={args:{variant:`play`}},u={args:{draftValue:`not-a-color`}},d={args:{isGameRunning:!0}},f=[`Default`,`Toolbar`,`InvalidDraft`,`Disabled`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'play'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    draftValue: 'not-a-color'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    isGameRunning: true
  }
}`,...d.parameters?.docs?.source}}}})))()}p();export{c as Default,d as Disabled,u as InvalidDraft,l as Toolbar,f as __namedExportsOrder,s as default};