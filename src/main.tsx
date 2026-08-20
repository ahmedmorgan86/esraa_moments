import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ArrowLeft, ArrowRight, Plus, Minus, Package, LayoutDashboard, Box, Users, Tag, Settings, Sparkles, Instagram, MessageCircle, ChevronDown, LogIn, LogOut, Check, Trash2, ShieldCheck, Heart, Sun, Moon, MapPin, CreditCard, Send, Store, Music } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef } from 'react';
import { supabase } from './lib/supabase';
import './styles.css';

const product1='/images/Gemini_Generated_Image_wl5xnywl5xnywl5x.jpeg';
const hero='/images/Gemini_Generated_Image_ehh0puehh0puehh0.jpeg';
const touch1='/images/Gemini_Generated_Image_hlt09bhlt09bhlt0.jpeg';
const touch2='/images/Gemini_Generated_Image_etc9loetc9loetc9.jpeg';

type Product={id:string;name:string;category:string;price:number;stock:number;image:string;desc:string;featured?:boolean};
type CartItem=Product&{qty:number};
type Design={occasion:string;type:string;qty:number;color:string;name:string;date:string;extras:string};

const seed:Product[]=[
{id:'p1',name:'توزيعة سبوع الدبدوب الملكي',category:'سبوع',price:35,stock:120,image:'/images/Gemini_Generated_Image_wh7xokwh7xokwh7x.jpeg',desc:'مجسم دبدوب فاخر مع زجاجة مسك أبيض وكرت ترحيب بالطفل.',featured:true},
{id:'p2',name:'توزيعة سبوع الحوت والسبحة',category:'سبوع',price:30,stock:150,image:'/images/Gemini_Generated_Image_sligebsligebslig.jpeg',desc:'عداد تسبيح رقمي مع شوكولاتة مستوردة في علبة أنيقة.',featured:true},
{id:'p3',name:'توزيعات حنة الورود المخملية',category:'حنة',price:28,stock:80,image:'/images/Gemini_Generated_Image_wl5xnywl5xnywl5x.jpeg',desc:'كرت فاخر بتصميم يدوي مع شوكولاتة قلب حمراء وزهور مجففة.',featured:true},
{id:'p4',name:'مانيكير وفراشة الحنة ثلاثية الأبعاد',category:'حنة',price:26,stock:60,image:'/images/Gemini_Generated_Image_vh32ruvh32ruvh32.jpeg',desc:'طلاء أظافر بألوان أنثوية مع أجنحة فراشة مفرغة يدوياً.',featured:true},
{id:'p5',name:'مروحة ورقية مذهبة للزفاف',category:'زفاف',price:35,stock:100,image:'/images/Gemini_Generated_Image_w92zqyw92zqyw92z.jpeg',desc:'مروحة ورقية بتطريز وردي وطباعة أسماء العروسين بماء الذهب.',featured:true},
{id:'p6',name:'بوكس زفاف الورد والذهب',category:'زفاف',price:50,stock:20,image:'/images/Gemini_Generated_Image_ehh0puehh0puehh0.jpeg',desc:'بوكس هدية كبير بلمسات روز جولد وزهور طبيعية.',featured:true},
{id:'p7',name:'عقد اللؤلؤ والخطوبة الكلاسيكي',category:'خطوبة',price:36,stock:60,image:'/images/Gemini_Generated_Image_p97awfp97awfp97a.jpeg',desc:'كرت عريض برسمة خاتم الخطوبة مع سوار أنيق من اللؤلؤ.',featured:true},
{id:'p8',name:'بوكس الأكريليك المذهب للخطوبة',category:'خطوبة',price:42,stock:40,image:'/images/Gemini_Generated_Image_p2yjpfp2yjpfp2yj.jpeg',desc:'علبة أكريليك فاخرة بداخلها شوكولاتة ومسك مع شريطة ذهبية.',featured:true},
{id:'p9',name:'مسك الختام والعود الملكي',category:'كتب كتاب',price:38,stock:70,image:'/images/Gemini_Generated_Image_vkeew8vkeew8vkee.jpeg',desc:'زجاجة عطرية كريستالية مع كرت شكر وتقدير لضيوف كتب الكتاب.',featured:true},
{id:'p10',name:'شموع الصويا الطبيعية باللؤلؤ',category:'كتب كتاب',price:45,stock:50,image:'/images/Gemini_Generated_Image_q2ritlq2ritlq2ri.jpeg',desc:'شمعة صويا معطرة بعبير الياسمين مزينة بحبات لؤلؤ وشريط ساتان.',featured:true},
];

const occasions=['سبوع','خطوبة','حنة','كتب كتاب','زفاف'];
const money=(n:number)=>`${n.toLocaleString('ar-EG')} ج.م`;
const getLocal=(k:string, fallback:any)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??fallback}catch{return fallback}};

const ease=[.25,.46,.45,.94] as const;

function Animate({children, delay=0, className='', ...props}:any){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:'-80px'});
  return <motion.div ref={ref} initial={{opacity:0,y:50,filter:'blur(8px)'}} animate={inView?{opacity:1,y:0,filter:'blur(0px)'}:{opacity:0,y:50,filter:'blur(8px)'}} transition={{duration:.8,delay,ease:[.22,1,.36,1]}} className={className} {...props}>{children}</motion.div>;
}

function AnimateScale({children, delay=0, className='', ...props}:any){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:'-40px'});
  return <motion.div ref={ref} initial={{opacity:0,scale:.85,rotate:-2}} animate={inView?{opacity:1,scale:1,rotate:0}:{opacity:0,scale:.85,rotate:-2}} transition={{duration:.7,delay,ease:[.22,1,.36,1]}} className={className} {...props}>{children}</motion.div>;
}

function StaggerContainer({children, className='', ...props}:any){
  return <motion.div initial="hidden" whileInView="visible" viewport={{once:true,margin:'-60px'}} variants={{visible:{transition:{staggerChildren:.15,delayChildren:.1}}}} className={className} {...props}>{children}</motion.div>;
}

function StaggerItem({children, className='', ...props}:any){
  return <motion.div variants={{hidden:{opacity:0,y:40,scale:.96},visible:{opacity:1,y:0,scale:1,transition:{duration:.6,ease:[.22,1,.36,1]}}}} className={className} {...props}>{children}</motion.div>;
}

const pageVariants={initial:{opacity:0,y:30,filter:'blur(6px)'},animate:{opacity:1,y:0,filter:'blur(0px)',transition:{duration:.6,ease:[.22,1,.36,1]}},exit:{opacity:0,y:-20,filter:'blur(4px)',transition:{duration:.35,ease:[.22,1,.36,1]}}};

function useProducts(){
  const [items,setItems]=useState<Product[]>(seed);
  useEffect(()=>{let active=true;(async()=>{if(!supabase)return;const {data}=await supabase.from('products').select('id,name,price,stock,image_url,description,categories(name)').eq('is_active',true);if(active&&data?.length)setItems(data.map((p:any)=>({id:p.id,name:p.name,category:p.categories?.name||'مناسبات خاصة',price:Number(p.price),stock:p.stock,image:p.image_url||product1,desc:p.description||''})))})();return()=>{active=false}},[]);
  return items;
}

function App(){
  const products=useProducts();
  const [cart,setCart]=useState<CartItem[]>(()=>getLocal('em-cart',[]));
  const [wish,setWish]=useState<string[]>(()=>getLocal('em-wish',[]));
  const [dark,setDark]=useState(()=>localStorage.getItem('em-dark')==='1');
  const [menu,setMenu]=useState(false);
  const location=useLocation();

  useEffect(()=>localStorage.setItem('em-cart',JSON.stringify(cart)),[cart]);
  useEffect(()=>localStorage.setItem('em-wish',JSON.stringify(wish)),[wish]);
  useEffect(()=>{localStorage.setItem('em-dark',dark?'1':'0');document.documentElement.dataset.theme=dark?'dark':'light'},[dark]);
  useEffect(()=>{window.scrollTo(0,0)},[location.pathname]);

  const add=(p:Product)=>setCart(c=>{const x=c.find(i=>i.id===p.id);return x?c.map(i=>i.id===p.id?{...i,qty:Math.min(i.qty+1,p.stock)}:i):[...c,{...p,qty:1}]});
  const remove=(id:string)=>setCart(c=>c.filter(x=>x.id!==id));
  const change=(id:string,d:number)=>setCart(c=>c.map(x=>x.id===id?{...x,qty:Math.max(1,Math.min(x.qty+d,x.stock))}:x));

  return(
    <div className="app">
      <Header cartCount={cart.reduce((s,x)=>s+x.qty,0)} menu={menu} setMenu={setMenu} dark={dark} setDark={setDark}/>
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <Routes location={location}>
            <Route path="/" element={<Home products={products} add={add} wish={wish} setWish={setWish}/>}/>
            <Route path="/shop" element={<ShopPage products={products} add={add} wish={wish} setWish={setWish}/>}/>
            <Route path="/product/:id" element={<ProductPage products={products} add={add} wish={wish} setWish={setWish}/>}/>
            <Route path="/custom" element={<Customizer/>}/>
            <Route path="/cart" element={<CartPage cart={cart} change={change} remove={remove}/>}/>
            <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart}/>}/>
            <Route path="/track" element={<Tracking/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/admin/*" element={<Admin/>}/>
          </Routes>
        </motion.div>
      </AnimatePresence>
      <Footer/>
    </div>
  );
}

function Header({cartCount,menu,setMenu,dark,setDark}:{cartCount:number;menu:boolean;setMenu:(v:boolean)=>void;dark:boolean;setDark:(v:boolean)=>void}){
  return(
    <motion.header className="header" initial={{y:-82}} animate={{y:0}} transition={{duration:.6,ease}}>
      <button className="icon mobile" onClick={()=>setMenu(!menu)}><motion.div whileTap={{rotate:90}} transition={{duration:.2}}>{menu?<X/>:<Menu/>}</motion.div></button>
      <Link to="/" className="brand">
        <motion.span className="brandMark" whileHover={{scale:1.08}} transition={{duration:.4}}><img src="/images/logo.jpeg" alt="Esraa Moments"/></motion.span>
        <span><b>ESRAA</b><small>Moments</small></span>
      </Link>
      <nav className={menu?'nav open':'nav'}>
        <Link to="/shop">المتجر</Link>
        <Link to="/custom">صممي توزيعتك</Link>
        <a href="/#about">عن إسراء</a>
        <a href="/#faq">الأسئلة</a>
        <Link to="/track">تتبعي طلبك</Link>
      </nav>
      <div className="actions">
        <motion.button className="icon" onClick={()=>setDark(!dark)} whileHover={{rotate:180}} transition={{duration:.4}}>{dark?<Sun/>:<Moon/>}</motion.button>
        <Link className="icon badge" to="/cart">
          <motion.div whileHover={{scale:1.15}} whileTap={{scale:.9}}><ShoppingBag/></motion.div>
          {cartCount>0&&<motion.i initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:500,damping:15}}>{cartCount}</motion.i>}
        </Link>
      </div>
    </motion.header>
  );
}

function Home({products,add,wish,setWish}:{products:Product[];add:(p:Product)=>void;wish:string[];setWish:(x:string[])=>void}){
  return(
    <>
      <section className="hero">
        <div className="heroCopy">
          <motion.span className="eyebrow" initial={{opacity:0,x:40,filter:'blur(10px)'}} animate={{opacity:1,x:0,filter:'blur(0px)'}} transition={{duration:.8,delay:.3,ease:[.22,1,.36,1]}}>HANDCRAFTED • PERSONALIZED • TIMELESS</motion.span>
          <motion.h1 initial={{opacity:0,y:50,filter:'blur(10px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} transition={{duration:1,delay:.5,ease:[.22,1,.36,1]}}>تفاصيل صغيرة…<br/><em>تصنع لحظات</em> لا تُنسى.</motion.h1>
          <motion.p initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:.8,delay:.7,ease:[.22,1,.36,1]}}>توزيعات وهدايا مصممة بعناية لكل مناسبة، من أول فكرة حتى آخر تفصيلة.</motion.p>
          <motion.div className="cta" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:.9,ease:[.22,1,.36,1]}}>
            <motion.div whileHover={{y:-5,boxShadow:'0 12px 35px rgba(196,115,106,.3)'}} whileTap={{scale:.95}}>
              <Link className="btn primary" to="/shop">اكتشفي التوزيعات <ArrowLeft/></Link>
            </motion.div>
            <motion.div whileHover={{y:-5,boxShadow:'0 12px 35px rgba(26,21,18,.12)'}} whileTap={{scale:.95}}>
              <Link className="btn ghost" to="/custom">صممي توزيعتك <Sparkles/></Link>
            </motion.div>
          </motion.div>
        </div>
        <div className="heroImage">
          <motion.img src={hero} initial={{scale:1.25,opacity:0,filter:'saturate(0) brightness(1.2)'}} animate={{scale:1,opacity:1,filter:'saturate(.9) brightness(1)'}} transition={{duration:1.4,delay:.2,ease:[.22,1,.36,1]}}/>
          <motion.div className="floating" initial={{opacity:0,y:40,backdropFilter:'blur(0px)'}} animate={{opacity:1,y:0,backdropFilter:'blur(20px)'}} transition={{duration:1,delay:1.1,ease:[.22,1,.36,1]}} whileHover={{y:-6,boxShadow:'0 25px 60px rgba(0,0,0,.12)'}}>مصنوعة بحب<br/><small>For your moments</small></motion.div>
        </div>
      </section>

      <section className="section">
        <div className="sectionHead">
          <Animate><div><span className="eyebrow">YOUR OCCASION</span><h2>اختاري مناسبتك</h2></div></Animate>
          <Animate delay={.1}><p>لكل لحظة طابعها الخاص، ولكل طابع تفاصيله.</p></Animate>
        </div>
        <StaggerContainer className="occasionGrid">
          {occasions.map((o,i)=>(
            <StaggerItem key={o}>
              <motion.div whileHover={{x:-12,backgroundColor:'var(--paper)'}} transition={{duration:.3}}>
                <Link to={`/shop?cat=${encodeURIComponent(o)}`} className="occasion">
                  <span>0{i+1}</span><b>{o}</b><ArrowLeft/>
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="section" id="shop">
        <div className="sectionHead">
          <Animate><div><span className="eyebrow">CURATED COLLECTION</span><h2>اختياراتنا المميزة</h2></div></Animate>
          <Animate delay={.1}><Link className="textLink" to="/shop">شاهدي المجموعة كاملة <ArrowLeft/></Link></Animate>
        </div>
        <StaggerContainer className="productGrid">
          {products.filter(x=>x.featured).map(p=>(
            <StaggerItem key={p.id}><ProductCard p={p} add={add} wish={wish} setWish={setWish}/></StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="custom section">
        <Animate><div className="customIntro">
          <span className="eyebrow">BESPOKE STUDIO</span>
          <h2>صممي توزيعتك<br/><em>من الصفر.</em></h2>
          <p>اختاري كل تفصيلة بنفسك، وسنحوّل فكرتك إلى قطعة مصممة لمناسبتك.</p>
          <motion.div whileHover={{y:-3}} whileTap={{scale:.96}}><Link className="btn primary" to="/custom">ابدئي التصميم <Sparkles/></Link></motion.div>
        </div></Animate>
        <div className="studioHero">
          <AnimateScale><div className="previewCard"><span>ESRAA</span><b>لحظتك</b><small>مصممة خصيصًا لكِ</small></div></AnimateScale>
        </div>
      </section>

      <section className="section touches" id="about">
        <Animate><div>
          <span className="eyebrow">OUR TOUCH</span>
          <h2>لمساتنا <em>الفريدة</em></h2>
          <p>كل توزيعة تحكي قصة. نستخدم أجود الخامات وأرقى التصاميم لنصنع لحظات لا تُنسى لمناسبتك.</p>
          <p style={{marginTop:15}}>من اختيار الورود الطبيعية حتى آخر طبقة ذهبي، كل تفصيلة مصممة بعناية.</p>
        </div></Animate>
        <div className="touchImages">
          <Animate delay={.1}><motion.img src={touch1} whileHover={{scale:1.03}} transition={{duration:.5}}/></Animate>
          <Animate delay={.2}><motion.img src={touch2} whileHover={{scale:1.05}} transition={{duration:.5}}/></Animate>
        </div>
      </section>

      <section className="section faq" id="faq">
        <Animate><div className="sectionHead"><div><span className="eyebrow">FAQ</span><h2>الأسئلة الشائعة</h2></div></div></Animate>
        <StaggerContainer>
          {[
            {q:'كم يستغرق تجهيز الطلب؟',a:'عادة من 3 إلى 5 أيام عمل، ثم الشحن خلال 24-48 ساعة.'},
            {q:'ما الحد الأدنى للطلب؟',a:'الحد الأدنى 15 قطعة للتوزيعات المخصصة.'},
            {q:'هل يمكن معاينة العينة؟',a:'نعم، نرسل صور وفيديو للعينة الأولى قبل البدء بالكمية.'},
            {q:'ما طرق الدفع؟',a:'البطاقات الائتمانية، فودافون كاش، إنستاباي، والدفع عند الاستلام.'}
          ].map((f,i)=>(
            <StaggerItem key={i}>
              <details>
                <summary>{f.q}<motion.span animate={{rotate:0}}><ChevronDown/></motion.span></summary>
                <motion.p initial={{height:0,opacity:0}} whileInView={{height:'auto',opacity:1}} transition={{duration:.4}}>{f.a}</motion.p>
              </details>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <motion.div className="final" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{duration:.8}}>
        <span className="eyebrow">LET'S CREATE</span>
        <h2>-transforming moments into memories-</h2>
        <motion.div whileHover={{y:-4,boxShadow:'0 15px 40px rgba(0,0,0,.25)'}} whileTap={{scale:.96}}>
          <Link className="btn light" to="/custom">ابدئي رحلتك <Sparkles/></Link>
        </motion.div>
      </motion.div>
    </>
  );
}

function ProductCard({p,add,wish,setWish}:{p:Product;add:(p:Product)=>void;wish:string[];setWish:(x:string[])=>void}){
  const liked=wish.includes(p.id);
  return(
    <motion.article className="product" whileHover={{y:-8,boxShadow:'0 20px 50px rgba(50,30,20,.12)'}} transition={{duration:.4}}>
      <Link to={`/product/${p.id}`} className="productImage">
        <motion.img src={p.image} whileHover={{scale:1.06}} transition={{duration:.7}}/>
        <motion.button type="button" className="wish" whileHover={{scale:1.2}} whileTap={{scale:.8}} onClick={e=>{e.preventDefault();setWish(liked?wish.filter(x=>x!==p.id):[...wish,p.id])}}><Heart fill={liked?'var(--rose)':'none'} color={liked?'var(--rose)':'currentColor'} size={20}/></motion.button>
      </Link>
      <div className="productBody">
        <small>{p.category}</small>
        <Link to={`/product/${p.id}`}><h3>{p.name}</h3></Link>
        <p>{p.desc}</p>
        <div className="productFoot">
          <strong>{money(p.price)}</strong>
          <motion.button className="miniBtn" whileHover={{scale:1.05,backgroundColor:'var(--ink)',color:'var(--bg)'}} whileTap={{scale:.95}} onClick={()=>add(p)}>أضيفي للسلة <Plus/></motion.button>
        </div>
      </div>
    </motion.article>
  );
}

function ShopPage({products,add,wish,setWish}:{products:Product[];add:(p:Product)=>void;wish:string[];setWish:(x:string[])=>void}){
  const [q,setQ]=useState('');
  const [cat,setCat]=useState(new URLSearchParams(location.search).get('cat')||'');
  const filtered=products.filter(p=>(!cat||p.category===cat)&&(p.name+p.category+p.desc).includes(q));
  return(
    <motion.section className="section page" {...pageVariants}>
      <div className="sectionHead">
        <Animate><div><span className="eyebrow">SHOP</span><h2>كل التوزيعات</h2></div></Animate>
        <Animate delay={.1}><div className="search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="ابحثي عن توزيعة…"/></div></Animate>
      </div>
      <Animate><div className="filters">
        <motion.button className={!cat?'active':''} onClick={()=>setCat('')} whileHover={{scale:1.05}} whileTap={{scale:.95}}>الكل</motion.button>
        {occasions.map(o=><motion.button className={cat===o?'active':''} key={o} onClick={()=>setCat(o)} whileHover={{scale:1.05}} whileTap={{scale:.95}}>{o}</motion.button>)}
      </div></Animate>
      <StaggerContainer className="productGrid">
        {filtered.map(p=><StaggerItem key={p.id}><ProductCard p={p} add={add} wish={wish} setWish={setWish}/></StaggerItem>)}
      </StaggerContainer>
      {!filtered.length&&<Animate><div className="empty"><Search/><h3>مفيش نتائج مطابقة</h3><p>جربي كلمة بحث أو مناسبة مختلفة.</p></div></Animate>}
    </motion.section>
  );
}

function ProductPage({products,add,wish,setWish}:{products:Product[];add:(p:Product)=>void;wish:string[];setWish:(x:string[])=>void}){
  const {id}=useParams();
  const p=products.find(x=>x.id===id)||products[0];
  return(
    <motion.section className="section productPage" {...pageVariants}>
      <Animate><div className="detailImage"><motion.img src={p.image} whileHover={{scale:1.05}} transition={{duration:.8}}/></div></Animate>
      <div className="detailCopy">
        <Animate delay={.1}><span className="eyebrow">{p.category}</span></Animate>
        <Animate delay={.2}><h1>{p.name}</h1></Animate>
        <Animate delay={.3}><p className="lead">{p.desc}</p></Animate>
        <Animate delay={.35}><strong className="detailPrice">{money(p.price)}</strong></Animate>
        <Animate delay={.4}><div className="stockNote"><ShieldCheck/> متاح حاليًا • {p.stock} قطعة</div></Animate>
        <Animate delay={.45}><div className="detailActions">
          <motion.button className="btn primary" whileHover={{y:-3}} whileTap={{scale:.96}} onClick={()=>add(p)}>أضيفي للسلة <ShoppingBag/></motion.button>
          <motion.button className="btn ghost" whileHover={{y:-3}} whileTap={{scale:.96}} onClick={()=>setWish(wish.includes(p.id)?wish.filter(x=>x!==p.id):[...wish,p.id])}>{wish.includes(p.id)?<><Heart fill="var(--rose)" color="var(--rose)" size={18}/> محفوظ</>:<><Heart size={18}/> حفظ للمفضلة</>}</motion.button>
        </div></Animate>
        <Animate delay={.5}><div className="detailsList">
          <p><b>التخصيص:</b> متاح من خلال استوديو التصميم.</p>
          <p><b>التغليف:</b> تغليف هدايا أنيق.</p>
          <p><b>الطلب:</b> الحد الأدنى يختلف حسب التصميم.</p>
        </div></Animate>
      </div>
    </motion.section>
  );
}

function Customizer(){
  const [step,setStep]=useState(0);
  const [form,setForm]=useState<Design>({occasion:'زفاف',type:'علبة',qty:30,color:'آيفوري وذهبي',name:'',date:'',extras:''});
  const [sent,setSent]=useState(false);
  const steps=['المناسبة','التوزيعة','التفاصيل','المراجعة'];
  const submit=async()=>{if(supabase){const {error}=await supabase.from('custom_designs').insert({reference:`CD-${Date.now().toString().slice(-7)}`,occasion:form.occasion,favor_type:form.type,quantity:form.qty,palette:form.color,inscription:form.name,event_date:form.date||null,extras:form.extras});if(error){alert(error.message);return}}else localStorage.setItem('em-design',JSON.stringify(form));setSent(true)};

  return(
    <motion.section className="custom section page" {...pageVariants}>
      <div className="customIntro">
        <span className="eyebrow">BESPOKE STUDIO</span>
        <h2>صممي توزيعتك<br/><em>من الصفر.</em></h2>
        <p>اختاري كل تفصيلة بنفسك، وسنحوّل فكرتك إلى قطعة مصممة لمناسبتك.</p>
        <div className="progress">{steps.map((s,i)=><motion.span className={i===step?'active':''} key={s} animate={i===step?{scale:[1,1.1,1]}:{}} transition={{duration:.4}}><i>{i+1}</i>{s}</motion.span>)}</div>
      </div>
      <div className="studio">
        <div className="studioPreview">
          <AnimateScale><div className="previewCard"><span>ESRAA</span><motion.b key={form.name} initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} transition={{duration:.4}}>{form.name||'اسم مناسبتك'}</motion.b><small>{form.date||'تاريخ المناسبة'}</small></div></AnimateScale>
        </div>
        <div className="studioForm">
          <span className="stepTitle">الخطوة {step+1} من 4</span>
          {sent?(
            <motion.div className="success" initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} transition={{type:'spring',stiffness:300}}>
              <Check/><h3>تم استلام طلب التصميم</h3>
              <p>احتفظي بالتفاصيل، ويمكنك متابعة الطلب بعد إنشاء Order من صفحة الدفع.</p>
              <Link className="btn primary" to="/shop">استكشفي المنتجات</Link>
            </motion.div>
          ):(
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}} transition={{duration:.3}}>
                {step===0&&<Choice title="اختاري المناسبة" values={occasions} value={form.occasion} onChange={v=>setForm({...form,occasion:v})}/>}
                {step===1&&<Choice title="نوع التوزيعة" values={['علبة','برطمان','كيس فاخر','بوكس هدية']} value={form.type} onChange={v=>setForm({...form,type:v})}/>}
                {step===2&&<div className="formGrid">
                  <label>الكمية<input type="number" min="1" value={form.qty} onChange={e=>setForm({...form,qty:+e.target.value})}/></label>
                  <label>اللون<select value={form.color} onChange={e=>setForm({...form,color:e.target.value})}><option>آيفوري وذهبي</option><option>وردي ذهبي</option><option>أبيض وفضي</option><option>كحلي وذهبي</option></select></label>
                  <label className="wide">الاسم المطبوع<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="مثال: مريم & أحمد"/></label>
                  <label className="wide">التاريخ<input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label>
                </div>}
                {step===3&&<div className="summary">
                  <p><b>المناسبة:</b> {form.occasion}</p>
                  <p><b>التوزيعة:</b> {form.type}</p>
                  <p><b>الكمية:</b> {form.qty}</p>
                  <p><b>اللون:</b> {form.color}</p>
                  <p><b>الاسم:</b> {form.name||'---'}</p>
                  <p><b>التاريخ:</b> {form.date||'---'}</p>
                </div>}
              </motion.div>
            </AnimatePresence>
          )}
          {!sent&&<div className="stepNav">
            {step>0&&<motion.button className="btn ghost" whileTap={{scale:.95}} onClick={()=>setStep(step-1)}><ArrowRight/> السابق</motion.button>}
            {step<steps.length-1?<motion.button className="btn primary" whileHover={{y:-2}} whileTap={{scale:.95}} onClick={()=>setStep(step+1)}>التالي <ArrowLeft/></motion.button>:<motion.button className="btn primary" whileHover={{y:-2}} whileTap={{scale:.95}} onClick={submit}>إرسال الطلب <Sparkles/></motion.button>}
          </div>}
        </div>
      </div>
    </motion.section>
  );
}

function Choice({title,values,value,onChange}:{title:string;values:string[];value:string;onChange:(v:string)=>void}){
  return(
    <div>
      <h3>{title}</h3>
      <div className="choices">
        {values.map(v=>(
          <motion.button className={v===value?'selected':''} key={v} onClick={()=>onChange(v)} whileHover={{scale:1.02}} whileTap={{scale:.98}} animate={v===value?{backgroundColor:'var(--ink)',color:'var(--bg)'}:{}}>
            {v}<ChevronDown/>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function CartPage({cart,change,remove}:{cart:CartItem[];change:(id:string,d:number)=>void;remove:(id:string)=>void}){
  const sub=cart.reduce((s,x)=>s+x.price*x.qty,0);
  const shipping=sub>=500||!sub?0:25;
  return(
    <motion.section className="section page cartPage" {...pageVariants}>
      <div className="sectionHead"><div><span className="eyebrow">YOUR BAG</span><h2>سلة الطلب</h2></div></div>
      {!cart.length?(
        <Animate><div className="empty"><ShoppingBag/><h3>السلة فاضية</h3><Link className="btn primary" to="/shop">شاهدي التوزيعات</Link></div></Animate>
      ):(
        <div className="cartLayout">
          <div>
            <AnimatePresence>
              {cart.map(i=>(
                <motion.div className="cartItem" key={i.id} layout initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30,height:0}} transition={{duration:.3}}>
                  <img src={i.image}/>
                  <div><Link to={`/product/${i.id}`}><b>{i.name}</b></Link><small>{money(i.price)}</small>
                    <div className="qty">
                      <motion.button whileTap={{scale:.8}} onClick={()=>change(i.id,-1)}><Minus/></motion.button>
                      <span>{i.qty}</span>
                      <motion.button whileTap={{scale:.8}} onClick={()=>change(i.id,1)}><Plus/></motion.button>
                    </div>
                  </div>
                  <motion.button className="remove" whileHover={{scale:1.2,color:'#a44'}} whileTap={{scale:.8}} onClick={()=>remove(i.id)}><Trash2/></motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <Animate><aside className="summaryCard">
            <h3>ملخص الطلب</h3>
            <div><span>المنتجات</span><b>{money(sub)}</b></div>
            <div><span>الشحن</span><b>{shipping?money(shipping):'مجاني'}</b></div>
            <hr/>
            <div className="grand"><span>الإجمالي</span><b>{money(sub+shipping)}</b></div>
            <motion.div whileHover={{y:-3}} whileTap={{scale:.96}}><Link className="btn primary full" to="/checkout">إتمام الطلب <ArrowLeft/></Link></motion.div>
          </aside></Animate>
        </div>
      )}
    </motion.section>
  );
}

function Checkout({cart,setCart}:{cart:CartItem[];setCart:(x:CartItem[])=>void}){
  const nav=useNavigate();
  const [form,setForm]=useState({name:'',phone:'',email:'',city:'',address:'',occasion:'',date:'',notes:'',payment:'cod'});
  const [done,setDone]=useState<string|null>(null);
  const sub=cart.reduce((s,x)=>s+x.price*x.qty,0);
  const shipping=sub>=500?0:25;

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();if(!cart.length)return;
    const orderNo=`EM-${Date.now().toString().slice(-8)}`;
    if(supabase){
      const {data,error}=await supabase.from('orders').insert({order_number:orderNo,customer_name:form.name,customer_phone:form.phone,customer_email:form.email,city:form.city,address:form.address,occasion:form.occasion,event_date:form.date||null,notes:form.notes,payment_method:form.payment,subtotal:sub,shipping_fee:shipping,total:sub+shipping}).select().single();
      if(error){alert(error.message);return}
      await supabase.from('order_items').insert(cart.map(i=>({order_id:data.id,product_id:i.id,name:i.name,unit_price:i.price,quantity:i.qty,total:i.price*i.qty})));
    }else{localStorage.setItem('em-last-order',JSON.stringify({orderNo,...form,total:sub+shipping,items:cart}))}
    setCart([]);setDone(orderNo);
  };

  if(done) return(
    <motion.section className="section page successPage" {...pageVariants}>
      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:200}}><Check/></motion.div>
      <h1>تم استلام طلبك</h1>
      <p>رقم الطلب: <b>{done}</b></p>
      <p>احتفظي بالرقم لمتابعة حالة الطلب.</p>
      <motion.div whileHover={{y:-3}}><Link className="btn primary" to={`/track?order=${done}`}><MapPin size={18}/> تتبع الطلب</Link></motion.div>
    </motion.section>
  );

  return(
    <motion.section className="section page" {...pageVariants}>
      <div className="sectionHead"><div><span className="eyebrow">CHECKOUT</span><h2>إتمام الطلب</h2></div></div>
      <form className="checkout" onSubmit={submit}>
        <div className="checkoutFields">
          <Animate><label>الاسم الكامل<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label></Animate>
          <Animate delay={.05}><label>رقم الهاتف<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label></Animate>
          <Animate delay={.1}><label>البريد الإلكتروني<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label></Animate>
          <Animate delay={.15}><label>المدينة<select value={form.city} onChange={e=>setForm({...form,city:e.target.value})}><option>القاهرة</option><option>الإسكندرية</option><option>الجيزة</option><option>أخرى</option></select></label></Animate>
          <Animate delay={.2}><label className="wide">العنوان بالتفصيل<textarea required value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label></Animate>
          <Animate delay={.25}><label>المناسبة<select value={form.occasion} onChange={e=>setForm({...form,occasion:e.target.value})}>{occasions.map(o=><option key={o}>{o}</option>)}</select></label></Animate>
          <Animate delay={.3}><label>الملاحظات<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="أي ملاحظات إضافية…"/></label></Animate>
        </div>
        <Animate><div className="summaryCard">
          <h3>ملخص الطلب</h3>
          <div><span>المنتجات</span><b>{money(sub)}</b></div>
          <div><span>الشحن</span><b>{shipping?money(shipping):'مجاني'}</b></div>
          <hr/>
          <div className="grand"><span>الإجمالي</span><b>{money(sub+shipping)}</b></div>
          <div style={{margin:'15px 0'}}>
            {(['cod','fawry','card'] as const).map(p=>(
              <motion.button key={p} type="button" className={form.payment===p?'btn primary':'btn'} style={{width:'100%',marginBottom:8}} whileTap={{scale:.97}} onClick={()=>setForm({...form,payment:p})}>
                {p==='cod'?'الدفع عند الاستلام':p==='fawry'?'فودافون كاش':<><CreditCard size={16}/> البطاقات الائتمانية</>}
              </motion.button>
            ))}
          </div>
          <motion.div whileHover={{y:-3}} whileTap={{scale:.96}}><button className="btn primary full" type="submit"><Send size={18}/> تأكيد الطلب</button></motion.div>
        </div></Animate>
      </form>
    </motion.section>
  );
}

function Tracking(){
  const q=new URLSearchParams(location.search).get('order');
  const [order,setOrder]=useState<any>(null);
  const [input,setInput]=useState(q||'');
  const search=async()=>{if(supabase){const {data}=await supabase.from('orders').select('*').eq('order_number',input).maybeSingle();setOrder(data)}else{const x=getLocal('em-last-order',null);setOrder(x?.orderNo===input?x:null)}};

  return(
    <motion.section className="section page" {...pageVariants}>
      <div className="sectionHead"><div><span className="eyebrow">ORDER TRACKING</span><h2>تتبعي طلبك</h2></div></div>
      <div className="tracking">
        <Animate><div className="search big"><Search/><input value={input} onChange={e=>setInput(e.target.value)} placeholder="EM-XXXXXXXX"/><motion.button className="btn primary" whileHover={{y:-2}} whileTap={{scale:.95}} onClick={search}>بحث</motion.button></div></Animate>
        {order?(
          <Animate><motion.div className="trackingCard" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}}>
            <Package/>
            <h3>{order.order_number||order.orderNo}</h3>
            <p>الحالة الحالية: <b>{order.status||'قيد المراجعة'}</b></p>
            <div className="timeline">
              {['قيد المراجعة','مؤكد','قيد التنفيذ','تم الشحن','تم التسليم'].map((s,i)=>(
                <motion.span key={s} className={i===0?'active':''} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.1}}><i>{i+1}</i>{s}</motion.span>
              ))}
            </div>
          </motion.div></Animate>
        ):<p className="muted">أدخلي رقم الطلب لعرض آخر حالة متاحة.</p>}
      </div>
    </motion.section>
  );
}

function Login(){
  const nav=useNavigate();
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [mode,setMode]=useState<'login'|'signup'>('login');
  const [error,setError]=useState('');
  const submit=async(e:React.FormEvent)=>{e.preventDefault();if(!supabase){localStorage.setItem('em-admin-demo','1');nav('/admin');return}const r=mode==='login'?await supabase.auth.signInWithPassword({email,password}):await supabase.auth.signUp({email,password});if(r.error)setError(r.error.message);else nav('/admin')};

  return(
    <motion.section className="section page authPage" {...pageVariants}>
      <AnimateScale><div className="authCard">
        <LogIn/>
        <span className="eyebrow">ACCOUNT</span>
        <h1>{mode==='login'?'تسجيل الدخول':'إنشاء حساب'}</h1>
        <form onSubmit={submit}>
          <input type="email" required placeholder="البريد الإلكتروني" value={email} onChange={e=>setEmail(e.target.value)}/>
          <input type="password" required placeholder="كلمة المرور" value={password} onChange={e=>setPassword(e.target.value)}/>
          <motion.button className="btn primary full" whileHover={{y:-2}} whileTap={{scale:.96}}><LogIn size={18}/> {mode==='login'?'دخول':'إنشاء حساب'}</motion.button>
        </form>
        {error&&<p className="error">{error}</p>}
        <button className="textButton" onClick={()=>setMode(mode==='login'?'signup':'login')}>{mode==='login'?'ليس لديك حساب؟ أنشئي حسابًا':'لديك حساب؟ سجلي الدخول'}</button>
      </div></AnimateScale>
    </motion.section>
  );
}

function Admin(){
  const [tab,setTab]=useState('dashboard');
  const [logged,setLogged]=useState(localStorage.getItem('em-admin-demo')==='1');
  const [orders,setOrders]=useState<any[]>([]);
  const [products,setProducts]=useState(seed);

  useEffect(()=>{(async()=>{if(supabase){const a=await supabase.from('orders').select('*').order('created_at',{ascending:false}).limit(20);if(a.data)setOrders(a.data);const b=await supabase.from('products').select('id,name,price,stock,is_active');if(b.data)setProducts(b.data.map((x:any)=>({...x,image:product1,category:'',desc:''})))}})()},[]);

  if(!logged)return(
    <motion.section className="section page authPage" {...pageVariants}>
      <AnimateScale><div className="authCard">
        <LayoutDashboard/>
        <h1>لوحة التحكم</h1>
        <p>هذه المنطقة محمية. سجلي الدخول بحساب الإدارة.</p>
        <Link className="btn primary full" to="/login"><LogIn size={18}/> تسجيل الدخول</Link>
      </div></AnimateScale>
    </motion.section>
  );

  const tabs=[['dashboard','لوحة التحكم',LayoutDashboard],['products','المنتجات',Box],['orders','الطلبات',Package],['customers','العملاء',Users],['coupons','الكوبونات',Tag],['settings','الإعدادات',Settings]] as const;

  return(
    <div className="admin">
      <aside>
        <div className="adminBrand">ESRAA<small>ADMIN CONSOLE</small></div>
        {tabs.map(([k,l,I])=><motion.button className={tab===k?'active':''} key={k} onClick={()=>setTab(k)} whileHover={{x:-5}}><I/>{l}</motion.button>)}
        <button className="logout" onClick={async()=>{if(supabase)await supabase.auth.signOut();localStorage.removeItem('em-admin-demo');setLogged(false)}}><LogOut/> خروج</button>
      </aside>
      <main className="adminMain">
        <div className="adminTop"><div><span className="eyebrow">ESRAA MOMENTS</span><h1>{tab==='dashboard'?'نظرة عامة':tab==='products'?'المنتجات':tab==='orders'?'الطلبات':tab==='customers'?'العملاء':tab==='coupons'?'الكوبونات':'الإعدادات'}</h1></div>        <Link className="btn ghost" to="/"><Store size={16}/> عرض المتجر</Link></div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-15}} transition={{duration:.3}}>
            {tab==='dashboard'&&<Dashboard orders={orders} products={products}/>}
            {tab==='products'&&<ProductsAdmin products={products}/>}
            {tab==='orders'&&<OrdersAdmin orders={orders}/>}
            {tab==='customers'&&<div className="panel"><h3>العملاء</h3><p className="muted">قريباً — إدارة شاملة للعملاء.</p></div>}
            {tab==='coupons'&&<div className="panel"><h3>الكوبونات</h3><p className="muted">قريباً — إنشاء وإدارة كوبونات الخصم.</p></div>}
            {tab==='settings'&&<SettingsAdmin/>}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function Dashboard({orders,products}:{orders:any[];products:any[]}){
  const sales=orders.reduce((s,o)=>s+Number(o.total||0),0);
  return(
    <>
      <StaggerContainer className="stats">
        {[['المبيعات',money(sales),'من الطلبات المسجلة'],['الطلبات',orders.length,'آخر الطلبات'],['المنتجات',products.length,'في الكتالوج'],['تنبيه المخزون',products.filter(p=>p.stock<20).length,'منتجات منخفضة']].map(([l,v,s],i)=>(
          <StaggerItem key={i}><motion.div className="stat" whileHover={{y:-5}} transition={{duration:.3}}><span>{l}</span><strong>{String(v)}</strong><small>{String(s)}</small></motion.div></StaggerItem>
        ))}
      </StaggerContainer>
      <div className="adminGrid">
        <div className="panel"><h3>آخر الطلبات</h3>{orders.slice(0,8).map(o=><div className="orderRow" key={o.id}><b>{o.order_number}</b><span>{o.customer_name}</span><span>{money(Number(o.total||0))}</span></div>)}</div>
        <div className="panel"><h3>المخزون</h3>{products.slice(0,8).map(p=><div className="stock" key={p.id}><span>{p.name}</span><div><i style={{width:`${Math.min(100,(p.stock/150)*100)}%`}}/></div><small>{p.stock}</small></div>)}</div>
      </div>
    </>
  );
}

function ProductsAdmin({products}:{products:any[]}){
  return(
    <div className="panel">
      <div className="panelHead"><h3>إدارة المنتجات</h3><motion.button className="btn primary" whileHover={{scale:1.05}} whileTap={{scale:.95}}>إضافة منتج <Plus/></motion.button></div>
      <div className="table"><div className="tr th"><span>المنتج</span><span>السعر</span><span>المخزون</span><span>الحالة</span></div>
        {products.map(p=><div className="tr" key={p.id}><span>{p.name}</span><span>{money(Number(p.price))}</span><span>{p.stock}</span><span>{p.is_active===false?'مخفي':'نشط'}</span></div>)}
      </div>
    </div>
  );
}

function OrdersAdmin({orders}:{orders:any[]}){
  return(
    <div className="panel">
      <div className="panelHead"><h3>إدارة الطلبات</h3><span className="muted">{orders.length} طلب</span></div>
      <div className="table"><div className="tr th"><span>الطلب</span><span>العميل</span><span>الإجمالي</span><span>الحالة</span></div>
        {orders.map(o=><div className="tr" key={o.id}><span>{o.order_number}</span><span>{o.customer_name}</span><span>{money(Number(o.total||0))}</span><span>{o.status}</span></div>)}
      </div>
    </div>
  );
}

function SettingsAdmin(){
  const [whatsapp,setWhatsapp]=useState('');
  const [shipping,setShipping]=useState('25');
  const save=async()=>{if(supabase)await supabase.from('settings').upsert({key:'store',value:{whatsapp,shippingFee:Number(shipping)}});alert('تم حفظ الإعدادات')};
  return(
    <div className="panel settingsPanel">
      <h3>إعدادات المتجر</h3>
      <label>رقم واتساب<input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="201xxxxxxxxx"/></label>
      <label>رسوم الشحن<input value={shipping} onChange={e=>setShipping(e.target.value)}/></label>
      <motion.button className="btn primary" whileHover={{y:-2}} whileTap={{scale:.96}} onClick={save}><Check size={18}/> حفظ الإعدادات</motion.button>
    </div>
  );
}

function Footer(){
  return(
    <Animate><footer>
      <div><div className="brand"><span className="brandMark"><img src="/images/logo.jpeg" alt="Esraa Moments"/></span><span><b>ESRAA</b><small>Moments</small></span></div><p>تفاصيل صغيرة… تصنع لحظات لا تُنسى.</p></div>
      <div><b>روابط</b><Link to="/shop"><Store size={16}/> المتجر</Link><Link to="/custom"><Sparkles size={16}/> التخصيص</Link><Link to="/track"><MapPin size={16}/> تتبع الطلب</Link></div>
      <div><b>تواصل</b><a href="https://www.instagram.com/esraamomentsstore" target="_blank"><Instagram/> Instagram</a><a href="https://www.tiktok.com/@esraamomentsstore" target="_blank"><Music/> TikTok</a><a href="https://wa.me/" target="_blank"><MessageCircle/> WhatsApp</a></div>
    </footer></Animate>
  );
}

createRoot(document.getElementById('root')!).render(<BrowserRouter><App/></BrowserRouter>);
