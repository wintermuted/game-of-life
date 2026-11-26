import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{h as t,n,r}from"./iframe-DjyMUObC.js";var i,a,o,s,c,l,u,d,f;function p(){return(p=e((()=>{n(),i=t(),{expect:a,userEvent:o,within:s}=__STORYBOOK_MODULE_TEST__,c={title:`Product/Primitives/DisclosureSection`,component:r,parameters:{docs:{description:{component:`Native disclosure shell extracted from the diagnostics and information panels. Content and optional header actions are supplied by the host. No dialog, menu, or persistence infrastructure is introduced.`}}},args:{title:`Statistics`,children:(0,i.jsx)(`p`,{children:`Generation 42; 5 live cells.`}),defaultOpen:!0},argTypes:{children:{control:!1},headerAction:{control:!1}},render:e=>(0,i.jsx)(`div`,{className:`diagnostics-panel`,children:(0,i.jsx)(r,{...e})})},l={},u={args:{defaultOpen:!1}},d={args:{title:`Rules`,headerAction:(0,i.jsx)(`button`,{className:`btn btn-sm btn-secondary-neutral`,type:`button`,onClick:e=>{e.preventDefault(),e.stopPropagation()},children:`Lock rules`})},play:async({canvasElement:e})=>{await o.click(s(e).getByRole(`button`,{name:`Lock rules`})),await a(e.querySelector(`details`)).toHaveAttribute(`open`)}},f=[`Expanded`,`Collapsed`,`HeaderAction`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: false
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Rules',
    headerAction: <button className="btn btn-sm btn-secondary-neutral" type="button" onClick={event => {
      event.preventDefault();
      event.stopPropagation();
    }}>
        Lock rules
      </button>
  },
  play: async ({
    canvasElement
  }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', {
      name: 'Lock rules'
    }));
    await expect(canvasElement.querySelector('details')).toHaveAttribute('open');
  }
}`,...d.parameters?.docs?.source}}}})))()}p();export{u as Collapsed,l as Expanded,d as HeaderAction,f as __namedExportsOrder,c as default};