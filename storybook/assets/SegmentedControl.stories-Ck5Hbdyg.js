import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n,s as r}from"./iframe-B7bPdoaq.js";var i,a,o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{t(),i=n(),{useArgs:a}=__STORYBOOK_MODULE_PREVIEW_API__,{expect:o,fn:s,userEvent:c,waitFor:l,within:u}=__STORYBOOK_MODULE_TEST__,d={title:`Product/Primitives/SegmentedControl`,component:r,args:{ariaLabel:`Edit tool`,options:[{value:`pencil`,label:`Pencil`},{value:`eraser`,label:`Eraser`},{value:`stamp`,label:`Stamp`,disabled:!0}],selectedValue:`pencil`,onChange:s()},render:function(e){let[,t]=a();return(0,i.jsx)(r,{...e,onChange:n=>{e.onChange(n),t({selectedValue:n})}})}},f={},p={play:async({canvasElement:e})=>{let t=u(e);await c.click(t.getByRole(`button`,{name:`Eraser`})),await l(async()=>{await o(t.getByRole(`button`,{name:`Eraser`})).toHaveAttribute(`aria-pressed`,`true`)}),await o(t.getByRole(`button`,{name:`Stamp`})).toBeDisabled()}},m=[`Default`,`SelectTool`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Eraser'
    }));
    await waitFor(async (): Promise<void> => {
      await expect(canvas.getByRole('button', {
        name: 'Eraser'
      })).toHaveAttribute('aria-pressed', 'true');
    });
    await expect(canvas.getByRole('button', {
      name: 'Stamp'
    })).toBeDisabled();
  }
}`,...p.parameters?.docs?.source}}}})))()}h();export{f as Default,p as SelectTool,m as __namedExportsOrder,d as default};