import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{g as t,t as n}from"./src-cNwj7kRh.js";import{h as r}from"./iframe-DjyMUObC.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{n(),i=r(),{useArgs:a}=__STORYBOOK_MODULE_PREVIEW_API__,{expect:o,fn:s,userEvent:c,waitFor:l,within:u}=__STORYBOOK_MODULE_TEST__,d={title:`Product/Controls/PlaybackControls`,component:t,args:{isEditMode:!1,isSystemPattern:!1,activeEditTool:`grab`,isGameRunning:!1,generationSpeed:5,onEditToolChange:s(),onEnterEditMode:s(),onEnterPlayMode:s(),toggleGame:s(),nextGeneration:s(),onResetRequested:s(),updateGenerationSpeed:s()},render:function(e){let[,n]=a();return(0,i.jsx)(`div`,{className:`grid-controls-form grid-controls-form-play`,children:(0,i.jsx)(t,{...e,toggleGame:()=>{e.toggleGame(),n({isGameRunning:!e.isGameRunning})},updateGenerationSpeed:t=>{e.updateGenerationSpeed(t),n({generationSpeed:t})},onEnterEditMode:()=>{e.onEnterEditMode?.(),n({isEditMode:!0})},onEnterPlayMode:()=>{e.onEnterPlayMode?.(),n({isEditMode:!1})}})})}},f={},p={args:{isGameRunning:!0}},m={args:{isEditMode:!0}},h={args:{generationSpeed:10}},g={play:async({canvasElement:e})=>{let t=u(e);await c.click(t.getByRole(`button`,{name:`Start`})),await l(async()=>{await o(t.getByRole(`button`,{name:`Pause`})).toBeInTheDocument()})}},_=[`Default`,`Running`,`EditMode`,`SpeedLimit`,`TogglePlayback`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    isGameRunning: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    isEditMode: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    generationSpeed: 10
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Start'
    }));
    await waitFor(async (): Promise<void> => {
      await expect(canvas.getByRole('button', {
        name: 'Pause'
      })).toBeInTheDocument();
    });
  }
}`,...g.parameters?.docs?.source}}}})))()}v();export{f as Default,m as EditMode,p as Running,h as SpeedLimit,g as TogglePlayback,_ as __namedExportsOrder,d as default};