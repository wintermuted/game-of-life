import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{i as t,t as n}from"./src-DAndWjPN.js";var r,i,a,o,s,c,l,u,d;function f(){return(f=e((()=>{n(),{expect:r,fn:i,userEvent:a,within:o}=__STORYBOOK_MODULE_TEST__,s={title:`Product/Compositions/Patterns/CatalogEmptyState`,component:t,parameters:{docs:{description:{component:`Product search empty-state composition with host-provided copy and reset action. It is not the upstream generic empty-state primitive.`}}},args:{title:`No matching patterns`,description:`Try a different search or clear your filters.`,actionLabel:`Clear filters`,onReset:i()}},c={},l={args:{description:`No patterns match the selected category, ruleset, author, and tags. Clear the filters to see the full catalog.`}},u={play:async({canvasElement:e,args:t})=>{await a.click(o(e).getByRole(`button`,{name:`Clear filters`})),await r(t.onReset).toHaveBeenCalledOnce()}},d=[`NoResults`,`LongMessage`,`ResetFilters`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'No patterns match the selected category, ruleset, author, and tags. Clear the filters to see the full catalog.'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', {
      name: 'Clear filters'
    }));
    await expect(args.onReset).toHaveBeenCalledOnce();
  }
}`,...u.parameters?.docs?.source}}}})))()}f();export{l as LongMessage,c as NoResults,u as ResetFilters,d as __namedExportsOrder,s as default};