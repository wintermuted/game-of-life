import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{h as t}from"./iframe-DjyMUObC.js";import{f as n,t as r}from"./src-DAndWjPN.js";var i,a,o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{r(),i=t(),{useArgs:a}=__STORYBOOK_MODULE_PREVIEW_API__,{expect:o,fn:s,userEvent:c,within:l}=__STORYBOOK_MODULE_TEST__,u={title:`Product/Forms/BoardNameForm`,component:n,parameters:{docs:{description:{component:`Full product form for renaming or forking a board. The host owns its modal, submission, and persistence; this is not an input primitive.`}}},args:{name:`Glider`,mode:`rename`,onNameChange:s(),onSubmit:s(),onCancel:s()},render:function(e){let[,t]=a();return(0,i.jsx)(`div`,{className:`wm-modal-panel`,children:(0,i.jsx)(n,{...e,onNameChange:n=>{e.onNameChange(n),t({name:n})}})})}},d={},f={args:{mode:`fork`,name:`Glider (fork)`}},p={globals:{locale:`es`}},m={play:async({canvasElement:e,args:t})=>{let n=l(e).getByRole(`textbox`);await c.clear(n),await c.type(n,`My glider{Enter}`),await o(t.onSubmit).toHaveBeenCalledOnce()}},h=[`Rename`,`Fork`,`Spanish`,`SubmitWithEnter`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    mode: 'fork',
    name: 'Glider (fork)'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  globals: {
    locale: 'es'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }): Promise<void> => {
    const input = within(canvasElement).getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'My glider{Enter}');
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  }
}`,...m.parameters?.docs?.source}}}})))()}g();export{f as Fork,d as Rename,p as Spanish,m as SubmitWithEnter,h as __namedExportsOrder,u as default};