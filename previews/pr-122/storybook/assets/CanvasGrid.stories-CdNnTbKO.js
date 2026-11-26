import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{b as n,h as r,n as i,y as a}from"./iframe-DjyMUObC.js";import{o,r as s}from"./createLucideIcon-C7jWNSS1.js";import{i as c,t as l}from"./src--DlYT3hA.js";var u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{s(),i(),l(),u=t(),d=r(),{useArgs:f}=__STORYBOOK_MODULE_PREVIEW_API__,{expect:p,fireEvent:m,fn:h,waitFor:g}=__STORYBOOK_MODULE_TEST__,_={title:`Product/Grid/CanvasGrid`,component:c,args:{grid:o,gridSize:20,cellSize:16,palette:n(a),isEditMode:!1,activeEditTool:`pencil`,onCellPaint:h(),onHoverCoordinateChange:h()},argTypes:{cellSize:{control:{type:`range`,min:4,max:32,step:2}},activeEditTool:{control:`select`,options:[`pencil`,`eraser`]}},render:function(e){let[,t]=f(),n=(0,u.useRef)(e.grid);return(0,u.useEffect)(()=>{n.current=e.grid},[e.grid]),(0,d.jsx)(`div`,{className:`storybook-grid`,children:(0,d.jsx)(c,{...e,onCellPaint:(r,i)=>{e.onCellPaint?.(r,i);let a={...n.current};i===null?delete a[r]:a[r]=i,n.current=a,t({grid:a})}})})}},v={},y={args:{grid:{}}},b={args:{isEditMode:!0},play:async({canvasElement:e,args:t})=>{let n=e.querySelector(`canvas`);if(!n)throw Error(`Editable grid canvas is missing.`);let r=n.getContext(`2d`);if(!r)throw Error(`Editable grid canvas context is unavailable.`);let i=t.cellSize+1,a=Math.floor(t.cellSize/2),o=t.activeDrawColor??`#22c55e`,s=[Number.parseInt(o.slice(1,3),16),Number.parseInt(o.slice(3,5),16),Number.parseInt(o.slice(5,7),16),255];await g(async()=>{await p(n.width).toBeGreaterThan(i*2)});let c=n.getBoundingClientRect(),l={clientX:c.left+a,clientY:c.top+a,button:0},u={...l,clientX:l.clientX+i};m.mouseDown(n,l),m.mouseMove(n,u),m.mouseUp(n,u),m.mouseOut(n,{relatedTarget:n.ownerDocument.body}),await g(async()=>{await p(Array.from(r.getImageData(a,a,1,1).data)).toStrictEqual(s),await p(Array.from(r.getImageData(a+i,a,1,1).data)).toStrictEqual(s)})}},x={globals:{theme:`dark`}},S=[`Default`,`Empty`,`Editable`,`Dark`],v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    grid: {}
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    isEditMode: true
  },
  play: async ({
    canvasElement,
    args
  }): Promise<void> => {
    const canvas = canvasElement.querySelector('canvas');
    if (!canvas) throw new Error('Editable grid canvas is missing.');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Editable grid canvas context is unavailable.');
    const stride = args.cellSize + 1;
    const inset = Math.floor(args.cellSize / 2);
    const color = args.activeDrawColor ?? DEFAULT_LIVE_CELL_COLOR;
    const expected = [Number.parseInt(color.slice(1, 3), 16), Number.parseInt(color.slice(3, 5), 16), Number.parseInt(color.slice(5, 7), 16), 255];
    await waitFor(async (): Promise<void> => {
      await expect(canvas.width).toBeGreaterThan(stride * 2);
    });
    const bounds = canvas.getBoundingClientRect();
    const firstCell = {
      clientX: bounds.left + inset,
      clientY: bounds.top + inset,
      button: 0
    };
    const secondCell = {
      ...firstCell,
      clientX: firstCell.clientX + stride
    };
    fireEvent.mouseDown(canvas, firstCell);
    fireEvent.mouseMove(canvas, secondCell);
    fireEvent.mouseUp(canvas, secondCell);
    fireEvent.mouseOut(canvas, {
      relatedTarget: canvas.ownerDocument.body
    });
    await waitFor(async (): Promise<void> => {
      await expect(Array.from(context.getImageData(inset, inset, 1, 1).data)).toStrictEqual(expected);
      await expect(Array.from(context.getImageData(inset + stride, inset, 1, 1).data)).toStrictEqual(expected);
    });
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  globals: {
    theme: 'dark'
  }
}`,...x.parameters?.docs?.source}}}})))()}C();export{x as Dark,v as Default,b as Editable,y as Empty,S as __namedExportsOrder,_ as default};