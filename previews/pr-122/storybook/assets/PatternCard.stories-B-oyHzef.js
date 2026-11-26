import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{h as t}from"./iframe-C0zLdXOX.js";import{o as n,r}from"./createLucideIcon-C7jWNSS1.js";import{b as i,g as a,t as o,v as s}from"./src-B_N3enwu.js";var c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{o(),r(),c=t(),{useArgs:l}=__STORYBOOK_MODULE_PREVIEW_API__,{expect:u,fn:d,userEvent:f,waitFor:p,within:m}=__STORYBOOK_MODULE_TEST__,h={title:`Product/Patterns/PatternCard`,component:i,parameters:{docs:{description:{component:`DEDUPLICATE-LATER: ProfileBoardSection retains its profile card. Routing and recent-board tracking belong to app adapters.`}}},args:{name:`Glider`,grid:n,href:`#glider`,favorite:!1,favoriteCount:12,forkCount:3,onOpen:d(),onFork:d(),onFavorite:d()},render:function(e){let[,t]=l();return(0,c.jsx)(i,{...e,sourceBadge:(0,c.jsx)(s,{source:`system`}),metadata:(0,c.jsx)(a,{category:`Spaceships`,rulesetId:`standard`,rulesetLabel:`Conway's Game of Life`,tags:[`moving`],onCategorySelect:d(),onRulesetSelect:d(),onTagSelect:d()}),onFavorite:()=>{e.onFavorite(),t({favorite:!e.favorite,favoriteCount:e.favoriteCount+(e.favorite?-1:1)})}})}},g={},_={args:{favorite:!0}},v={args:{name:`A long descriptive pattern title for a community-created spaceship`}},y={play:async({canvasElement:e})=>{let t=m(e).getAllByRole(`button`).find(e=>e.classList.contains(`explore-favorite-btn`));if(!t)throw Error(`Favorite button is missing.`);await f.click(t),await p(async()=>{await u(t).toHaveTextContent(`13`),await u(t.querySelector(`svg`)).toHaveAttribute(`fill`,`currentColor`)})}},b=[`Default`,`Favorited`,`LongTitle`,`ToggleFavorite`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    favorite: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'A long descriptive pattern title for a community-created spaceship'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }): Promise<void> => {
    const canvas = within(canvasElement);
    const favoriteButton = canvas.getAllByRole('button').find(button => button.classList.contains('explore-favorite-btn'));
    if (!favoriteButton) throw new Error('Favorite button is missing.');
    await userEvent.click(favoriteButton);
    await waitFor(async (): Promise<void> => {
      await expect(favoriteButton).toHaveTextContent('13');
      await expect(favoriteButton.querySelector('svg')).toHaveAttribute('fill', 'currentColor');
    });
  }
}`,...y.parameters?.docs?.source}}}})))()}x();export{g as Default,_ as Favorited,v as LongTitle,y as ToggleFavorite,b as __namedExportsOrder,h as default};