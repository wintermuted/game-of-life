import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./src-B-GvCLvX.js";import{p as r}from"./iframe-B7bPdoaq.js";var i,a,o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{n(),i=r(),{useArgs:a}=__STORYBOOK_MODULE_PREVIEW_API__,{fn:o}=__STORYBOOK_MODULE_TEST__,s={title:`Product/Compositions/Controls/BoardHeader`,component:t,parameters:{docs:{description:{component:`Product board-header composition with title, provenance, unsaved status, popularity, and save menu. All persistence and social actions are callbacks; this is not a generic page header.`}}},args:{title:`My glider`,isEditMode:!1,isSystemPattern:!1,isUnsavedDraftBoard:!1,isUnsavedEditableBoard:!1,starred:!1,stars:2,forks:1,canSave:!0,onRename:o(),onSave:o(),onSaveDraft:o(),onToggleStar:o(),onViewForks:o()},render:function(e){let[,n]=a();return(0,i.jsx)(t,{...e,onToggleStar:()=>{e.onToggleStar(),n({starred:!e.starred,stars:e.stars+(e.starred?-1:1)})}})}},c={},l={args:{isEditMode:!0,isUnsavedDraftBoard:!0,isUnsavedEditableBoard:!0,title:`New board`}},u={args:{isSystemPattern:!0,title:`Glider`}},d={args:{forkOriginTitle:`Glider`}},f={args:{canSave:!1}},p={args:{title:`A colorful spaceship with a deliberately long descriptive board title`}},m=[`SavedBoard`,`UnsavedDraft`,`SystemPattern`,`ForkOrigin`,`CannotSave`,`LongTitle`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    isEditMode: true,
    isUnsavedDraftBoard: true,
    isUnsavedEditableBoard: true,
    title: 'New board'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    isSystemPattern: true,
    title: 'Glider'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    forkOriginTitle: 'Glider'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    canSave: false
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'A colorful spaceship with a deliberately long descriptive board title'
  }
}`,...p.parameters?.docs?.source}}}})))()}h();export{f as CannotSave,d as ForkOrigin,p as LongTitle,c as SavedBoard,u as SystemPattern,l as UnsavedDraft,m as __namedExportsOrder,s as default};