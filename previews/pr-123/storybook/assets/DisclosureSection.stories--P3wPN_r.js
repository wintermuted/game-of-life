import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n,r}from"./iframe-B7bPdoaq.js";var i,a,o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{t(),i=n(),{expect:a,userEvent:o,within:s}=__STORYBOOK_MODULE_TEST__,c={title:`Product/Compositions/Playground/DisclosureSection`,component:r,parameters:{docs:{description:{component:`Playground layout around the central Accordion. The sibling Rules lock action preserves native disabled and keyboard behavior without toggling or expanding the disclosure. Generic Accordion documentation lives in Wintermuted UI.`}}},args:{title:`Statistics`,children:(0,i.jsx)(`p`,{children:`Generation 42; 5 live cells.`}),defaultOpen:!0},argTypes:{children:{control:!1},headerAction:{control:!1}},render:e=>(0,i.jsx)(`div`,{className:`diagnostics-panel`,children:(0,i.jsx)(r,{...e})})},l={},u={args:{defaultOpen:!1}},d={args:{title:`Rules`,headerAction:(0,i.jsx)(`button`,{className:`btn btn-sm btn-secondary-neutral`,type:`button`,children:`Lock rules`})},play:async({canvasElement:e})=>{let t=s(e),n=t.getByRole(`button`,{name:`Lock rules`}),r=e.querySelector(`details`);n.focus(),await o.keyboard(`{Enter}`),await a(n).toHaveFocus(),await a(r).toHaveAttribute(`open`),await o.click(t.getByRole(`heading`,{name:`Rules`})),await a(r).not.toHaveAttribute(`open`),await o.click(n),await a(r).not.toHaveAttribute(`open`),e.querySelector(`summary`)?.focus(),await a(e.querySelector(`summary`)).toHaveFocus(),await o.click(t.getByRole(`heading`,{name:`Rules`})),await a(r).toHaveAttribute(`open`)}},f={args:{title:`Rules`,defaultOpen:!1,headerAction:(0,i.jsx)(`button`,{type:`button`,disabled:!0,children:`Lock rules`})},play:async({canvasElement:e})=>{let t=s(e);await a(t.getByRole(`button`,{name:`Lock rules`})).toBeDisabled(),e.querySelector(`summary`)?.focus(),await a(e.querySelector(`summary`)).toHaveFocus(),await o.click(t.getByRole(`heading`,{name:`Rules`})),await a(e.querySelector(`details`)).toHaveAttribute(`open`)}},p={args:{title:`Rules`,headerAction:(0,i.jsx)(`button`,{type:`button`,children:`Lock rules`}),children:(0,i.jsx)(`input`,{"aria-label":`Rule draft`,defaultValue:`draft`})},play:async({canvasElement:e})=>{let t=s(e);e.querySelector(`summary`)?.focus(),await o.tab(),await a(t.getByRole(`button`,{name:`Lock rules`})).toHaveFocus(),await o.tab(),await a(t.getByRole(`textbox`,{name:`Rule draft`})).toHaveFocus(),await o.tab({shift:!0}),await a(t.getByRole(`button`,{name:`Lock rules`})).toHaveFocus(),await o.click(t.getByRole(`heading`,{name:`Rules`})),await a(t.queryByRole(`textbox`)).not.toBeInTheDocument(),e.querySelector(`summary`)?.focus(),await o.tab(),await a(t.getByRole(`button`,{name:`Lock rules`})).toHaveFocus()}},m=[`Expanded`,`Collapsed`,`HeaderAction`,`UnsavedBoard`,`HeaderFocusOrder`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: false
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Rules',
    headerAction: <button className="btn btn-sm btn-secondary-neutral" type="button">
        Lock rules
      </button>
  },
  play: async ({
    canvasElement
  }): Promise<void> => {
    const canvas = within(canvasElement);
    const action = canvas.getByRole('button', {
      name: 'Lock rules'
    });
    const disclosure = canvasElement.querySelector('details');
    action.focus();
    await userEvent.keyboard('{Enter}');
    await expect(action).toHaveFocus();
    await expect(disclosure).toHaveAttribute('open');
    await userEvent.click(canvas.getByRole('heading', {
      name: 'Rules'
    }));
    await expect(disclosure).not.toHaveAttribute('open');
    await userEvent.click(action);
    await expect(disclosure).not.toHaveAttribute('open');
    canvasElement.querySelector('summary')?.focus();
    await expect(canvasElement.querySelector('summary')).toHaveFocus();
    await userEvent.click(canvas.getByRole('heading', {
      name: 'Rules'
    }));
    await expect(disclosure).toHaveAttribute('open');
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Rules',
    defaultOpen: false,
    headerAction: <button type="button" disabled>
        Lock rules
      </button>
  },
  play: async ({
    canvasElement
  }): Promise<void> => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', {
      name: 'Lock rules'
    })).toBeDisabled();
    canvasElement.querySelector('summary')?.focus();
    await expect(canvasElement.querySelector('summary')).toHaveFocus();
    await userEvent.click(canvas.getByRole('heading', {
      name: 'Rules'
    }));
    await expect(canvasElement.querySelector('details')).toHaveAttribute('open');
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Rules',
    headerAction: <button type="button">Lock rules</button>,
    children: <input aria-label="Rule draft" defaultValue="draft" />
  },
  play: async ({
    canvasElement
  }): Promise<void> => {
    const canvas = within(canvasElement);
    canvasElement.querySelector('summary')?.focus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', {
      name: 'Lock rules'
    })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('textbox', {
      name: 'Rule draft'
    })).toHaveFocus();
    await userEvent.tab({
      shift: true
    });
    await expect(canvas.getByRole('button', {
      name: 'Lock rules'
    })).toHaveFocus();
    await userEvent.click(canvas.getByRole('heading', {
      name: 'Rules'
    }));
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    canvasElement.querySelector('summary')?.focus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', {
      name: 'Lock rules'
    })).toHaveFocus();
  }
}`,...p.parameters?.docs?.source}}}})))()}h();export{u as Collapsed,l as Expanded,d as HeaderAction,p as HeaderFocusOrder,f as UnsavedBoard,m as __namedExportsOrder,c as default};