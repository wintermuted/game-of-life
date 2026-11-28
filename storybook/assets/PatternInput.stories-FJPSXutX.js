import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{O as t,t as n}from"./src-GjPaoCTy.js";var r,i,a,o,s,c,l,u,d,f;function p(){return(p=e((()=>{n(),{expect:r,fn:i,userEvent:a,within:o}=__STORYBOOK_MODULE_TEST__,s={title:`Product/Compositions/Patterns/PatternInput`,component:t,parameters:{docs:{description:{component:`Starter/custom pattern workflow using central Tabs. Inactive forms are unmounted so drafts, validation and help reset. Simulation state, palettes, parsing and translations stay in the product.`}}},args:{onLoadPattern:i()}},c={},l={args:{disabled:!0}},u={globals:{locale:`es`}},d={play:async({canvasElement:e})=>{let t=o(e),n=t.getAllByRole(`tab`);n[0].focus(),await a.keyboard(`{ArrowRight}`),await r(n[1]).toHaveFocus(),await a.type(t.getByRole(`textbox`),`0 0`),n[1].focus(),await a.keyboard(`{Home}`),await r(t.queryByRole(`textbox`,{hidden:!0})).not.toBeInTheDocument(),await a.keyboard(`{End}`),await r(t.getByRole(`textbox`)).toHaveValue(``),await r(t.getByRole(`tabpanel`)).toHaveAttribute(`aria-labelledby`,n[1].id)}},f=[`StarterPatterns`,`RunningSimulation`,`Spanish`,`ResetCustomDraft`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  globals: {
    locale: 'es'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }): Promise<void> => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');
    tabs[0].focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(tabs[1]).toHaveFocus();
    await userEvent.type(canvas.getByRole('textbox'), '0 0');
    tabs[1].focus();
    await userEvent.keyboard('{Home}');
    await expect(canvas.queryByRole('textbox', {
      hidden: true
    })).not.toBeInTheDocument();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('textbox')).toHaveValue('');
    await expect(canvas.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', tabs[1].id);
  }
}`,...d.parameters?.docs?.source}}}})))()}p();export{d as ResetCustomDraft,l as RunningSimulation,u as Spanish,c as StarterPatterns,f as __namedExportsOrder,s as default};