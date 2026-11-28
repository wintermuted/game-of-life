import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{b as t,g as n,t as r,v as i}from"./src-GjPaoCTy.js";import{p as a}from"./iframe-B7bPdoaq.js";import{o,r as s}from"./createLucideIcon-C7jWNSS1.js";var c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{r(),s(),c=a(),{useArgs:l}=__STORYBOOK_MODULE_PREVIEW_API__,{expect:u,fn:d,userEvent:f,waitFor:p,within:m}=__STORYBOOK_MODULE_TEST__,h={title:`Product/Patterns/PatternCard`,component:t,parameters:{docs:{description:{component:`DEDUPLICATE-LATER: ProfileBoardSection retains its profile card. Routing and recent-board tracking belong to app adapters.`}}},args:{name:`Glider`,grid:o,href:`#glider`,favorite:!1,favoriteCount:12,forkCount:3,onOpen:d(),onFork:d(),onFavorite:d()},render:function(e){let[,r]=l();return(0,c.jsx)(t,{...e,sourceBadge:(0,c.jsx)(i,{source:`system`}),metadata:(0,c.jsx)(n,{category:`Spaceships`,rulesetId:`standard`,rulesetLabel:`Conway's Game of Life`,tags:[`moving`],onCategorySelect:d(),onRulesetSelect:d(),onTagSelect:d()}),onFavorite:()=>{e.onFavorite(),r({favorite:!e.favorite,favoriteCount:e.favoriteCount+(e.favorite?-1:1)})}})}},g={},_={args:{favorite:!0}},v={args:{name:`A long descriptive pattern title for a community-created spaceship`}},y={play:async({canvasElement:e})=>{let t=m(e).getAllByRole(`button`).find(e=>e.classList.contains(`explore-favorite-btn`));if(!t)throw Error(`Favorite button is missing.`);await f.click(t),await p(async()=>{await u(t).toHaveTextContent(`13`),await u(t.querySelector(`svg`)).toHaveAttribute(`fill`,`currentColor`)})}},b=[`Default`,`Favorited`,`LongTitle`,`ToggleFavorite`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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