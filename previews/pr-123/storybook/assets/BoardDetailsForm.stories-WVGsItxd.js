import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t,u as n}from"./src-GjPaoCTy.js";import{p as r}from"./iframe-B7bPdoaq.js";var i,a,o,s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{t(),i=r(),{useArgs:a}=__STORYBOOK_MODULE_PREVIEW_API__,{expect:o,fn:s,userEvent:c,within:l}=__STORYBOOK_MODULE_TEST__,u={title:`Product/Forms/BoardDetailsForm`,component:n,parameters:{docs:{description:{component:`Full board metadata form: name, category, description, tags, and visibility. The host owns save/edit mode, the dialog title, and persistence.`}}},args:{values:{name:`My glider`,category:`Spaceships`,description:`A diagonal spaceship.`,tags:`small, moving`,visibility:`public`},categoryOptions:[`Spaceships`,`Oscillators`,`Still lifes`],onChange:s(),onSubmit:s(),onCancel:s()},render:function(e){let[,t]=a();return(0,i.jsx)(`div`,{className:`wm-modal-panel`,children:(0,i.jsx)(n,{...e,onChange:n=>{e.onChange(n),t({values:n})}})})}},d={},f={args:{values:{...u.args.values,visibility:`private`}}},p={args:{values:{...u.args.values,name:``,category:``}}},m={globals:{locale:`es`}},h={args:{values:{...u.args.values,name:``,category:``}},play:async({canvasElement:e,args:t})=>{let n=l(e),r=n.getByRole(`button`,{name:`Save board`});await o(r).toBeDisabled(),await c.type(n.getByRole(`textbox`,{name:`Pattern name`}),`New spaceship`),await c.selectOptions(n.getByRole(`combobox`),`Spaceships`),await o(r).toBeEnabled(),await c.click(r),await o(t.onSubmit).toHaveBeenCalledOnce()}},g=[`Public`,`Private`,`MissingRequiredFields`,`Spanish`,`CompleteAndSave`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    values: {
      ...meta.args.values,
      visibility: 'private'
    }
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    values: {
      ...meta.args.values,
      name: '',
      category: ''
    }
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  globals: {
    locale: 'es'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    values: {
      ...meta.args.values,
      name: '',
      category: ''
    }
  },
  play: async ({
    canvasElement,
    args
  }): Promise<void> => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole('button', {
      name: 'Save board'
    });
    await expect(save).toBeDisabled();
    await userEvent.type(canvas.getByRole('textbox', {
      name: 'Pattern name'
    }), 'New spaceship');
    await userEvent.selectOptions(canvas.getByRole('combobox'), 'Spaceships');
    await expect(save).toBeEnabled();
    await userEvent.click(save);
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  }
}`,...h.parameters?.docs?.source}}}})))()}_();export{h as CompleteAndSave,p as MissingRequiredFields,f as Private,d as Public,m as Spanish,g as __namedExportsOrder,u as default};