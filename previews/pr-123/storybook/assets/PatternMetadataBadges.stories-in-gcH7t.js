import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{g as t,t as n}from"./src-BFiYk4eZ.js";var r,i,a,o,s,c,l,u,d;function f(){return(f=e((()=>{n(),{expect:r,fn:i,userEvent:a,within:o}=__STORYBOOK_MODULE_TEST__,s={title:`Product/Patterns/PatternMetadataBadges`,component:t,parameters:{docs:{description:{component:`DEDUPLICATE-LATER: ExplorePatternTable keeps separate category, ruleset and tag cells.`}}},args:{category:`Spaceships`,rulesetId:`standard`,rulesetLabel:`Conway's Game of Life`,tags:[`moving`,`small`],onCategorySelect:i(),onRulesetSelect:i(),onTagSelect:i()}},c={},l={args:{tags:[]}},u={play:async({canvasElement:e,args:t})=>{await a.click(o(e).getByRole(`button`,{name:/moving/})),await r(t.onTagSelect).toHaveBeenCalledWith(`moving`)}},d=[`Default`,`NoTags`,`SelectTag`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tags: []
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', {
      name: /moving/
    }));
    await expect(args.onTagSelect).toHaveBeenCalledWith('moving');
  }
}`,...u.parameters?.docs?.source}}}})))()}f();export{c as Default,l as NoTags,u as SelectTag,d as __namedExportsOrder,s as default};