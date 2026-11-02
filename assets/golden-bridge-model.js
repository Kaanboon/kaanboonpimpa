(function(root){
  const products=[{name:'ชุดจุดประกายบุญ',count:20,price:99},{name:'ชุดแสงประทีป',count:50,price:120},{name:'ชุดเติมบุญ เติมใจ',count:100,price:199},{name:'ชุดมหากุศล',count:200,price:399}];
  function totals(quantities,delivery){const qty=products.map((_,i)=>Math.max(0,Math.min(99,Math.floor(Number(quantities[i])||0))));const selected=qty.reduce((s,q)=>s+q,0),subtotal=qty.reduce((s,q,i)=>s+q*products[i].price,0),freeShipping=qty[2]>=5||qty[3]>=5,shipping=delivery==='shipping'&&selected>0&&!freeShipping?50:0;return {qty,selected,subtotal,shipping,total:subtotal+shipping,freeShipping,incense:qty.reduce((s,q,i)=>s+q*products[i].count,0),valid:selected>0&&selected<=99};}
  const api={products,totals};if(typeof module!=='undefined')module.exports=api;else root.GoldenBridgeModel=api;
})(typeof window!=='undefined'?window:this);
