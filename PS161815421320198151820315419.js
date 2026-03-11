(function(){document.addEventListener("DOMContentLoaded",function(){let container=document.querySelector("#LayraHeroSection #LayraHeaderSlider .widget-content");if(!container)return;let content=container.innerHTML;let regex=/\[LayraSlider\/(.*?)\/(\d+)\]/g;container.innerHTML=content.replace(regex,function(match,type,number){let sliderId="LayraHeaderSlider_"+Math.random().toString(36).substr(2,9);let wrapperId="wrapper_"+sliderId;buildSlider(sliderId,wrapperId,type,parseInt(number));return `
                <div class="LayraHeaderSliderWrapper" id="${wrapperId}">
                  <div class="swiper" id="${sliderId}">
                    <div class="swiper-wrapper"></div>
                  </div>
                  <div class="swiper-pagination"></div>
                  <div class="swiper-button-next"></div>
                  <div class="swiper-button-prev"></div>
                </div>`})});function extractPricesFromBody(htmlContent){let oldPrice="",currentPrice="";const oldMatch=htmlContent.match(/\[old-price="([^"]*)"\]/i);const currentMatch=htmlContent.match(/\[current-price="([^"]*)"\]/i);if(oldMatch)oldPrice=oldMatch[1].trim();if(currentMatch)currentPrice=currentMatch[1].trim();return{oldPrice,currentPrice}}
function formatPriceDisplay(raw,currency){let cleaned=raw.replace(/[^\d.,]/g,"");let number=parseFloat(cleaned.replace(/,/g,""));if(isNaN(number))return currency+" "+cleaned;return currency+" "+number.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:2,})}
function formatPriceNumber(raw){let cleaned=raw.replace(/[^\d.,]/g,"");let number=parseFloat(cleaned.replace(/,/g,""));return isNaN(number)?"":number}
function buildSlider(sliderId,wrapperId,type,number){let blogUrl=window.location.origin;let feedUrl;if(type.toLowerCase()==="recent"){feedUrl=blogUrl+"/feeds/posts/default?alt=json&max-results="+number}else if(type.toLowerCase()==="random"){feedUrl=blogUrl+"/feeds/posts/default?alt=json&max-results=50"}else{feedUrl=blogUrl+"/feeds/posts/default/-/"+encodeURIComponent(type)+"?alt=json&max-results="+number}
fetch(feedUrl).then((res)=>res.json()).then((data)=>{let entries=data.feed.entry||[];if(type.toLowerCase()==="random"){entries=entries.sort(()=>0.5-Math.random()).slice(0,number)}
let currencyDiv=document.querySelector("div.priceCurrency");let currentCurrency=currencyDiv?currencyDiv.textContent.trim():"Rs";let currencyISO="PKR";let slidesHTML="";entries.forEach((entry)=>{let title=entry.title.$t;let link=entry.link.find((l)=>l.rel==="alternate").href;let label=entry.category&&entry.category.length>0?entry.category[0].term:"";let img="https://via.placeholder.com/800x450?text=No+Image";if(entry.content&&entry.content.$t){const tempDiv=document.createElement("div");tempDiv.innerHTML=entry.content.$t;const firstImg=tempDiv.querySelector("img");if(firstImg){img=firstImg.src.replace(/\/w\d+-h\d+\//,"/s0/").replace(/\/s\d+(-c)?\//,"/s0/")}}
let{oldPrice,currentPrice}=extractPricesFromBody(entry.content?.$t||"");let displayOldPrice=oldPrice?formatPriceDisplay(oldPrice,currentCurrency):"";let displayCurrentPrice=currentPrice?formatPriceDisplay(currentPrice,currentCurrency):"";let priceNumber=currentPrice?formatPriceNumber(currentPrice):null;let priceHTML="";if(oldPrice||currentPrice){priceHTML=`
                            ${oldPrice ? `<span class="old-price">${displayOldPrice}</span>` : ""}
                            ${currentPrice
                                ? `<span class="current-price">${displayCurrentPrice}</span><meta itemprop="price" content="${priceNumber}"/>`
                                : ""
                            }
                            <meta itemprop="priceCurrency" content="${currencyISO}"/>
                        `}
slidesHTML+=`
                        <div class="swiper-slide" itemscope itemtype="http://schema.org/Product">
                            <div class="slider-left">
                                ${label ? `<h1 itemprop="category">${label}</h1>` : ""}
                                <h2 itemprop="name">${title}</h2>
                                <div class="price-wrap" itemprop="offers" itemscope itemtype="http://schema.org/Offer">
                                    ${priceHTML}
                                </div>
                                <a class="view-btn" href="${link}" >View Product</a>
                            </div>
                           <div class="slider-right">
                              <img src="${img}" alt="${title}" itemprop="image" fetchpriority="high" loading="eager">
                           </div>
                        </div>
                    `});document.querySelector("#"+sliderId+" .swiper-wrapper").innerHTML=slidesHTML;new Swiper("#"+sliderId,{slidesPerView:1,spaceBetween:30,loop:!0,pagination:{el:"#"+wrapperId+" .swiper-pagination",clickable:!0,},navigation:{nextEl:"#"+wrapperId+" .swiper-button-next",prevEl:"#"+wrapperId+" .swiper-button-prev",},})}).catch(()=>{document.querySelector("#"+sliderId).innerHTML="<p>Could not load slider posts.</p>"})}})();(function(){"use strict";document.addEventListener("DOMContentLoaded",function(){const container=document.querySelector("#LayraPostList #Layra-post-list-widget .widget-content");if(!container)return;const content=container.innerHTML;const regex=/\[LayraPostList\/([^\/]+)(?:\/(\d+))?\]/gi;const tasks=[];container.innerHTML=content.replace(regex,function(match,type,num){const sliderId="LayraPostList_"+Math.random().toString(36).slice(2,9);const limit=num?Math.max(1,Math.min(50,parseInt(num,10))):5;tasks.push({sliderId,type,limit});return `
            <div class="Layra-post-list-slider-container" itemscope itemtype="http://schema.org/ItemList">
                <div class="swiper" id="${sliderId}">
                    <div class="swiper-wrapper"></div>
                    <div class="swiper-button-prev"></div>
                    <div class="swiper-button-next"></div>
                    <div class="swiper-pagination"></div>
                </div>
            </div>`});tasks.forEach((t)=>buildLayraPostListSlider(t.sliderId,t.type,t.limit))});function getImageFromEntry(entry){try{const content=entry.content?.$t||"";const temp=document.createElement("div");temp.innerHTML=content;const img=temp.querySelector("img");if(img){return img.src.replace(/\/s\d+(-c)?\//,"/s0/")}
if(entry.media$thumbnail?.url){return entry.media$thumbnail.url.replace(/\/s\d+(-c)?\//,"/s0/")}}catch(e){}
return"https://via.placeholder.com/300x200?text=No+Image"}
function extractPricesFromContent(content){return{oldPrice:content.match(/\[old-price="(.*?)"\]/i)?.[1]||"",currentPrice:content.match(/\[current-price="(.*?)"\]/i)?.[1]||""}}
function getCurrentCurrencySymbol(){return document.querySelector(".priceCurrency")?.textContent.trim()||""}
function formatPrice(price){return price.replace(/[^\d.,]/g,"").replace(/\B(?=(\d{3})+(?!\d))/g,",")}
async function buildLayraPostListSlider(sliderId,type,limit){const target=document.getElementById(sliderId);if(!target)return;const origin=location.origin;const t=type.toLowerCase();let feedUrl;if(t==="recent"){feedUrl=`${origin}/feeds/posts/default?alt=json&max-results=${limit}`}else if(t==="random"){feedUrl=`${origin}/feeds/posts/default?alt=json&max-results=200`}else{feedUrl=`${origin}/feeds/posts/default/-/${encodeURIComponent(type)}?alt=json&max-results=${limit}`}
try{const res=await fetch(feedUrl);const data=await res.json();let entries=data.feed?.entry||[];if(t==="random"){entries=entries.sort(()=>0.5-Math.random()).slice(0,limit)}else{entries=entries.slice(0,limit)}
const currency=getCurrentCurrencySymbol();target.querySelector(".swiper-wrapper").innerHTML=entries.map(entry=>{const title=entry.title?.$t||"Untitled";const link=entry.link?.find(l=>l.rel==="alternate")?.href||"#";const img=getImageFromEntry(entry);const{oldPrice,currentPrice}=extractPricesFromContent(entry.content?.$t||"");const priceHTML=currentPrice?`<span class="pl-current-price">${currency} ${formatPrice(currentPrice)}</span>`:"";return `
                <div class="swiper-slide Layra-post-list-item" itemprop="itemListElement" itemscope itemtype="http://schema.org/Article">
                    <a href="${link}" itemprop="url">
                        <div class="Layra-post-list-img">
                            <img src="${img}" alt="${title}">
                        </div>
                        <div class="Layra-post-list-content">
                            <h3 class="pl-title" itemprop="name">${title}</h3>
                            ${priceHTML}
                        </div>
                    </a>
                </div>`}).join("");new Swiper("#"+sliderId,{slidesPerView:1,spaceBetween:30,loop:entries.length>1,navigation:{nextEl:"#"+sliderId+" .swiper-button-next",prevEl:"#"+sliderId+" .swiper-button-prev"},pagination:{el:"#"+sliderId+" .swiper-pagination",clickable:!0}})}catch(err){console.error("Layra Post List Error:",err)}}})();(function(){"use strict";const container=document.querySelector("#LayraFeacturedPost .widget-content");if(!container)return;const text=container.textContent.trim();const match=text.match(/\[LayraFeactured\/([^\]]+)\]/i);if(!match)return;const param=match[1].trim();container.innerHTML=`
    <div class="product-grid">
        <div class="left-column">
            <div class="product-box" id="box1"></div>
        </div>
        <div class="right-column">
            <div class="product-box" id="box2"></div>
            <div class="product-box" id="box3"></div>
        </div>
    </div>
    `;const boxes=["box1","box2","box3"].map(id=>document.getElementById(id));function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function extractFromContent(content,attr){const regex=new RegExp(`\\[${attr}="(.*?)"\\]`,"i");const m=content.match(regex);return m?m[1]:""}
function convertUrlToS0(url){if(!url)return url;return url.replace(/\/s\d+(-c)?\//,"/s0/").replace(/\/w\d+-h\d+\//,"/s0/")}
function getPostImage(entry){try{const temp=document.createElement("div");temp.innerHTML=entry.content?.$t||"";const img=temp.querySelector("img");if(img&&img.src)return convertUrlToS0(img.src);if(entry.media$thumbnail?.url)return convertUrlToS0(entry.media$thumbnail.url);}catch{}
return"https://via.placeholder.com/800x600?text=No+Image"}
function formatPriceDisplay(raw){if(!raw)return"";let clean=String(raw).replace(/[^\d.,]/g,"");let parts=clean.split(".");parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,",");return parts.join(".")}
function formatPriceNumber(raw){if(!raw)return"";return String(raw).replace(/[^\d.]/g,"")}
async function fetchPosts(label){const site=window.location.origin;let url=`${site}/feeds/posts/default/-/${encodeURIComponent(label)}?alt=json&max-results=3`;if(label.toLowerCase()==="recent"){url=`${site}/feeds/posts/default?alt=json&max-results=3`}
if(label.toLowerCase()==="random"){url=`${site}/feeds/posts/default?alt=json&max-results=10`}
try{const res=await fetch(url);const data=await res.json();return data.feed?.entry||[]}catch(e){console.error("LayraFeacturedPost fetch error:",e);return[]}}
fetchPosts(param).then(posts=>{posts=posts.slice(0,3);const currencyDiv=document.querySelector("div.priceCurrency");const currencySymbolRaw=currencyDiv?currencyDiv.textContent.trim():"Rs";const currencySymbolForDisplay=currencySymbolRaw+" ";const currencyCode="PKR";boxes.forEach((box,i)=>{const post=posts[i];if(!post){box.setAttribute("hidden","");return}
const content=post.content?.$t||"";const title=post.title?.$t||"";const link=post.link?.find(l=>l.rel==="alternate")?.href||"#";const image=getPostImage(post);const oldPriceRaw=extractFromContent(content,"old-price");const currentPriceRaw=extractFromContent(content,"current-price");const oldPriceDisplay=oldPriceRaw?formatPriceDisplay(oldPriceRaw):"";const currentPriceDisplay=currentPriceRaw?formatPriceDisplay(currentPriceRaw):"";const currentPriceNumber=currentPriceRaw?formatPriceNumber(currentPriceRaw):"";let priceHTML="";if(oldPriceRaw||currentPriceRaw){priceHTML=`<div class="price" itemprop="offers" itemscope itemtype="http://schema.org/Offer">`;if(oldPriceDisplay){priceHTML+=`<span class="old-price">${escapeHtml(currencySymbolForDisplay)}${escapeHtml(oldPriceDisplay)}</span>`}
if(currentPriceDisplay){priceHTML+=`<span class="current-price">${escapeHtml(currencySymbolForDisplay)}${escapeHtml(currentPriceDisplay)}</span>`;priceHTML+=`<meta itemprop="price" content="${escapeHtml(currentPriceNumber)}">`}
priceHTML+=`<meta itemprop="priceCurrency" content="PKR"></div>`}
const postLabel=Array.isArray(post.category)?post.category[0]?.term:"";const labelHTML=postLabel?`<div class="label">${escapeHtml(postLabel)}</div>`:"";box.innerHTML=`
            <div itemscope itemtype="http://schema.org/Product">
                <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" itemprop="image">
                ${labelHTML}
                <div class="product-content">
                    <h3 class="title" itemprop="name">${escapeHtml(title)}</h3>
                    ${priceHTML}
                    <a class="view-product-btn" href="${escapeHtml(link)}" rel="noopener" itemprop="url">
                        View Product
                    </a>
                </div>
            </div>
            `})}).catch(e=>{console.error("LayraFeacturedPost error:",e);container.innerHTML=`<div class="fp-empty">Could not load featured posts.</div>`})})();(function(){"use strict";function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function convertUrlToS0(url){if(!url)return url;return url.replace(/\/s\d+(-c)?\//,"/s0/").replace(/\/w\d+-h\d+\//,"/s0/")}
function getImageFromEntry(entry){try{const content=entry.content?.$t||entry.summary?.$t||"";const temp=document.createElement("div");temp.innerHTML=content;const firstImg=temp.querySelector("img");if(firstImg)return convertUrlToS0(firstImg.src);if(entry.media$thumbnail?.url)return convertUrlToS0(entry.media$thumbnail.url);}catch(e){}
return"https://via.placeholder.com/400x250?text=No+Image"}
function getCurrency(){const setting=document.querySelector('#theme-settings li a[href][href*="Currency"]');if(setting&&setting.getAttribute("href").trim()){return setting.getAttribute("href").trim()+" "}
const divVal=document.querySelector(".priceCurrency")?.textContent.trim();return divVal?divVal+" ":""}
function formatPrice(value){if(!value)return"";const num=parseFloat(String(value).replace(/,/g,""));if(isNaN(num))return value;return num.toLocaleString()}
function numericPrice(raw){if(!raw)return"";let cleaned=String(raw).replace(/[^\d.]/g,"");if(cleaned===""||isNaN(Number(cleaned)))return"";return cleaned}
function extractPricesFromPostBody(content){const oldMatch=content.match(/\[old-price="([^"]*)"\]/i);const currentMatch=content.match(/\[current-price="([^"]*)"\]/i);return{oldPrice:oldMatch?oldMatch[1].replace(/[^\d.,]/g,""):"",currentPrice:currentMatch?currentMatch[1].replace(/[^\d.,]/g,""):""}}
document.addEventListener("DOMContentLoaded",function(){const containers=document.querySelectorAll(".post-body, .widget-content");if(!containers.length)return;containers.forEach(container=>{let content=container.innerHTML;content=content.replace(/\[product-list\/(.*?)\/?(\d*)\]/gi,(match,typeRaw,cntRaw)=>{const type=(typeRaw||"recent").trim();const count=cntRaw?parseInt(cntRaw,10):5;const prodId="ProductList_"+Math.random().toString(36).substr(2,9);queueMicrotask(()=>buildProductList(prodId,type,count));return `<div id="${prodId}" class="product-list-slider-container" data-type="${type}" data-count="${count}"></div>`});content=content.replace(/\[product-list-2\/(.*?)\/(\d+)\]/gi,(match,typeRaw,limRaw)=>{const type=(typeRaw||"recent").trim();const limit=parseInt(limRaw,10)||5;const id="PostProductList2_"+Math.random().toString(36).substr(2,9);queueMicrotask(()=>buildProductList2InPost(id,type,limit));return `<div id="${id}" class="product-list-2-post-container" data-type="${type}" data-limit="${limit}"></div>`});if(content!==container.innerHTML){container.innerHTML=content}})});function buildProductList(prodId,type,count){const target=document.getElementById(prodId);if(!target)return;const siteOrigin=window.location.origin||location.protocol+"//"+location.host;const t=(type||"").toLowerCase().trim();const fetchLimit=60;let feedUrl;if(t==="recent"){feedUrl=`${siteOrigin}/feeds/posts/default?alt=json&max-results=${fetchLimit}`}else if(t==="random"){feedUrl=`${siteOrigin}/feeds/posts/default?alt=json&max-results=${fetchLimit}`}else{feedUrl=`${siteOrigin}/feeds/posts/default/-/${encodeURIComponent(type)}?alt=json&max-results=${fetchLimit}`}
fetch(feedUrl).then(res=>res.json()).then(data=>{let entries=data?.feed?.entry||[];if(t==="random"){entries=entries.sort(()=>0.5-Math.random()).slice(0,count)}else{entries=entries.slice(0,count)}
if(!entries.length){target.innerHTML="<p>No products found for this selection.</p>";return}
let html=`<div class="swiper product-list-swiper"><div class="swiper-wrapper">`;entries.forEach(entry=>{const title=entry.title?.$t||"";const linkObj=Array.isArray(entry.link)?entry.link.find(l=>l.rel==="alternate"):null;const link=linkObj?linkObj.href:"#";const img=getImageFromEntry(entry);const{oldPrice,currentPrice}=extractPricesFromPostBody(entry.content?.$t);const formattedOld=oldPrice?formatPrice(oldPrice):"";const formattedCurrent=currentPrice?formatPrice(currentPrice):"";const currNumeric=currentPrice?numericPrice(currentPrice):"";let priceHTML="";if(oldPrice||currentPrice){priceHTML=`<div class="pl-prices" itemprop="offers" itemscope itemtype="http://schema.org/Offer">`;if(formattedOld){priceHTML+=`<span class="pl-old-price">${escapeHtml(getCurrency())}${escapeHtml(formattedOld)}</span>`}
if(formattedCurrent){priceHTML+=`<span class="pl-current-price">${escapeHtml(getCurrency())}${escapeHtml(formattedCurrent)}</span>`;if(currNumeric)priceHTML+=`<meta itemprop="price" content="${escapeHtml(currNumeric)}"/>`}
if(currNumeric)priceHTML+=`<meta itemprop="priceCurrency" content="PKR"/>`;priceHTML+=`</div>`}
const imageMeta=img?`<meta itemprop="image" content="${escapeHtml(img)}"/>`:"";html+=`
                    <div class="swiper-slide product-list-item" itemscope itemtype="http://schema.org/Product">
                        <a href="${escapeHtml(link)}" itemprop="url">
                            <div class="product-list-img" itemprop="image">
                                <img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" itemprop="image">
                                ${imageMeta}
                            </div>
                            <div class="product-list-content">
                                <h3 class="pl-title" itemprop="name">${escapeHtml(title)}</h3>
                                ${priceHTML}
                            </div>
                        </a>
                    </div>`});html+=`</div>
                         <div class="swiper-button-next"></div>
                         <div class="swiper-button-prev"></div>
                         <div class="swiper-pagination"></div>
                         </div>`;target.innerHTML=html;if(typeof window.Swiper!=="undefined"){new Swiper(`#${prodId} .product-list-swiper`,{slidesPerView:3,spaceBetween:15,loop:entries.length>3,navigation:{nextEl:`#${prodId} .swiper-button-next`,prevEl:`#${prodId} .swiper-button-prev`,},pagination:{el:`#${prodId} .swiper-pagination`,clickable:!0,},breakpoints:{1600:{slidesPerView:4},1024:{slidesPerView:3},480:{slidesPerView:2},320:{slidesPerView:1},120:{slidesPerView:1},}})}}).catch(err=>{if(target)target.innerHTML="<p>Could not load products.</p>";console.error("[product-list error]",err)})}
function getDisplayCurrencySymbol(){const setting=document.querySelector('#theme-settings li a[href][href*="Currency"]');const settingValue=setting?setting.getAttribute("href").trim():"";if(settingValue)return settingValue;const divVal=document.querySelector(".priceCurrency")?.textContent.trim();return divVal?divVal:"Rs"}
function mapDisplayToISO(display){if(!display)return"PKR";const d=display.trim().toLowerCase();if(d==="rs"||d==="rs."||d==="pkr")return"PKR";if(d==="$"||d==="usd")return"USD";if(d==="€"||d==="eur")return"EUR";if(d==="£"||d==="gbp")return"GBP";if(d==="inr"||d==="₹")return"INR";return"PKR"}
function formatPriceForDisplay(price,symbol){if(!price)return"";const numeric=String(price).replace(/[^\d.,]/g,"");if(!numeric)return"";const parts=numeric.split(".");parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,",");const formatted=parts.join(".");return symbol?(symbol+" "+formatted):formatted}
function formatPriceForMeta(price){if(!price)return"";const numeric=String(price).replace(/[^\d.]/g,"");if(!numeric)return"";const n=parseFloat(numeric);if(isNaN(n))return"";return numeric}
function extractPricesFromEntry(entryContent){const rawContent=entryContent||"";const oldMatch=rawContent.match(/\[old-price="([^"]+)"\]/i);const currentMatch=rawContent.match(/\[current-price="([^"]+)"\]/i);return{oldPriceRaw:oldMatch?oldMatch[1]:"",currentPriceRaw:currentMatch?currentMatch[1]:""}}
function buildProductList2InPost(id,type,limit){const blogUrl=window.location.origin;let feedUrl;const t=type.toLowerCase().trim();const fetchLimit=Math.max(limit,20);if(t==="recent"){feedUrl=`${blogUrl}/feeds/posts/default?alt=json&max-results=${fetchLimit}`}else if(t==="random"){feedUrl=`${blogUrl}/feeds/posts/default?alt=json&max-results=${fetchLimit}`}else{feedUrl=`${blogUrl}/feeds/posts/default/-/${encodeURIComponent(type)}?alt=json&max-results=${fetchLimit}`}
fetch(feedUrl).then(res=>res.json()).then(data=>{let entries=data?.feed?.entry||[];if(t==="random"){entries=entries.sort(()=>0.5-Math.random()).slice(0,limit)}else{entries=entries.slice(0,limit)}
const target=document.getElementById(id);if(!target)return;if(!entries.length){target.innerHTML="<p>No products found.</p>";return}
const displaySymbol=getDisplayCurrencySymbol();const isoCurrency=mapDisplayToISO(displaySymbol);let html=`<div class="product-list-2-post-vertical" itemscope itemtype="https://schema.org/ItemList">`;entries.forEach(entry=>{const title=entry.title?.$t||"";const linkObj=Array.isArray(entry.link)?entry.link.find(l=>l.rel==="alternate"):null;const link=linkObj?linkObj.href:"#";const img=getImageFromEntry(entry);const{oldPriceRaw,currentPriceRaw}=extractPricesFromEntry(entry.content?.$t);const oldDisplay=oldPriceRaw?formatPriceForDisplay(oldPriceRaw,displaySymbol):"";const currentDisplay=currentPriceRaw?formatPriceForDisplay(currentPriceRaw,displaySymbol):"";const metaPrice=currentPriceRaw?formatPriceForMeta(currentPriceRaw):(oldPriceRaw?formatPriceForMeta(oldPriceRaw):"");const offersHtml=(oldDisplay||currentDisplay)?`
                        <div class="pl2-post-prices" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                          ${oldDisplay ? `<span class="pl2-post-old-price">${escapeHtml(oldDisplay)}</span>` : ""}
                          ${currentDisplay ? `<span class="pl2-post-current-price">${escapeHtml(currentDisplay)}</span>` : ""}
                          ${metaPrice ? `<meta itemprop="price" content="${escapeHtml(metaPrice)}">` : ""}
                          <meta itemprop="priceCurrency" content="${escapeHtml(isoCurrency)}">
                        </div>`:"";html+=`
                    <div class="product-list-2-post-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/Product">
                      <div class="pl2-post-img">
                        <a href="${escapeHtml(link)}" target="_blank" itemprop="url">
                          <img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" itemprop="image">
                        </a>
                      </div>
                      <div class="pl2-post-content">
                        <h4 class="pl2-post-title" itemprop="name">
                          <a href="${escapeHtml(link)}">${escapeHtml(title)}</a>
                        </h4>
                        ${offersHtml}
                        <meta itemprop="url" content="${escapeHtml(link)}">
                      </div>
                    </div>`});html+=`</div>`;target.innerHTML=html}).catch(err=>{const target=document.getElementById(id);if(target)target.innerHTML="<p>Could not load products.</p>";console.error(err)})}})();(function(){"use strict";function decodeHTML(html){if(!html)return"";const txt=document.createElement("textarea");txt.innerHTML=html;return txt.value}
function isHomepageContext(){const path=window.location.pathname;return(path==="/"||path==="/index.html"||path.startsWith("/search"))}
function isShopPage(){return window.location.pathname==="/p/shop.html"}
function processCategoryShortcodes(){let containers=[];if(isHomepageContext()){const el=document.querySelector("#LayraProductCategory .widget-content");if(el)containers.push(el);}
if(isShopPage()){containers.push(...document.querySelectorAll(".post-body, .widget-content, .page-body, .static_page"))}
if(!containers.length)return;containers.forEach(container=>{if(!container||container.dataset.LayraProcessed)return;const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){const regex=/\[product-category\/([^\]]+)\]/gi;let match;while((match=regex.exec(node.nodeValue))){const raw=match[1];const count=raw.toLowerCase()==="all"?999:parseInt(raw,10)||6;const id="LayraProductCategory_"+Math.random().toString(36).slice(2,9);const holder=document.createElement("div");holder.id=id;holder.className="Layra-product-category-slider";const before=node.splitText(match.index);before.nodeValue=before.nodeValue.replace(match[0],"");node.parentNode.insertBefore(holder,before);buildLayraProductCategory(holder,count)}}
container.dataset.LayraProcessed="1"})}
async function buildLayraProductCategory(container,count){const site=location.origin;const feedUrl=`${site}/feeds/posts/default?alt=json&max-results=500`;let data;try{data=await fetch(feedUrl).then(r=>r.json())}catch{container.innerHTML="<p>Could not fetch categories.</p>";return}
const entries=data?.feed?.entry||[];const labelMap={};entries.forEach(entry=>{const labels=entry.category||[];const image=getImageFromEntry(entry);labels.forEach(l=>{if(!labelMap[l.term]){labelMap[l.term]={image,count:1}}else{labelMap[l.term].count++}})});const labelsArr=Object.entries(labelMap).slice(0,count);if(!labelsArr.length){container.innerHTML="<p>No categories found.</p>";return}
container.innerHTML=`
<div class="swiper Layra-category-swiper">
  <div class="swiper-wrapper">
    ${labelsArr
                .map(
                    ([label, d]) => `<div class="swiper-slide Layra-category-item"><div class="category-image" style="background-image:url('${d.image}')"></div><div class="category-overlay"><span class="category-post-count">${d.count}Items</span><span class="category-title">${label}</span><a class="category-explore" href="${site}/search/label/${encodeURIComponent(
                        label
                    )}?max-results=8">Explore More<i class="bi bi-arrow-right"></i></a></div></div>`
                )
                .join("")}
  </div>
  <div class="swiper-button-prev"></div>
  <div class="swiper-button-next"></div>
</div>`;if(window.Swiper){new Swiper(`#${container.id} .Layra-category-swiper`,{slidesPerView:4,spaceBetween:20,loop:labelsArr.length>4,navigation:{nextEl:`#${container.id} .swiper-button-next`,prevEl:`#${container.id} .swiper-button-prev`},breakpoints:{1600:{slidesPerView:5},1024:{slidesPerView:4},768:{slidesPerView:3},480:{slidesPerView:2},0:{slidesPerView:1}}})}}
function getImageFromEntry(entry){try{const html=entry.content?.$t||entry.summary?.$t||"";const div=document.createElement("div");div.innerHTML=decodeHTML(html);const img=div.querySelector("img")||entry.media$thumbnail;if(img){return(img.src||img.url).replace(/\/s\d+(-c)?\//g,"/s0/").replace(/\/w\d+-h\d+\//g,"/s0/")}}catch{}
return"https://via.placeholder.com/400x300?text=No+Image"}
function init(){processCategoryShortcodes();if(isShopPage()){const obs=new MutationObserver(processCategoryShortcodes);obs.observe(document.body,{childList:!0,subtree:!0})}}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init)}else{init()}})();(function(){"use strict";function decodeHTML(html){if(!html)return"";const txt=document.createElement("textarea");txt.innerHTML=html;return txt.value}
function escText(s){if(s==null)return"";return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function extractShortcode(body,key){if(!body)return"";const re=new RegExp("\\["+key+"=(?:\"([^\"]*)\"|'([^']*)'|([^\\]]+))\\]","i");const m=body.match(re);return m?(m[1]||m[2]||m[3]||"").trim():""}
function getImageFromEntry(entry){try{const content=entry.content?.$t||entry.summary?.$t||"";const tmp=document.createElement("div");tmp.innerHTML=decodeHTML(content);const img=tmp.querySelector("img")||entry.media$thumbnail;if(img){let url=img.src||img.url||"";return url.replace(/\/s\d+(-c)?\//g,"/s0/").replace(/\/w\d+-h\d+\//g,"/s0/")}}catch(e){}
return"https://via.placeholder.com/400x300?text=No+Image"}
function addViewAllButton(container,type,entries){if(!container)return;const button=document.createElement('a');button.className='view-all-btn';button.innerHTML='View All <i class="bi bi-arrow-right"></i>';button.style.cssText=`position: absolute; top: -20px; right: 20px; z-index: 10; background: var(--light-color); color: var(--text-dark); padding: 8px 16px; border-radius: 20px; text-decoration: none; font-size: 14px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid var(--border-color); display: inline-block; transition: all 0.3s ease;`;const site=window.location.origin;const t=type.toLowerCase();if(t==='recent'){button.href=site+'/search?max-results=8';button.innerHTML='View Recent <i class="bi bi-arrow-right"></i>'}else if(t==='random'){button.href=site+'/search?max-results=8';button.innerHTML='View All <i class="bi bi-arrow-right"></i>'}else if(entries&&entries.length>0){const labels=entries[0].category||[];if(labels.length>0){button.href=site+'/search/label/'+encodeURIComponent(labels[0].term);button.innerHTML='View '+labels[0].term+' <i class="bi bi-arrow-right"></i>'}else{button.href=site+'/search?max-results=50'}}else{button.href=site+'/search?max-results=50'}
button.onmouseover=function(){this.style.background='var(--primary-background)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';this.style.transform='translateY(-2px)'};button.onmouseout=function(){this.style.background='#fff';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)';this.style.transform='translateY(0)'};container.style.position='relative';container.appendChild(button)}
function parseVariants(body){if(!body)return null;const regex=/\[variants\s*(?:\(([^)]*)\))?\s*=\s*([^[\]]+?)\s*\]/i;const match=body.match(regex);if(!match)return null;const groupName=(match[1]||"Variants").trim();const items=match[2].trim().split(/\s*\+\s*/).map(s=>s.trim()).filter(Boolean);return{groupName,items}}
function renderVariantsHTML(body){const parsed=parseVariants(body);if(!parsed)return"";const{groupName,items}=parsed;let html=`
        <div class="post homepage-view-variants">
            <div class="Layra-variants-container">
                <div class="group-container Layra-product-variants show">
                    <strong>${escText(groupName)}:</strong>
                    <div class="Layra-variant-group group">
        `;if(items.length>0){html+=`<span class="variant-item selected" data-label="${escText(items[0])}">${escText(items[0])}</span>`;if(items.length>1)html+=`<span class="variant-count">+${items.length - 1}</span>`}
html+=`
                    </div>
                </div>
            </div>
        </div>`;return html}
function processContainers(){const containers=document.querySelectorAll(".widget-content, .page-body, .static_page, .post-body");containers.forEach(container=>{const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){const regex=/\[product-grid\/([^\]\/]+)(?:\/(\d+))?\]/gi;let match;while((match=regex.exec(node.nodeValue))!==null){const type=match[1];const count=match[2]?parseInt(match[2],10):5;const gridId="LayraProductGrid_"+Math.random().toString(36).substr(2,9);const placeholder=document.createElement("div");placeholder.id=gridId;placeholder.className="product-grid-slider";const before=node.splitText(match.index);before.nodeValue=before.nodeValue.replace(match[0],"");node.parentNode.insertBefore(placeholder,before);buildLayraProductGrid(placeholder,type,count)}}})}
async function buildLayraProductGrid(container,type,count){const site=window.location.origin;const t=(type||"").toLowerCase();let feedUrl;if(t==="recent")feedUrl=`${site}/feeds/posts/default?alt=json&max-results=${count}`;else if(t==="random")feedUrl=`${site}/feeds/posts/default?alt=json&max-results=${count * 2}`;else feedUrl=`${site}/feeds/posts/default/-/${encodeURIComponent(type)}?alt=json&max-results=${count}`;let data;try{const res=await fetch(feedUrl);data=await res.json()}catch(e){container.innerHTML=`<p>Could not fetch products.</p>`;return}
let entries=data?.feed?.entry||[];if(t==="random"){entries=entries.sort(()=>0.5-Math.random()).slice(0,count)}else{entries=entries.slice(0,count)}
if(!entries.length){container.innerHTML=`<p>No products found.</p>`;return}
const slidesHtml=entries.map(entry=>buildProductCard(entry,site)).join("");container.innerHTML=`
            <div class="swiper">
                <div class="swiper-wrapper Layra-post-homepage-view">${slidesHtml}</div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
                <div class="swiper-pagination"></div>
            </div>
        `;addViewAllButton(container,type,entries);if(typeof window.Swiper!=="undefined"){new Swiper(`#${container.id} .swiper`,{slidesPerView:3,spaceBetween:20,loop:entries.length>3,navigation:{nextEl:`#${container.id} .swiper-button-next`,prevEl:`#${container.id} .swiper-button-prev`,},pagination:{el:`#${container.id} .swiper-pagination`,clickable:!0,},breakpoints:{1600:{slidesPerView:5},1024:{slidesPerView:4},768:{slidesPerView:3},480:{slidesPerView:2},120:{slidesPerView:1},},})}
const syncWishlist=()=>{if(window.wishlist&&typeof window.wishlist.updateProductButtons==="function"){window.wishlist.updateProductButtons()}};syncWishlist();setTimeout(syncWishlist,500);window.addEventListener("wishlistUpdated",syncWishlist)}
function buildProductCard(entry,site){const body=entry.content?.$t||"";const title=entry.title?.$t||"";const url=entry.link.find(l=>l.rel==="alternate")?.href||"#";const id=entry.id.$t.split(".post-")[1];const image=getImageFromEntry(entry);const oldPriceRaw=extractShortcode(body,"old-price");const currentPriceRaw=extractShortcode(body,"current-price");const oldNum=parseFloat(oldPriceRaw.replace(/[^0-9.]/g,""))||0;const currentNum=parseFloat(currentPriceRaw.replace(/[^0-9.]/g,""))||0;let saleText="";if(oldNum>currentNum&&currentNum>0){const discount=Math.round(((oldNum-currentNum)/oldNum)*100);if(discount>0)saleText=`${discount}% OFF`}
const stockRaw=extractShortcode(body,"stock")||"In Stock";const labels=entry.category||[];const priceCurrency=document.querySelector(".priceCurrency")?.textContent.trim()||"Rs";const formatPrice=(val)=>{if(!val)return"";const str=val.toFixed(0);return str.replace(/\B(?=(\d{3})+(?!\d))/g,",")};const variantsHtml=renderVariantsHTML(body);return `
<div class="swiper-slide product-grid-item post post-outer"
     data-post-id="${id}"
     data-post-url="${url}"
     itemscope itemtype="https://schema.org/Product">
<div class="post hentry">
    <div class="PostImage">
        <img class="post-thumbnail" src="${image}" itemprop="image" alt="${escText(title)}">
        ${variantsHtml}
    </div>
    <div class="Layra-separate-actions">
        <div class="separate-actions-left">
            <a class="Layra-add-to-wishlist" data-id="${id}" data-post-url="${url}" data-title="${escText(title)}" href="#">
                <i class="bi bi-heart"></i><span>Add to Wishlist</span>
            </a>
            <div class="buy-now-container">
                <a class="Layra-buy-now direct-buy post" data-id="${id}" data-post-url="${url}" href="#">
                    <i class="bi bi-rocket-takeoff"></i><span>Buy Now</span>
                </a>
            </div>
            <a class="Layra-view-product" href="${url}">
                <i class="bi bi-eye"></i><span>View</span>
            </a>
        </div>
        <div class="separate-actions-right">
            <div class="post" data-post-url="${url}">
                <div class="Layra-product-stock ${stockRaw.toLowerCase().includes("out") ? "out-of-stock" : "in-stock"}"
                     itemprop="availability" itemscope itemtype="https://schema.org/InStock">
                    ${escText(stockRaw)}
                </div>
            </div>
            ${saleText ? `<div class="home-post-sale"><div class="Layra-product-sale">${saleText}</div></div>` : ""}
        </div>
    </div>

    <div class="product-details">
        <h3 class="product-title entry-title" itemprop="name">
            <a href="${url}">${escText(title)}</a>
        </h3>
        <div class="product-price">
            <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                <div class="post prices-inner">
                    ${oldNum > 0 ? `<div class="Layra-product-old-price">${priceCurrency}${formatPrice(oldNum)}</div>` : ""}
                    ${currentNum > 0 ? `<div class="Layra-product-current-price">${priceCurrency}${formatPrice(currentNum)}</div><meta itemprop="price" content="${currentNum}"><meta itemprop="priceCurrency" content="${priceCurrency}">` : ""}
                </div>
            </div>
            <div class="homepage-view-label">
                ${labels.map(l => `<a class="tag" href="${site}/search/label/${encodeURIComponent(l.term)}">${escText(l.term)}</a>`).join("")}
            </div>
        </div>
        <div class="product-footer">
            <div class="Layra-product-actionspost post" data-post-url="${url}">
                <div class="homepage-hidden-body" data-post-id="${id}" style="display:none;">${body}</div>
                <a class="Layra-icon-btn add-to-cart" data-id="${id}" data-title="${escText(title)}" href="#" title="Add to Cart">
                    <i class="fa-solid fa-cart-plus icon"></i> Add to Cart
                </a>
            </div>
        </div>
    </div>
</div>
</div>`}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",processContainers)}else{processContainers()}})();(function(){function processContainer(containerSelector){const containers=document.querySelectorAll(containerSelector);if(!containers.length)return;containers.forEach(container=>{container.querySelectorAll(".add-to-cart").forEach(btn=>{const wrapper=btn.closest(".post-outer")||btn.closest("[data-post-id]")||btn.closest(".post");if(!wrapper)return;if(wrapper.querySelector(".Layra-product-stock.out-of-stock")){forceDisable(btn)}});container.querySelectorAll(".Layra-buy-now").forEach(btn=>{const wrapper=btn.closest(".post-outer")||btn.closest("[data-post-id]")||btn.closest(".post");if(!wrapper)return;if(wrapper.querySelector(".Layra-product-stock.out-of-stock")){forceDisable(btn);const parent=btn.closest(".buy-now-container");if(parent)parent.style.cursor="not-allowed"}})})}
function disableProductGridSlider(){processContainer(".product-grid-slider")}
function disableProductGrid2(){processContainer(".product-grid-2")}
function forceDisable(el){el.classList.add("disabled-button");el.setAttribute("aria-disabled","true");el.style.pointerEvents="none";el.style.opacity="0.6";el.style.cursor="not-allowed"}
document.addEventListener("DOMContentLoaded",()=>{disableProductGridSlider();disableProductGrid2();const observer=new MutationObserver(()=>{disableProductGridSlider();disableProductGrid2()});observer.observe(document.body,{childList:!0,subtree:!0})})})();(function(){"use strict";function decodeHTML(html){if(!html)return"";const txt=document.createElement("textarea");txt.innerHTML=html;return txt.value}
function escText(s){if(s==null)return"";return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function extractShortcode(body,key){if(!body)return"";const re=new RegExp("\\["+key+"=(?:\"([^\"]*)\"|'([^']*)'|([^\\]]+))\\]","i");const m=body.match(re);return m?(m[1]||m[2]||m[3]||"").trim():""}
function getImageFromEntry(entry){try{const content=entry.content?.$t||entry.summary?.$t||"";const tmp=document.createElement("div");tmp.innerHTML=decodeHTML(content);const img=tmp.querySelector("img")||entry.media$thumbnail;if(img){let url=img.src||img.url||"";return url.replace(/\/s\d+(-c)?\//g,"/s0/").replace(/\/w\d+-h\d+\//g,"/s0/")}}catch(e){}
return"https://via.placeholder.com/400x300?text=No+Image"}
function addViewAllButton(container,type,entries){if(!container)return;const button=document.createElement('a');button.className='view-all-btn';button.innerHTML='View All <i class="bi bi-arrow-right"></i>';button.style.cssText=`
            position: absolute;
            top: -20px;
            right: 20px;
            z-index: 10;
            background: var(--light-color);
            color: var(--text-dark);
            padding: 8px 16px;
            border-radius: 20px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid var(--border-color);
            display: inline-block;
            transition: all 0.3s ease;
        `;const site=window.location.origin;const t=type.toLowerCase();if(t==='recent'){button.href=site+'/search?max-results=8';button.innerHTML='View Recent <i class="bi bi-arrow-right"></i>'}else if(t==='random'){button.href=site+'/search?max-results=8';button.innerHTML='View All <i class="bi bi-arrow-right"></i>'}else if(entries&&entries.length>0){const labels=entries[0].category||[];if(labels.length>0){button.href=site+'/search/label/'+encodeURIComponent(labels[0].term);button.innerHTML='View '+labels[0].term+' <i class="bi bi-arrow-right"></i>'}else{button.href=site+'/search?max-results=50'}}else{button.href=site+'/search?max-results=50'}
button.onmouseover=function(){this.style.background='var(--primary-background)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';this.style.transform='translateY(-2px)'};button.onmouseout=function(){this.style.background='#fff';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)';this.style.transform='translateY(0)'};container.style.position='relative';container.appendChild(button)}
function parseVariants(body){if(!body)return null;const regex=/\[variants\s*(?:\(([^)]*)\))?\s*=\s*([^[\]]+?)\s*\]/i;const match=body.match(regex);if(!match)return null;const groupName=(match[1]||"Variants").trim();const rawVariants=match[2].trim();const items=rawVariants.split(/\s*\+\s*/).map(s=>s.trim()).filter(Boolean);if(!items.length)return null;return{groupName,items}}
function renderVariantsHTML(body){const parsed=parseVariants(body);if(!parsed)return"";const{groupName,items}=parsed;const isHomepage=!0;let html=`
            <div class="Layra-variants-container">
                <div class="group-container Layra-product-variants show">
                    <strong>${escText(groupName)}:</strong>
                    <div class="Layra-variant-group group">
        `;if(isHomepage&&items.length>0){const first=items[0];const remaining=items.length-1;html+=`<span class="variant-item selected" data-label="${escText(first)}">${escText(first)}</span>`;if(remaining>0)html+=`<span class="variant-count">+${remaining}</span>`}else{items.forEach((v,i)=>{html+=`<span class="variant-item${i === 0 ? ' selected' : ''}" data-label="${escText(v)}">${escText(v)}</span>`})}
html+=`
                    </div>
                </div>
            </div>
        `;return html}
function createLoadMoreButton(container){const btn=document.createElement("button");btn.className="load-more-products-btn";btn.innerHTML='Load More <i class="bi bi-plus-lg icon"></i>';container.appendChild(btn);return btn}
function processContainers(){const containers=document.querySelectorAll(".widget-content, .page-body, .static_page, .post-body");containers.forEach(container=>{const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){const regex=/\[product-grid-2\/([^\]\/]+)\/(All|\d+)(?:\/maxResults=(\d+))?\]/gi;let match;while((match=regex.exec(node.nodeValue))!==null){const type=match[1];const countStr=match[2].trim();const perPageStr=match[3];let totalToFetch;if(countStr.toUpperCase()==="ALL"){totalToFetch=200}else{totalToFetch=parseInt(countStr,10)||8}
const usePagination=!!perPageStr;let perPage;if(usePagination){perPage=parseInt(perPageStr,10)||5}else{perPage=totalToFetch}
const gridId="LayraProductGrid2_"+Math.random().toString(36).substr(2,9);const placeholder=document.createElement("div");placeholder.id=gridId;placeholder.className="product-grid-2";placeholder.dataset.type=type;placeholder.dataset.total=totalToFetch;placeholder.dataset.perPage=perPage;placeholder.dataset.loaded="0";const before=node.splitText(match.index);before.nodeValue=before.nodeValue.replace(match[0],"");node.parentNode.insertBefore(placeholder,before);buildProductGridV2(placeholder,type,totalToFetch,perPage,usePagination)}}})}
async function buildProductGridV2(container,type,totalToFetch,perPage,usePagination){const site=window.location.origin;const t=(type||"").toLowerCase();let feedUrl;if(t==="recent")
feedUrl=`${site}/feeds/posts/default?alt=json&max-results=${totalToFetch}`;else if(t==="random")
feedUrl=`${site}/feeds/posts/default?alt=json&max-results=${totalToFetch * 2}`;else feedUrl=`${site}/feeds/posts/default/-/${encodeURIComponent(type)}?alt=json&max-results=${totalToFetch}`;let data;try{const res=await fetch(feedUrl);data=await res.json()}catch(e){container.innerHTML=`<p>Could not fetch products.</p>`;return}
let entries=data?.feed?.entry||[];if(t==="random"){entries=entries.sort(()=>0.5-Math.random()).slice(0,totalToFetch)}else{entries=entries.slice(0,totalToFetch)}
if(!entries.length){container.innerHTML=`<p>No products found.</p>`;return}
container._allEntries=entries;const initialCount=Math.min(perPage,entries.length);const initialCards=entries.slice(0,initialCount).map(entry=>buildProductCard(entry,site)).join("");container.innerHTML=`<div class="product-grid-2-container Layra-post-homepage-view">${initialCards}</div>`;container.dataset.loaded=initialCount;addViewAllButton(container,type,entries);if(usePagination&&entries.length>initialCount){const loadMoreBtn=createLoadMoreButton(container);loadMoreBtn.addEventListener("click",()=>{const alreadyLoaded=parseInt(container.dataset.loaded,10);const nextStart=alreadyLoaded;const nextEnd=Math.min(nextStart+perPage,entries.length);if(nextStart>=entries.length){loadMoreBtn.style.display="none";return}
const newCards=entries.slice(nextStart,nextEnd).map(entry=>buildProductCard(entry,site)).join("");const grid=container.querySelector(".product-grid-2-container");grid.insertAdjacentHTML("beforeend",newCards);container.dataset.loaded=nextEnd;if(nextEnd>=entries.length){loadMoreBtn.style.display="none"}
if(window.wishlist&&typeof window.wishlist.updateProductButtons==="function"){window.wishlist.updateProductButtons()}})}
const syncWishlistButtons=()=>{if(window.wishlist&&typeof window.wishlist.updateProductButtons==="function"){window.wishlist.updateProductButtons()}};syncWishlistButtons();setTimeout(syncWishlistButtons,200);window.addEventListener("wishlistUpdated",syncWishlistButtons)}
function buildProductCard(entry,site){const body=entry.content?.$t||"";const title=entry.title?.$t||"";const url=entry.link.find(l=>l.rel==="alternate")?.href||"#";const id=entry.id.$t.split(".post-")[1];const image=getImageFromEntry(entry);const oldPriceRaw=extractShortcode(body,"old-price");const currentPriceRaw=extractShortcode(body,"current-price");const numericOld=parseFloat(oldPriceRaw.replace(/[^0-9.]/g,""))||0;const numericCurrent=parseFloat(currentPriceRaw.replace(/[^0-9.]/g,""))||0;const priceCurrency=document.querySelector(".priceCurrency")?.textContent.trim()||"PKR";let saleText="";if(numericOld>numericCurrent&&numericCurrent>0){const discount=Math.round(((numericOld-numericCurrent)/numericOld)*100);saleText=discount>0?`${discount}% OFF`:""}
const stockRaw=extractShortcode(body,"stock")||"In Stock";const labels=entry.category||[];const formatPrice=(val)=>{if(!val)return"";const str=val.toString().split(".");let intPart=str[0].replace(/\B(?=(\d{3})+(?!\d))/g,",");return intPart+(str[1]?"."+str[1]:"")};const variantsHtml=renderVariantsHTML(body);return `
<div class="product-grid-item post post-outer" itemscope itemtype="https://schema.org/Product">
    <div class='post hentry'>
        <div class="PostImage">
            <img class="post-thumbnail" src="${image}" itemprop="image" loading="lazy">
      <div class="post homepage-view-variants">
        ${variantsHtml}
     </div>
        </div>
        <div class="Layra-separate-actions">
            <div class='separate-actions-left'>
                <a class="Layra-add-to-wishlist" data-id="${id}" data-post-url="${url}" data-title="${title}" href="#">
                    <i class="bi bi-heart"></i><span>Add to Wishlist</span>
                </a>
                <div class="buy-now-container">
                    <a class="Layra-buy-now direct-buy post" data-id="${id}" data-post-url="${url}" href="#">
                        <i class="bi bi-rocket-takeoff"></i> <span>Buy Now</span>
                    </a>
                </div>
                <a class="Layra-view-product" href="${url}">
                    <i class="bi bi-eye"></i> <span>View Now</span>
                </a>
            </div>
            <div class='separate-actions-right'>
                <div class='post' data-post-url='${url}'>
                    <div class='Layra-product-stock ${stockRaw === "Out of Stock" ? "out-of-stock" : "in-stock"}'>
                        ${escText(stockRaw)}
                    </div>
                </div>
                ${saleText ? `<div class="home-post-sale"><div class="Layra-product-sale">${saleText}</div></div>` : ""}
            </div>
        </div>
        <div class="product-details">
            <h3 class="product-title entry-title" itemprop="name">
                <a href="${url}">${title}</a>
            </h3>
            <div class="product-price">
                <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                    <div class='post prices-inner'>
                        ${numericOld ? `<div class="Layra-product-old-price">${priceCurrency}${formatPrice(numericOld)}</div>` : ""}
                        ${numericCurrent ? `<div class="Layra-product-current-price">${priceCurrency}${formatPrice(numericCurrent)}</div><meta itemprop="price" content="${numericCurrent}"><meta itemprop="priceCurrency" content="${priceCurrency}">` : ""}
                    </div>
                </div>
                <div class="homepage-view-label">
                    ${labels.map(l => `<a class="tag" href="${site}/search/label/${encodeURIComponent(l.term)}">${l.term}</a>`).join("")}
                </div>
            </div>
            <div class="product-footer">
                <div class='Layra-product-actionspost post' data-post-url='${url}'>
                    <div class='homepage-hidden-body' data-post-id='${id}' style='display:none;'>${body}</div>
                    <a class='Layra-icon-btn add-to-cart' data-id='${id}' data-title='${title}' href='#' title='Add to Cart'>
                        <i class='fa-solid fa-cart-plus icon'></i> Add to Cart
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>`}
if(!document.getElementById("product-grid-2-styles")){const style=document.createElement("style");style.id="product-grid-2-styles";style.textContent=`
            .product-grid-2 .PostImage img {
                width: 100%;
                height: auto;
                object-fit: cover;
            }
            .load-more-products-btn:hover {
                opacity: 0.92;
            }
        `;document.head.appendChild(style)}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",processContainers)}else{processContainers()}})();document.addEventListener("DOMContentLoaded",function(){function getCommentLimit(){function parseHrefValue(el){if(!el)return null;const href=el.getAttribute("href")||"";const m=href.match(/^\s*([+-]?\d+)/);if(m){const val=parseInt(m[1],10);if(!isNaN(val))return val}
return null}
const themeSettings=document.querySelector("#theme-settings");if(themeSettings){const anchors=Array.from(themeSettings.querySelectorAll("a"));for(let a of anchors){try{if((a.textContent||"").trim().toLowerCase().includes("comments limit")){const val=parseHrefValue(a);if(val!==null)return Math.max(5,Math.min(val,50));}}catch(e){}}}
const allAnchors=Array.from(document.querySelectorAll("a"));for(let a of allAnchors){try{if((a.textContent||"").trim().toLowerCase().includes("comments limit")){const val=parseHrefValue(a);if(val!==null)return Math.max(5,Math.min(val,50));}}catch(e){}}
const hrefEl=document.querySelector("a[href*='Comments Limit']");if(hrefEl){const val=parseHrefValue(hrefEl);if(val!==null)return Math.max(5,Math.min(val,50));}
return 8}
const commentsPerPage=getCommentLimit();const IMAGE_TOKEN_RE=/\{(https?:\/\/[^\s{}]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s{}]*)?)\}/gi;const LABELED_LINK_RE=/\(([^(){}]+?)\s*\{\s*([^\s{}]+)\s*\}\)/gi;const URL_RE=/(https?:\/\/[^\s<>"'(){}\[\]\s]+)/gi;const IMAGE_EXT_RE=/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;function makeImageNode(url){const wrapper=document.createElement("div");wrapper.className="comment-img";const img=document.createElement("img");img.src=url;img.alt="Comment Image";img.style.maxWidth="100%";img.onclick=function(){window.openLightbox&&window.openLightbox(url)};wrapper.appendChild(img);return wrapper}
function makeLinkNode(href,label){const a=document.createElement("a");a.className="comment-link";a.href=href;a.target="_blank";a.rel="noopener";a.textContent=label;return a}
function hostnameToLabel(hostname){try{const firstPart=hostname.split(".")[0];return firstPart.replace(/[-_]+/g," ").replace(/\b\w/g,(m)=>m.toUpperCase())}catch(e){return hostname}}
function parseCommentContentIntoNode(container){let imageCount=0;const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT,null,!1);const textNodes=[];while(walker.nextNode())textNodes.push(walker.currentNode);textNodes.forEach((textNode)=>{const original=textNode.nodeValue;if(!original||!original.trim())return;const frag=document.createDocumentFragment();function processPlainTextPiece(piece){let lastIndex=0;let match;URL_RE.lastIndex=0;while((match=URL_RE.exec(piece))!==null){const idx=match.index;const url=match[0];if(idx>lastIndex){frag.appendChild(document.createTextNode(piece.slice(lastIndex,idx)))}
if(IMAGE_EXT_RE.test(url)){imageCount++;if(imageCount<=6){frag.appendChild(makeImageNode(url))}else{const a=makeLinkNode(url,"Image "+imageCount);frag.appendChild(a)}}else{let label;try{label=hostnameToLabel(new URL(url).hostname.replace(/^www\./,""))}catch{label=url}
frag.appendChild(makeLinkNode(url,label))}
lastIndex=idx+url.length}
if(lastIndex<piece.length){frag.appendChild(document.createTextNode(piece.slice(lastIndex)))}}
LABELED_LINK_RE.lastIndex=0;let lmatch;let tempSegments=[];let lastPos=0;while((lmatch=LABELED_LINK_RE.exec(original))!==null){const mIndex=lmatch.index;if(mIndex>lastPos){tempSegments.push({type:"text",content:original.slice(lastPos,mIndex)})}
let label=lmatch[1].trim();let urlText=lmatch[2].trim();if(!/^[a-zA-Z][a-zA-Z0-9+.\-]*:\/\//.test(urlText))urlText="https://"+urlText;const anchor=makeLinkNode(urlText,label||urlText);tempSegments.push({type:"node",content:anchor});lastPos=mIndex+lmatch[0].length}
if(lastPos===0){tempSegments.push({type:"text",content:original})}else{if(lastPos<original.length)tempSegments.push({type:"text",content:original.slice(lastPos)})}
tempSegments.forEach((seg)=>{if(seg.type==="node"){frag.appendChild(seg.content);return}
let piece=seg.content;let iLast=0;let imatch;IMAGE_TOKEN_RE.lastIndex=0;while((imatch=IMAGE_TOKEN_RE.exec(piece))!==null){const idx=imatch.index;if(idx>iLast)processPlainTextPiece(piece.slice(iLast,idx));const imgUrl=imatch[1];imageCount++;if(imageCount<=6){frag.appendChild(makeImageNode(imgUrl))}else{const a=makeLinkNode(imgUrl,"Image "+imageCount);frag.appendChild(a)}
iLast=idx+imatch[0].length}
if(iLast===0){processPlainTextPiece(piece)}else{if(iLast<piece.length)processPlainTextPiece(piece.slice(iLast));}});if(frag.childNodes&&frag.childNodes.length){textNode.parentNode.replaceChild(frag,textNode)}});const imgs=container.querySelectorAll(".comment-img");if(imgs.length>0){const toGroup=[];imgs.forEach((imgEl)=>{if(!imgEl.closest(".comment-images"))toGroup.push(imgEl);});if(toGroup.length>0){const group=document.createElement("div");group.className="comment-images";const anchor=toGroup[0];anchor.parentNode.insertBefore(group,anchor);toGroup.forEach((imgEl)=>group.appendChild(imgEl))}}}
function parseCommentContent(element){parseCommentContentIntoNode(element)}
function applyCommentEnhancements(){document.querySelectorAll(".comment .comment-content").forEach(function(el){parseCommentContent(el)})}
applyCommentEnhancements();(function observeComments(){const thread=document.querySelector(".comment-thread");if(!thread)return;const mo=new MutationObserver((mutations)=>{mutations.forEach((m)=>{m.addedNodes.forEach((n)=>{if(!(n instanceof Element))return;if(n.matches&&n.matches(".comment")){const content=n.querySelector(".comment-content");if(content)parseCommentContent(content);initializeLoadMore()}else{n.querySelectorAll&&n.querySelectorAll(".comment .comment-content").forEach(parseCommentContent)}})})});mo.observe(thread,{childList:!0,subtree:!0})})();let loadMoreState={visibleCount:null,button:null};function initializeLoadMore(){const comments=Array.from(document.querySelectorAll(".comment-thread .comment"));const replyBox=document.querySelector(".comment-replybox-thread")||document.querySelector(".comment-thread");if(!replyBox)return;const existingBtn=document.querySelector(".load-more-comments");if(existingBtn)existingBtn.remove();if(comments.length<=commentsPerPage){comments.forEach((c)=>(c.style.display="block"));loadMoreState.visibleCount=comments.length;loadMoreState.button=null;return}
const loadMoreBtn=document.createElement("button");loadMoreBtn.className="load-more-comments";loadMoreBtn.textContent="Load More Comments";loadMoreState.visibleCount=commentsPerPage;loadMoreState.button=loadMoreBtn;function updateComments(){comments.forEach((c,i)=>{c.style.display=i<loadMoreState.visibleCount?"block":"none"});if(loadMoreState.visibleCount>=comments.length){if(loadMoreState.button&&loadMoreState.button.parentNode)
loadMoreState.button.style.display="none"}else{if(loadMoreState.button)loadMoreState.button.style.display="inline-block"}}
updateComments();try{replyBox.parentNode.insertBefore(loadMoreBtn,replyBox)}catch(e){const thread=document.querySelector(".comment-thread");thread&&thread.appendChild(loadMoreBtn)}
loadMoreBtn.addEventListener("click",function(){loadMoreState.visibleCount+=commentsPerPage;updateComments()})}(function initLoadMoreWithRetries(){let attempts=0;const maxAttempts=8;const interval=400;const timer=setInterval(()=>{attempts++;const thread=document.querySelector(".comment-thread");const comments=thread?thread.querySelectorAll(".comment"):null;if(comments&&comments.length>0){initializeLoadMore();clearInterval(timer)}else if(attempts>=maxAttempts){clearInterval(timer)}},interval)})();window.openLightbox=function(src){const existing=document.getElementById("lightbox");if(existing)existing.remove();const lb=document.createElement("div");lb.id="lightbox";lb.innerHTML=`
      <div class="lightbox-content" role="dialog" aria-modal="true">
        <button class="lightbox-close" aria-label="Close">&times;</button>
        <img src="${src}" alt="Full Image">
      </div>`;document.body.appendChild(lb);lb.querySelector(".lightbox-close").addEventListener("click",closeLightbox);lb.addEventListener("click",(e)=>{if(e.target===lb)closeLightbox();});document.addEventListener("keydown",escHandler)};function escHandler(e){if(e.key==="Escape")closeLightbox();}
window.closeLightbox=function(){const lb=document.getElementById("lightbox");if(lb)lb.remove();document.removeEventListener("keydown",escHandler)}})
