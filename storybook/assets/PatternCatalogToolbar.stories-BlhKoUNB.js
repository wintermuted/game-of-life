import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{h as t}from"./iframe-C0zLdXOX.js";import{n,t as r}from"./src-B_N3enwu.js";var i,a,o,s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{r(),i=t(),{useArgs:a}=__STORYBOOK_MODULE_PREVIEW_API__,{expect:o,fn:s,userEvent:c,within:l}=__STORYBOOK_MODULE_TEST__,u={title:`Product/Compositions/Patterns/PatternCatalogToolbar`,component:n,parameters:{docs:{description:{component:`Product catalog toolbar combining canonical ToggleGroup, grouping, filters, and sorting. State and URL synchronization belong to the host; not a generic toolbar primitive.`}}},args:{viewMode:`cards`,groupMode:`none`,favoritesOnly:!1,forkedOnly:!1,sortField:`favorites`,sortDirection:`desc`,onViewModeChange:s(),onGroupModeChange:s(),onFavoritesOnlyChange:s(),onForkedOnlyChange:s(),onSortFieldChange:s(),onSortDirectionChange:s()},render:function(e){let[,t]=a();return(0,i.jsx)(n,{...e,onViewModeChange:n=>{e.onViewModeChange(n),t({viewMode:n})},onGroupModeChange:n=>{e.onGroupModeChange(n),t({groupMode:n})},onFavoritesOnlyChange:n=>{e.onFavoritesOnlyChange(n),t({favoritesOnly:n})},onForkedOnlyChange:n=>{e.onForkedOnlyChange(n),t({forkedOnly:n})},onSortFieldChange:n=>{e.onSortFieldChange(n),t({sortField:n})},onSortDirectionChange:n=>{e.onSortDirectionChange(n),t({sortDirection:n})}})}},d={},f={args:{viewMode:`table`,groupMode:`category`,sortField:`name`,sortDirection:`asc`}},p={args:{favoritesOnly:!0,forkedOnly:!0}},m={globals:{locale:`es`}},h={play:async({canvasElement:e,args:t})=>{let n=l(e);await c.click(n.getByRole(`button`,{name:`Favorites only`})),await o(t.onFavoritesOnlyChange).toHaveBeenCalledWith(!0),await o(n.getByRole(`button`,{name:`Favorites only`})).toHaveAttribute(`aria-pressed`,`true`)}},g=[`Default`,`GroupedTable`,`Filtered`,`Spanish`,`FilterInteraction`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    viewMode: 'table',
    groupMode: 'category',
    sortField: 'name',
    sortDirection: 'asc'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    favoritesOnly: true,
    forkedOnly: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  globals: {
    locale: 'es'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Favorites only'
    }));
    await expect(args.onFavoritesOnlyChange).toHaveBeenCalledWith(true);
    await expect(canvas.getByRole('button', {
      name: 'Favorites only'
    })).toHaveAttribute('aria-pressed', 'true');
  }
}`,...h.parameters?.docs?.source}}}})))()}_();export{d as Default,h as FilterInteraction,p as Filtered,f as GroupedTable,m as Spanish,g as __namedExportsOrder,u as default};