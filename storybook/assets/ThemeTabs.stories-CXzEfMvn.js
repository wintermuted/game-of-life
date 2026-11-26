import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{a as t,d as n,n as r}from"./iframe-xebjfsxN.js";var i,a,o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{r(),i=n(),{useArgs:a}=__STORYBOOK_MODULE_PREVIEW_API__,{expect:o,fn:s,userEvent:c,waitFor:l,within:u}=__STORYBOOK_MODULE_TEST__,d={title:`Product/Primitives/ThemeTabs`,component:t,args:{ariaLabel:`Pattern category`,options:[{value:`still`,label:`Still lifes`},{value:`oscillators`,label:`Oscillators`},{value:`spaceships`,label:`Spaceships`}],activeValue:`still`,onChange:s()},render:function(e){let[,n]=a();return(0,i.jsx)(t,{...e,onChange:t=>{e.onChange(t),n({activeValue:t})}})}},f={},p={play:async({canvasElement:e})=>{let t=u(e);await c.click(t.getByRole(`tab`,{name:`Oscillators`})),await l(async()=>{await o(t.getByRole(`tab`,{name:`Oscillators`})).toHaveAttribute(`aria-selected`,`true`)})}},m=[`Default`,`SelectCategory`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', {
      name: 'Oscillators'
    }));
    await waitFor(async (): Promise<void> => {
      await expect(canvas.getByRole('tab', {
        name: 'Oscillators'
      })).toHaveAttribute('aria-selected', 'true');
    });
  }
}`,...p.parameters?.docs?.source}}}})))()}h();export{f as Default,p as SelectCategory,m as __namedExportsOrder,d as default};