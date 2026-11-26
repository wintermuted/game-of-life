import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{i as t,t as n}from"./src-cNwj7kRh.js";import{h as r}from"./iframe-DjyMUObC.js";var i,a,o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{n(),i=r(),{useArgs:a}=__STORYBOOK_MODULE_PREVIEW_API__,{expect:o,fn:s,userEvent:c,within:l}=__STORYBOOK_MODULE_TEST__,u={title:`Product/Compositions/Controls/SimulationSettingsPanel`,component:t,parameters:{docs:{description:{component:`Product composition of simulation overlay settings. Values and help-popover behavior are controlled by the host; this does not replace a generic checkbox primitive.`}}},args:{stabilityOverlayEnabled:!1,birthDeathPreviewEnabled:!1,onStabilityOverlayChange:s(),onBirthDeathPreviewChange:s(),onShowHelp:s(),onHideHelp:s()},render:function(e){let[,n]=a();return(0,i.jsx)(`div`,{className:`diagnostics-panel play-info-panel`,children:(0,i.jsx)(t,{...e,onStabilityOverlayChange:t=>{e.onStabilityOverlayChange(t),n({stabilityOverlayEnabled:t})},onBirthDeathPreviewChange:t=>{e.onBirthDeathPreviewChange(t),n({birthDeathPreviewEnabled:t})}})})}},d={},f={args:{stabilityOverlayEnabled:!0,birthDeathPreviewEnabled:!0}},p={globals:{locale:`es`}},m={play:async({canvasElement:e,args:t})=>{let n=l(e).getAllByRole(`checkbox`);await c.click(n[0]),await o(t.onStabilityOverlayChange).toHaveBeenCalledWith(!0),await o(n[0]).toBeChecked(),await o(n[1]).not.toBeChecked()}},h=[`DisabledOverlays`,`EnabledOverlays`,`Spanish`,`ToggleOverlays`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    stabilityOverlayEnabled: true,
    birthDeathPreviewEnabled: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  globals: {
    locale: 'es'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }): Promise<void> => {
    const toggles = within(canvasElement).getAllByRole('checkbox');
    await userEvent.click(toggles[0]);
    await expect(args.onStabilityOverlayChange).toHaveBeenCalledWith(true);
    await expect(toggles[0]).toBeChecked();
    await expect(toggles[1]).not.toBeChecked();
  }
}`,...m.parameters?.docs?.source}}}})))()}g();export{d as DisabledOverlays,f as EnabledOverlays,p as Spanish,m as ToggleOverlays,h as __namedExportsOrder,u as default};