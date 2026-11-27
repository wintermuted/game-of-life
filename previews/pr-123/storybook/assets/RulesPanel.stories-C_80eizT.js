import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t,u as n}from"./src-gno_q4C6.js";import{_ as r,g as i,p as a}from"./iframe-M66TVkiV.js";import{d as o,f as s,p as c,r as l}from"./createLucideIcon-C7jWNSS1.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{l(),t(),i(),u=a(),{useArgs:d}=__STORYBOOK_MODULE_PREVIEW_API__,{expect:f,fn:p,userEvent:m,waitFor:h,within:g}=__STORYBOOK_MODULE_TEST__,_={title:`Product/Controls/RulesPanel`,component:n,args:{rules:o,selectedRulesetId:c.id,activeRulesetClassification:c.classification,disabled:!1,embedded:!1,rulesLocked:!1,onRulesChange:p(),onRulesetChange:p()},render:function(e){let[,t]=d(),{t:i}=r();return(0,u.jsx)(n,{...e,activeRulesetClassification:e.selectedRulesetId===`custom`?i(`diagnostics.rulesetCustomClassification`):e.activeRulesetClassification,onRulesChange:n=>{e.onRulesChange(n),t({rules:n,selectedRulesetId:`custom`,activeRulesetClassification:i(`diagnostics.rulesetCustomClassification`)})},onRulesetChange:n=>{e.onRulesetChange?.(n);let r=s.find(e=>e.id===n);r&&t({selectedRulesetId:n,rules:r.rules,activeRulesetClassification:r.classification})}})}},v={},y={args:{disabled:!0}},b={args:{rulesLocked:!0}},x={args:{embedded:!0}},S={globals:{locale:`es`}},C={args:{selectedRulesetId:`custom`,rules:{...o,survival2:{...o.survival2,enabled:!1}}},play:async({canvasElement:e})=>{let t=g(e);await m.click(t.getByRole(`checkbox`,{name:/Underpopulation/})),await h(async()=>{await f(t.getByRole(`combobox`)).toHaveValue(`custom`),await f(t.getByRole(`heading`,{name:/\((Custom|Personalizado)\)$/})).toBeInTheDocument()})}},w=[`Default`,`Disabled`,`Locked`,`Embedded`,`Spanish`,`Custom`],v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    rulesLocked: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    embedded: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  globals: {
    locale: 'es'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    selectedRulesetId: 'custom',
    rules: {
      ...DEFAULT_RULES,
      survival2: {
        ...DEFAULT_RULES.survival2,
        enabled: false
      }
    }
  },
  play: async ({
    canvasElement
  }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', {
      name: /Underpopulation/
    }));
    await waitFor(async (): Promise<void> => {
      await expect(canvas.getByRole('combobox')).toHaveValue('custom');
      await expect(canvas.getByRole('heading', {
        name: /\\((Custom|Personalizado)\\)$/
      })).toBeInTheDocument();
    });
  }
}`,...C.parameters?.docs?.source}}}})))()}T();export{C as Custom,v as Default,y as Disabled,x as Embedded,b as Locked,S as Spanish,w as __namedExportsOrder,_ as default};