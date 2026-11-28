import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{o as t,t as n}from"./src-B-GvCLvX.js";import{p as r}from"./iframe-B7bPdoaq.js";var i,a,o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{n(),i=r(),{useArgs:a}=__STORYBOOK_MODULE_PREVIEW_API__,{expect:o,fn:s,userEvent:c,within:l}=__STORYBOOK_MODULE_TEST__,u={title:`Product/Compositions/Controls/CellDataInspector`,component:t,parameters:{docs:{description:{component:`Product diagnostics composition for cell colors and coordinate actions. The host owns clipboard operations, copy-feedback timing, and viewport movement.`}}},args:{entries:[[`0,0`,`#22c55e`],[`1,0`,`#ef4444`]],copied:!1,onCopy:s(),onCoordinateSelect:s()},render:function(e){let[,n]=a();return(0,i.jsx)(`div`,{className:`diagnostics-panel`,children:(0,i.jsx)(t,{...e,onCopy:()=>{e.onCopy(),n({copied:!0})}})})}},d={},f={args:{entries:[]}},p={args:{copied:!0}},m={play:async({canvasElement:e,args:t})=>{let n=l(e);await c.click(n.getByRole(`button`,{name:`"0,0"`})),await o(t.onCoordinateSelect).toHaveBeenCalledWith(`0,0`),await c.click(n.getByRole(`button`,{name:`Copy`})),await o(n.getByRole(`button`,{name:`Copied!`})).toBeInTheDocument()}},h=[`Populated`,`Empty`,`Copied`,`CopyAndSelect`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    entries: []
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    copied: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: '"0,0"'
    }));
    await expect(args.onCoordinateSelect).toHaveBeenCalledWith('0,0');
    await userEvent.click(canvas.getByRole('button', {
      name: 'Copy'
    }));
    await expect(canvas.getByRole('button', {
      name: 'Copied!'
    })).toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source}}}})))()}g();export{p as Copied,m as CopyAndSelect,f as Empty,d as Populated,h as __namedExportsOrder,u as default};