/* Book and base theme templates expose duplicate toggles; the theme binds only the first. */
document.addEventListener('DOMContentLoaded',()=>{
  for(const [kind,breakpoint,label] of [['primary',992,'章节目录'],['secondary',1200,'当前页目录']]){
    const buttons=[...document.querySelectorAll(`.${kind}-toggle`)];
    const original=buttons[0],dialog=document.getElementById(`pst-${kind}-sidebar-modal`),sidebar=document.getElementById(`pst-${kind}-sidebar`);
    if(!original||!dialog||!sidebar)return;
    const desktop=matchMedia(`(min-width: ${breakpoint}px)`);
    const sync=()=>buttons.forEach(b=>b.setAttribute('aria-expanded',String(desktop.matches?!sidebar.classList.contains('pst-sidebar-hidden'):dialog.open)));
    buttons.forEach(b=>{b.setAttribute('aria-label',`打开或关闭${label}`);b.setAttribute('aria-controls',dialog.id);});
    for(const b of buttons.slice(1))b.addEventListener('click',event=>{
      event.preventDefault();event.stopImmediatePropagation();
      if(dialog.open){dialog.close();return;}
      if(!desktop.matches){b.focus({preventScroll:true});dialog.addEventListener('close',()=>b.focus({preventScroll:true}),{once:true});}
      original.click();sync();
    },true);
    const close=document.createElement('button');close.type='button';close.className='ff-sidebar-close';close.textContent=`关闭${label} ×`;close.addEventListener('click',()=>dialog.close());dialog.prepend(close);
    new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']});
    new MutationObserver(sync).observe(sidebar,{attributes:true,attributeFilter:['class']});
    desktop.addEventListener('change',()=>{if(desktop.matches&&dialog.open)dialog.close();sync();});sync();
  }
});
