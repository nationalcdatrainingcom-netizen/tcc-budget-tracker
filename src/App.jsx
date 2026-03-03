import { useState, useEffect, useCallback, useRef } from "react";

// ── GOOGLE SHEETS CONFIG ──────────────────────────────────────────────────────
const SHEETS_CSV_URL = "YOUR_GOOGLE_SHEETS_CSV_URL_HERE";
const APPS_SCRIPT_URL = "YOUR_APPS_SCRIPT_URL_HERE";

// ── STATIC ACCOUNT DEFINITIONS ───────────────────────────────────────────────
const ACCOUNTS = {
  "Fifth Third #8373":   { color: "#2ecc71", short: "5/3"  },
  "Cap One Spark #5581": { color: "#e74c3c", short: "C1"   },
  "Amazon Biz Prime":    { color: "#f39c12", short: "AMZ"  },
  "Cap One Spark #0188": { color: "#9b59b6", short: "C0"   },
};

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

const DEFAULT_CATEGORIES = ["Bank Fee","Benefits","Consulting","Insurance","Licensing",
  "Loan","Marketing","Membership","Misc","Operations","Payroll","Programs",
  "Recruiting","Rent","Security","Software","Supplies","Taxes","Telecom","Utilities"];

// ── SEED BILLS ────────────────────────────────────────────────────────────────
const SEED_BILLS = [
  // Fifth Third #8373
  { id:"53-sbfs",        name:"SBFS LLC (Payroll Svc)",         account:"Fifth Third #8373",   amount:3307.69, weekly:true,  weekDay:"Friday", category:"Payroll" },
  { id:"53-byz",         name:"Byzfunder",                      account:"Fifth Third #8373",   amount:1047.28, weekly:true,  weekDay:"Friday", category:"Loan" },
  { id:"53-kajabi",      name:"Kajabi (TCC)",                   account:"Fifth Third #8373",   amount:499,     dayOfMonth:1,                   category:"Software" },
  { id:"53-megaai1",     name:"Mega AI (1st)",                  account:"Fifth Third #8373",   amount:799,     dayOfMonth:1,                   category:"Software" },
  { id:"53-megaai2",     name:"Mega AI (2nd)",                  account:"Fifth Third #8373",   amount:799,     dayOfMonth:2,                   category:"Software" },
  { id:"53-megaai3",     name:"Mega AI (30th)",                 account:"Fifth Third #8373",   amount:799,     dayOfMonth:30,                  category:"Software" },
  { id:"53-garden",      name:"Garden City ACH",                account:"Fifth Third #8373",   amount:8346,    dayOfMonth:1,                   category:"Operations" },
  { id:"53-humana",      name:"Humana Health Insurance",        account:"Fifth Third #8373",   amount:1868,    dayOfMonth:4,                   category:"Insurance" },
  { id:"53-aep",         name:"Indiana Michigan Power (AEP)",   account:"Fifth Third #8373",   amount:963,     dayOfMonth:2,                   category:"Utilities" },
  { id:"53-semco",       name:"Semco Energy Gas",               account:"Fifth Third #8373",   amount:25,      dayOfMonth:5,                   category:"Utilities" },
  { id:"53-mgas",        name:"Michigan Gas Utilities",         account:"Fifth Third #8373",   amount:300,     dayOfMonth:9,                   category:"Utilities" },
  { id:"53-att1",        name:"AT&T Bill (multiple lines)",     account:"Fifth Third #8373",   amount:577,     dayOfMonth:10,                  category:"Telecom" },
  { id:"53-att2",        name:"AT&T Payment",                   account:"Fifth Third #8373",   amount:118.17,  dayOfMonth:26,                  category:"Telecom" },
  { id:"53-lineleader",  name:"LineLeader",                     account:"Fifth Third #8373",   amount:128.70,  dayOfMonth:8,                   category:"Software" },
  { id:"53-verizon",     name:"Verizon (VZWRLSS)",              account:"Fifth Third #8373",   amount:964,     dayOfMonth:8,                   category:"Telecom" },
  { id:"53-tlg",         name:"TLG Consulting",                 account:"Fifth Third #8373",   amount:940,     dayOfMonth:16,                  category:"Consulting" },
  { id:"53-staffben",    name:"Staff Benefits",                 account:"Fifth Third #8373",   amount:3622,    dayOfMonth:16,                  category:"Benefits" },
  { id:"53-markel",      name:"Markel Insurance",               account:"Fifth Third #8373",   amount:799,     dayOfMonth:16,                  category:"Insurance" },
  { id:"53-marblism",    name:"Marblism.com",                   account:"Fifth Third #8373",   amount:68,      dayOfMonth:15,                  category:"Software" },
  { id:"53-quickbooks",  name:"QuickBooks",                     account:"Fifth Third #8373",   amount:1318,    dayOfMonth:21,                  category:"Software" },
  { id:"53-wmg",         name:"WatchMeGrow / PBJ",              account:"Fifth Third #8373",   amount:243,     dayOfMonth:19,                  category:"Software" },
  { id:"53-playground",  name:"Playground",                     account:"Fifth Third #8373",   amount:130,     dayOfMonth:14,                  category:"Software" },
  { id:"53-adobe",       name:"Adobe",                          account:"Fifth Third #8373",   amount:21.19,   dayOfMonth:29,                  category:"Software" },
  { id:"53-amazon-kids", name:"Amazon Kids+",                   account:"Fifth Third #8373",   amount:7.99,    dayOfMonth:17,                  category:"Misc" },
  { id:"53-culligan",    name:"Culligan Water",                 account:"Fifth Third #8373",   amount:166,     dayOfMonth:22,                  category:"Utilities" },
  { id:"53-westbend",    name:"West Bend Insurance",            account:"Fifth Third #8373",   amount:2792.92, dayOfMonth:29,                  category:"Insurance" },
  { id:"53-acct",        name:"Account Servicing",              account:"Fifth Third #8373",   amount:153.73,  dayOfMonth:5,                   category:"Loan" },
  { id:"53-qvc",         name:"QVC Payment",                    account:"Fifth Third #8373",   amount:12.07,   dayOfMonth:7,                   category:"Misc" },
  { id:"53-venmo",       name:"Venmo Repayment",                account:"Fifth Third #8373",   amount:30,      dayOfMonth:18,                  category:"Misc" },
  { id:"53-rent-fiskars",name:"Fiskars Rent",                   account:"Fifth Third #8373",   amount:12446.58,dayOfMonth:2,                   category:"Rent" },
  { id:"53-fiskars-util",name:"Fiskars Utilities",              account:"Fifth Third #8373",   amount:1490,    dayOfMonth:2,                   category:"Utilities" },
  { id:"53-rent2",       name:"Second Location Rent",           account:"Fifth Third #8373",   amount:15010,   dayOfMonth:1,                   category:"Rent" },
  { id:"53-intuit-tax",  name:"INTUIT Tax Payments",            account:"Fifth Third #8373",   amount:19000,   dayOfMonth:15,                  category:"Taxes",    note:"Variable — est. avg" },
  { id:"53-irs",         name:"IRS USATAXPYMT",                 account:"Fifth Third #8373",   amount:19000,   dayOfMonth:15,                  category:"Taxes",    note:"Variable — multiple/mo" },
  { id:"53-michigan",    name:"State of Michigan Tax",          account:"Fifth Third #8373",   amount:1800,    dayOfMonth:25,                  category:"Taxes" },
  { id:"53-johnson",     name:"Johnson Controls",               account:"Fifth Third #8373",   amount:800,     dayOfMonth:5,                   category:"Operations" },
  { id:"53-jcl",         name:"Johnson Controls Line Item 2",   account:"Fifth Third #8373",   amount:0,       dayOfMonth:5,                   category:"Operations", note:"Enter actual amount when billed" },
  // Cap One #5581
  { id:"c1-ms365",       name:"Microsoft 365",                  account:"Cap One Spark #5581", amount:137.79,  dayOfMonth:1,                   category:"Software" },
  { id:"c1-apple",       name:"Apple iCloud",                   account:"Cap One Spark #5581", amount:27.48,   dayOfMonth:1,                   category:"Software",  note:"Multiple charges ~$10-16/mo" },
  { id:"c1-intech",      name:"IN Technologies Sales",          account:"Cap One Spark #5581", amount:425,     dayOfMonth:3,                   category:"Software" },
  { id:"c1-surveymonkey",name:"SurveyMonkey",                   account:"Cap One Spark #5581", amount:468,     dayOfMonth:1, annual:true, annualMonth:12, category:"Software", note:"Annual — December" },
  { id:"c1-annualfee",   name:"Capital One Annual Fee",         account:"Cap One Spark #5581", amount:95,      dayOfMonth:1, annual:true, annualMonth:1,  category:"Bank Fee", note:"Annual — January" },
  // Amazon Biz Prime
  { id:"amz-rockwater",  name:"Rockwater Associates",           account:"Amazon Biz Prime",    amount:1883.44, dayOfMonth:17,                  category:"Consulting" },
  { id:"amz-juliebartkus",name:"Julie Bartkus",                 account:"Amazon Biz Prime",    amount:400,     dayOfMonth:17,                  category:"Consulting" },
  { id:"amz-inspiredgrowth",name:"Inspired Growth LLC",         account:"Amazon Biz Prime",    amount:1237.50, dayOfMonth:1,                   category:"Consulting" },
  { id:"amz-replit",     name:"Replit",                         account:"Amazon Biz Prime",    amount:25,      dayOfMonth:9,                   category:"Software" },
  { id:"amz-googlews",   name:"Google Workspace (TCC)",         account:"Amazon Biz Prime",    amount:16.80,   dayOfMonth:1,                   category:"Software" },
  { id:"amz-grasshopper",name:"Grasshopper.com",                account:"Amazon Biz Prime",    amount:49.25,   dayOfMonth:3,                   category:"Telecom" },
  { id:"amz-yelp",       name:"Yelp Advertising",               account:"Amazon Biz Prime",    amount:590,     dayOfMonth:2,                   category:"Marketing" },
  { id:"amz-comcast",    name:"Comcast / Xfinity",              account:"Amazon Biz Prime",    amount:350,     dayOfMonth:5,                   category:"Telecom" },
  { id:"amz-bestway",    name:"Bestway Disposal",               account:"Amazon Biz Prime",    amount:384.08,  dayOfMonth:20,                  category:"Operations" },
  { id:"amz-starlink",   name:"Starlink Internet",              account:"Amazon Biz Prime",    amount:330,     dayOfMonth:25,                  category:"Telecom" },
  { id:"amz-taxrock",    name:"TaxRock Subscription",           account:"Amazon Biz Prime",    amount:132.22,  dayOfMonth:11,                  category:"Software" },
  { id:"amz-ringcentral",name:"RingCentral",                    account:"Amazon Biz Prime",    amount:422,     dayOfMonth:8,                   category:"Telecom" },
  { id:"amz-playground", name:"Playground",                     account:"Amazon Biz Prime",    amount:1125,    dayOfMonth:3,                   category:"Software" },
  { id:"amz-borden",     name:"Borden Hauling",                 account:"Amazon Biz Prime",    amount:200,     dayOfMonth:2,                   category:"Operations" },
  { id:"amz-satellite",  name:"Satellite Phone Store",          account:"Amazon Biz Prime",    amount:240.68,  dayOfMonth:5,                   category:"Telecom" },
  { id:"amz-zapier",     name:"Zapier",                         account:"Amazon Biz Prime",    amount:29.99,   dayOfMonth:15,                  category:"Software" },
  { id:"amz-indeed",     name:"Indeed Jobs (est. weekly)",      account:"Amazon Biz Prime",    amount:500,     weekly:true, weekDay:"Monday",   category:"Recruiting" },
  { id:"amz-parrett",    name:"Parrett Business Machines",      account:"Amazon Biz Prime",    amount:310,     dayOfMonth:17,                  category:"Operations" },
  { id:"amz-mckesson",   name:"McKesson Medical Supply",        account:"Amazon Biz Prime",    amount:800,     dayOfMonth:10,                  category:"Supplies",  note:"Variable, multiple/mo" },
  { id:"amz-foodsvc",    name:"Food Service Direct",            account:"Amazon Biz Prime",    amount:1000,    dayOfMonth:7,                   category:"Supplies",  note:"Variable, multiple/mo" },
  { id:"amz-ibm",        name:"IBM Corporation",                account:"Amazon Biz Prime",    amount:105,     dayOfMonth:12,                  category:"Software" },
  { id:"amz-megaai",     name:"Mega AI (AMZ card)",             account:"Amazon Biz Prime",    amount:1198,    dayOfMonth:9,                   category:"Software" },
  { id:"amz-hp-ink",     name:"HP Instant Ink (Jared)",         account:"Amazon Biz Prime",    amount:131.42,  dayOfMonth:6,                   category:"Operations" },
  { id:"amz-eyeclick",   name:"Eyeclick",                       account:"Amazon Biz Prime",    amount:249,     dayOfMonth:24,                  category:"Software" },
  { id:"amz-dramaspot",  name:"The Drama Spot / Wave",          account:"Amazon Biz Prime",    amount:900,     dayOfMonth:3,                   category:"Programs",  note:"Varies $600–$1,200" },
  { id:"amz-kisi",       name:"Kisi Security",                  account:"Amazon Biz Prime",    amount:129.41,  dayOfMonth:8,                   category:"Security" },
  { id:"amz-intellikid", name:"Intellikid Systems",             account:"Amazon Biz Prime",    amount:185,     dayOfMonth:1,                   category:"Software" },
  { id:"amz-claude",     name:"Claude.ai Subscription",         account:"Amazon Biz Prime",    amount:200,     dayOfMonth:5,                   category:"Software" },
  { id:"amz-facebook",   name:"Facebook Ads",                   account:"Amazon Biz Prime",    amount:200,     dayOfMonth:10,                  category:"Marketing", note:"Variable, multiple/mo" },
  { id:"amz-samsclub",   name:"Sam's Club Purchases",           account:"Amazon Biz Prime",    amount:500,     dayOfMonth:5,                   category:"Supplies",  note:"Variable, multiple/mo" },
  // Cap One #0188
  { id:"c0-kajabi",      name:"Kajabi (NCDAT)",                 account:"Cap One Spark #0188", amount:89,      dayOfMonth:25,                  category:"Software" },
  { id:"c0-googlews",    name:"Google Workspace (nileskid)",    account:"Cap One Spark #0188", amount:12,      dayOfMonth:1,                   category:"Software" },
  { id:"c0-quickbooks",  name:"QuickBooks Online (#0188)",      account:"Cap One Spark #0188", amount:115,     dayOfMonth:22,                  category:"Software" },
  { id:"c0-canva",       name:"Canva",                          account:"Cap One Spark #0188", amount:14.99,   dayOfMonth:25,                  category:"Software" },
  { id:"c0-ziprecruiter",name:"ZipRecruiter",                   account:"Cap One Spark #0188", amount:9.99,    dayOfMonth:22,                  category:"Recruiting" },
  { id:"c0-legalzoom",   name:"LegalZoom Books",                account:"Cap One Spark #0188", amount:9.99,    dayOfMonth:15,                  category:"Software" },
  { id:"c0-lara",        name:"SOM LARA CCLB License (MI)",     account:"Cap One Spark #0188", amount:150,     dayOfMonth:4,                   category:"Licensing" },
  { id:"c0-giantos",     name:"Giant OS",                       account:"Cap One Spark #0188", amount:107,     dayOfMonth:4,                   category:"Software",  note:"~2x/mo" },
  { id:"c0-bintris",     name:"BinTris Moving & Storage",       account:"Cap One Spark #0188", amount:283,     dayOfMonth:3,                   category:"Operations" },
  { id:"c0-montessori",  name:"American Montessori Society",    account:"Cap One Spark #0188", amount:378,     dayOfMonth:1,                   category:"Membership" },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmt = v => "$" + Number(v||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const STATUS_KEY = (id,y,m) => `${id}_${y}_${m+1}`;
const uid = () => "custom-" + Date.now() + "-" + Math.random().toString(36).slice(2,7);

function getDaysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }

function billAppearsInMonth(bill,y,m){
  if(bill.discontinued) return false;
  if(bill.annual)   return (bill.annualMonth||1) === m+1;
  if(bill.oneTime)  return bill.oneTimeYear===y && bill.oneTimeMonth===m+1;
  return true; // monthly or weekly always show
}

function getWeekBands(y,m){
  const days = getDaysInMonth(y,m);
  const bands=[], band_=[];
  let band=[];
  for(let d=1;d<=days;d++){
    const date=new Date(y,m,d);
    band.push({day:d,date});
    if(date.getDay()===6||d===days){bands.push(band);band=[];}
  }
  return bands;
}

function billInWeek(bill,y,m,weekDays){
  if(!billAppearsInMonth(bill,y,m)) return false;
  const start=weekDays[0].day, end=weekDays[weekDays.length-1].day;
  if(bill.weekly) return weekDays.some(({date})=>["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][date.getDay()]===bill.weekDay);
  if(bill.dayOfMonth) return bill.dayOfMonth>=start && bill.dayOfMonth<=end;
  return false;
}

const BLANK_FORM = {
  name:"", account:"Fifth Third #8373", amount:"", category:"Software",
  frequency:"monthly", weekDay:"Friday", dayOfMonth:"1", annualMonth:"1",
  oneTimeYear:new Date().getFullYear(), oneTimeMonth:new Date().getMonth()+1, note:"",
};

function billToForm(b){
  let frequency="monthly";
  if(b.weekly)  frequency="weekly";
  if(b.annual)  frequency="annual";
  if(b.oneTime) frequency="oneTime";
  return {
    name:b.name, account:b.account, amount:String(b.amount||""), category:b.category,
    frequency, weekDay:b.weekDay||"Friday", dayOfMonth:String(b.dayOfMonth||1),
    annualMonth:String(b.annualMonth||1),
    oneTimeYear:b.oneTimeYear||new Date().getFullYear(),
    oneTimeMonth:b.oneTimeMonth||new Date().getMonth()+1,
    note:b.note||"",
  };
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App(){
  const today=new Date();
  const [year,setYear]=useState(today.getFullYear());
  const [month,setMonth]=useState(today.getMonth());
  const [view,setView]=useState("month");

  const [customBills,setCustomBills]=useState(()=>{try{return JSON.parse(localStorage.getItem("tcc_custom_bills")||"[]");}catch{return [];}});
  const [overrides,setOverrides]=useState(()=>{try{return JSON.parse(localStorage.getItem("tcc_overrides")||"{}");}catch{return {};}});
  const [statuses,setStatuses]=useState(()=>{try{return JSON.parse(localStorage.getItem("tcc_statuses")||"{}");}catch{return {};}});

  const [accountFilter,setAccountFilter]=useState("ALL");
  const [catFilter,setCatFilter]=useState("ALL");
  const [showDiscontinued,setShowDiscontinued]=useState(false);
  const [addModal,setAddModal]=useState(false);
  const [editBill,setEditBill]=useState(null);
  const [expandedId,setExpandedId]=useState(null);
  const [toast,setToast]=useState(null);

  useEffect(()=>{localStorage.setItem("tcc_custom_bills",JSON.stringify(customBills));},[customBills]);
  useEffect(()=>{localStorage.setItem("tcc_overrides",JSON.stringify(overrides));},[overrides]);
  useEffect(()=>{localStorage.setItem("tcc_statuses",JSON.stringify(statuses));},[statuses]);

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3200);};

  const allBills=[...SEED_BILLS,...customBills].map(b=>({...b,...(overrides[b.id]||{})}));

  const visibleBills=allBills.filter(b=>{
    if(!showDiscontinued&&b.discontinued) return false;
    if(!billAppearsInMonth(b,year,month)) return false;
    if(accountFilter!=="ALL"&&b.account!==accountFilter) return false;
    if(catFilter!=="ALL"&&b.category!==catFilter) return false;
    return true;
  });

  const allCategories=[...new Set([...allBills.map(b=>b.category),...DEFAULT_CATEGORIES])].filter((v,i,a)=>a.indexOf(v)===i).sort();

  const totalDue=visibleBills.reduce((s,b)=>s+Number(b.amount||0),0);
  const totalPaid=visibleBills.filter(b=>statuses[STATUS_KEY(b.id,year,month)]?.paid).reduce((s,b)=>s+Number(b.amount||0),0);
  const totalUnpaid=totalDue-totalPaid;

  const today_d=today.getDate();
  const isCurrentMonth=today.getMonth()===month&&today.getFullYear()===year;

  function billStatus(bill){
    if(bill.discontinued) return "discontinued";
    const key=STATUS_KEY(bill.id,year,month);
    if(statuses[key]?.paid) return "paid";
    if(isCurrentMonth&&bill.dayOfMonth&&bill.dayOfMonth<today_d) return "overdue";
    if(isCurrentMonth&&bill.dayOfMonth&&bill.dayOfMonth<=today_d+5) return "upcoming";
    return "pending";
  }

  function togglePaid(billId){
    const key=STATUS_KEY(billId,year,month);
    setStatuses(s=>({...s,[key]:{...s[key],paid:!s[key]?.paid}}));
  }

  function discontinueBill(billId){
    setOverrides(o=>({...o,[billId]:{...(o[billId]||{}),discontinued:true}}));
    setExpandedId(null);
    showToast("Marked discontinued — hidden from all future months.");
  }

  function restoreBill(billId){
    setOverrides(o=>{const n={...o};if(n[billId]){delete n[billId].discontinued;}return n;});
    showToast("Expense restored ✓");
  }

  function saveAmountOverride(billId,amt){
    setOverrides(o=>({...o,[billId]:{...(o[billId]||{}),amount:Number(amt)}}));
    showToast("Amount updated ✓");
  }

  function addCustomBill(form){
    const bill={id:uid(),name:form.name,account:form.account,amount:Number(form.amount)||0,category:form.category,note:form.note||undefined};
    if(form.frequency==="monthly")  bill.dayOfMonth=Number(form.dayOfMonth)||1;
    if(form.frequency==="weekly")   {bill.weekly=true;bill.weekDay=form.weekDay;}
    if(form.frequency==="annual")   {bill.annual=true;bill.annualMonth=Number(form.annualMonth)||1;bill.dayOfMonth=1;}
    if(form.frequency==="oneTime")  {bill.oneTime=true;bill.oneTimeYear=Number(form.oneTimeYear);bill.oneTimeMonth=Number(form.oneTimeMonth);bill.dayOfMonth=1;}
    setCustomBills(c=>[...c,bill]);
    setAddModal(false);
    showToast(`"${bill.name}" added ✓`);
  }

  function saveEditBill(form){
    const isCustom=customBills.some(b=>b.id===editBill.id);
    if(isCustom){
      setCustomBills(c=>c.map(b=>{
        if(b.id!==editBill.id) return b;
        const u={...b,name:form.name,account:form.account,amount:Number(form.amount)||0,category:form.category,note:form.note||undefined};
        delete u.dayOfMonth;delete u.weekly;delete u.weekDay;delete u.annual;delete u.annualMonth;delete u.oneTime;delete u.oneTimeYear;delete u.oneTimeMonth;
        if(form.frequency==="monthly") u.dayOfMonth=Number(form.dayOfMonth)||1;
        if(form.frequency==="weekly")  {u.weekly=true;u.weekDay=form.weekDay;}
        if(form.frequency==="annual")  {u.annual=true;u.annualMonth=Number(form.annualMonth)||1;u.dayOfMonth=1;}
        if(form.frequency==="oneTime") {u.oneTime=true;u.oneTimeYear=Number(form.oneTimeYear);u.oneTimeMonth=Number(form.oneTimeMonth);u.dayOfMonth=1;}
        return u;
      }));
    } else {
      setOverrides(o=>({...o,[editBill.id]:{...(o[editBill.id]||{}),amount:Number(form.amount)||0,note:form.note||""}}));
    }
    setEditBill(null);
    showToast("Changes saved ✓");
  }

  function deleteCustomBill(billId){
    if(!window.confirm("Delete this expense permanently?")) return;
    setCustomBills(c=>c.filter(b=>b.id!==billId));
    setExpandedId(null);
    showToast("Expense deleted.");
  }

  const prevMonth=()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);};
  const nextMonth=()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);};
  const weeks=getWeekBands(year,month);
  const customBillIds=new Set(customBills.map(b=>b.id));
  const sharedProps={year,month,statuses,billStatus,togglePaid,expandedId,setExpandedId,onEdit:b=>setEditBill(b),onDiscontinue:discontinueBill,onRestore:restoreBill,onDelete:deleteCustomBill,onSaveAmount:saveAmountOverride,customBillIds};

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",fontFamily:"'Georgia',serif",color:"#e8e0d0"}}>

      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#0d1b3e 0%,#1a2d5a 50%,#0d1b3e 100%)",borderBottom:"2px solid #c9a84c",padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
        <div>
          <div style={{fontSize:"10px",letterSpacing:"4px",color:"#c9a84c",textTransform:"uppercase",marginBottom:"2px"}}>The Children's Center</div>
          <h1 style={{margin:0,fontSize:"22px",fontWeight:"bold",color:"#fff",letterSpacing:"1px"}}>Budget Tracker</h1>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <button onClick={prevMonth} style={S.navBtn}>‹</button>
          <div style={{textAlign:"center",minWidth:"140px"}}>
            <div style={{fontSize:"17px",fontWeight:"bold",color:"#fff"}}>{MONTHS[month]}</div>
            <div style={{fontSize:"11px",color:"#c9a84c"}}>{year}</div>
          </div>
          <button onClick={nextMonth} style={S.navBtn}>›</button>
        </div>
        <div style={{display:"flex",gap:"7px",flexWrap:"wrap"}}>
          {["month","week"].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{...S.pill,background:view===v?"#c9a84c":"transparent",color:view===v?"#0d1b3e":"#c9a84c"}}>{v==="month"?"Monthly":"Weekly"}</button>
          ))}
          <button onClick={()=>setAddModal(true)} style={{...S.pill,borderColor:"#2ecc71",color:"#2ecc71",fontWeight:"bold"}}>+ Add Expense</button>
          <button onClick={()=>setShowDiscontinued(s=>!s)} style={{...S.pill,borderColor:showDiscontinued?"#e74c3c":"#333",color:showDiscontinued?"#e74c3c":"#555",fontSize:"10px"}}>
            {showDiscontinued?"Hide Discontinued":"Discontinued"}
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div style={{display:"flex",gap:"1px",background:"#c9a84c"}}>
        {[{label:"Total Due",val:totalDue,bg:"#1a2d5a"},{label:"Paid",val:totalPaid,bg:"#0f3a1e"},{label:"Remaining",val:totalUnpaid,bg:"#3a0f0f"}].map(({label,val,bg})=>(
          <div key={label} style={{flex:1,background:bg,padding:"11px 16px",textAlign:"center"}}>
            <div style={{fontSize:"9px",letterSpacing:"3px",color:"#c9a84c",textTransform:"uppercase"}}>{label}</div>
            <div style={{fontSize:"18px",fontWeight:"bold",color:"#fff",marginTop:"1px"}}>{fmt(val)}</div>
          </div>
        ))}
        <div style={{flex:1,background:"#111827",padding:"11px 16px",textAlign:"center"}}>
          <div style={{fontSize:"9px",letterSpacing:"3px",color:"#c9a84c",textTransform:"uppercase"}}>Progress</div>
          <div style={{marginTop:"5px",background:"#333",borderRadius:"10px",height:"6px",overflow:"hidden"}}>
            <div style={{width:`${totalDue>0?(totalPaid/totalDue)*100:0}%`,height:"100%",background:"linear-gradient(90deg,#2ecc71,#c9a84c)",borderRadius:"10px",transition:"width .4s"}}/>
          </div>
          <div style={{fontSize:"11px",color:"#fff",marginTop:"2px"}}>{totalDue>0?Math.round((totalPaid/totalDue)*100):0}% paid</div>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{padding:"10px 24px",display:"flex",gap:"10px",flexWrap:"wrap",background:"#0f1520",borderBottom:"1px solid #1e2d4a"}}>
        <FilterRow label="Account" value={accountFilter} onChange={setAccountFilter} options={["ALL",...Object.keys(ACCOUNTS)]} colorFn={a=>ACCOUNTS[a]?.color} labelFn={a=>a==="ALL"?"All":ACCOUNTS[a]?.short||a}/>
        <FilterRow label="Category" value={catFilter} onChange={setCatFilter} options={["ALL",...allCategories]} labelFn={a=>a==="ALL"?"All":a}/>
      </div>

      {/* MAIN */}
      <div style={{padding:"20px 24px"}}>
        {view==="month"
          ? <MonthView bills={visibleBills} {...sharedProps}/>
          : <WeekView  bills={visibleBills} weeks={weeks} year={year} month={month} {...sharedProps}/>
        }
      </div>

      {addModal && <BillFormModal title="Add New Expense" initial={BLANK_FORM} allCategories={allCategories} onSave={addCustomBill} onClose={()=>setAddModal(false)}/>}
      {editBill  && <BillFormModal title="Edit Expense" initial={billToForm(editBill)} allCategories={allCategories} isSeedBill={!customBillIds.has(editBill.id)} onSave={saveEditBill} onClose={()=>setEditBill(null)}/>}

      {toast && <div style={{position:"fixed",bottom:"22px",right:"22px",background:toast.type==="error"?"#3a0f0f":"#0f3a1e",border:`1px solid ${toast.type==="error"?"#e74c3c":"#2ecc71"}`,color:"#fff",padding:"10px 16px",borderRadius:"6px",fontSize:"13px",zIndex:1000,animation:"fadeIn .3s ease"}}>{toast.msg}</div>}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#2a3a5a;border-radius:3px}`}</style>
    </div>
  );
}

// ── BILL CARD ─────────────────────────────────────────────────────────────────
function BillCard({bill,year,month,statuses,billStatus,togglePaid,expandedId,setExpandedId,onEdit,onDiscontinue,onRestore,onDelete,onSaveAmount,customBillIds}){
  const [editingAmt,setEditingAmt]=useState(false);
  const [draftAmt,setDraftAmt]=useState(String(bill.amount));
  const amtRef=useRef(null);
  const status=billStatus(bill);
  const acct=ACCOUNTS[bill.account]||{color:"#888",short:"?"};
  const isExpanded=expandedId===bill.id;
  const isCustom=customBillIds.has(bill.id);

  useEffect(()=>{if(editingAmt&&amtRef.current)amtRef.current.focus();},[editingAmt]);

  const statusBg  ={paid:"#0f2a1a",overdue:"#2a0f0f",upcoming:"#1a1600",pending:"#0d1b3e",discontinued:"#0d0d0d"}[status]||"#0d1b3e";
  const borderCol ={paid:"#2ecc7133",overdue:"#e74c3c88",upcoming:"#c9a84c55",pending:"#1e2d4a",discontinued:"#222"}[status]||"#1e2d4a";

  return (
    <div style={{background:statusBg,border:`1px solid ${borderCol}`,borderLeft:`4px solid ${acct.color}`,borderRadius:"6px",padding:"12px 14px",cursor:"pointer",opacity:bill.discontinued?.55:1,transition:"opacity .2s"}}
      onClick={()=>setExpandedId(isExpanded?null:bill.id)}>

      {/* Top row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"3px",flexWrap:"wrap"}}>
            <span style={{fontSize:"9px",padding:"1px 5px",borderRadius:"8px",background:acct.color+"22",color:acct.color,fontWeight:"bold",letterSpacing:"1px",flexShrink:0}}>{acct.short}</span>
            <span style={{fontSize:"9px",color:"#555",letterSpacing:"1px"}}>{bill.category}</span>
            {bill.weekly   && <span style={{fontSize:"9px",color:"#666",fontStyle:"italic"}}>weekly</span>}
            {bill.annual   && <span style={{fontSize:"9px",color:"#c9a84c80",fontStyle:"italic"}}>annual</span>}
            {bill.oneTime  && <span style={{fontSize:"9px",color:"#9b59b680",fontStyle:"italic"}}>one-time</span>}
            {bill.discontinued && <span style={{fontSize:"9px",color:"#e74c3c80",fontStyle:"italic"}}>discontinued</span>}
          </div>
          <div style={{fontSize:"14px",color:bill.discontinued||status==="paid"?"#555":"#e8e0d0",textDecoration:status==="paid"||bill.discontinued?"line-through":"none",lineHeight:1.3}}>
            {bill.name}
          </div>
          <div style={{fontSize:"10px",color:"#444",marginTop:"2px"}}>
            {bill.weekly && `Every ${bill.weekDay}`}
            {bill.dayOfMonth&&!bill.weekly&&!bill.annual&&!bill.oneTime && `Due ${MONTHS[month].slice(0,3)} ${bill.dayOfMonth}`}
            {bill.annual && `Annual · ${MONTHS[(bill.annualMonth||1)-1]}`}
            {bill.oneTime && `${MONTHS[(bill.oneTimeMonth||1)-1]} ${bill.oneTimeYear}`}
          </div>
          {bill.note && <div style={{fontSize:"10px",color:"#555",marginTop:"1px",fontStyle:"italic"}}>{bill.note}</div>}
        </div>

        {/* Amount */}
        <div style={{textAlign:"right",flexShrink:0}}>
          {editingAmt ? (
            <div onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",gap:"3px"}}>
              <span style={{fontSize:"12px",color:"#c9a84c"}}>$</span>
              <input ref={amtRef} value={draftAmt} onChange={e=>setDraftAmt(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"){onSaveAmount(bill.id,draftAmt);setEditingAmt(false);}if(e.key==="Escape")setEditingAmt(false);}}
                style={{width:"80px",background:"#060d1f",border:"1px solid #c9a84c",color:"#fff",padding:"3px 5px",borderRadius:"3px",fontSize:"13px",fontFamily:"inherit",textAlign:"right"}}/>
              <button onClick={e=>{e.stopPropagation();onSaveAmount(bill.id,draftAmt);setEditingAmt(false);}} style={S.mini("#2ecc71")}>✓</button>
              <button onClick={e=>{e.stopPropagation();setEditingAmt(false);}} style={S.mini("#e74c3c")}>✗</button>
            </div>
          ) : (
            <div style={{display:"flex",alignItems:"center",gap:"5px",justifyContent:"flex-end"}}>
              <div style={{fontSize:"16px",fontWeight:"bold",color:status==="paid"?"#2ecc71":"#fff"}}>{fmt(bill.amount)}</div>
              <button title="Edit amount" onClick={e=>{e.stopPropagation();setDraftAmt(String(bill.amount));setEditingAmt(true);}}
                style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:"12px",padding:"0 2px",lineHeight:1,fontFamily:"inherit"}}>✎</button>
            </div>
          )}
          <StatusBadge status={status}/>
        </div>
      </div>

      {/* Expanded panel */}
      {isExpanded && (
        <div style={{marginTop:"10px",paddingTop:"10px",borderTop:"1px solid #1e2d4a"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
            {!bill.discontinued && (
              <button onClick={()=>togglePaid(bill.id)} style={{...S.act,borderColor:status==="paid"?"#e74c3c":"#2ecc71",color:status==="paid"?"#e74c3c":"#2ecc71"}}>
                {status==="paid"?"✗ Unpaid":"✓ Paid"}
              </button>
            )}
            <button onClick={()=>onEdit(bill)} style={{...S.act,borderColor:"#c9a84c",color:"#c9a84c"}}>✎ Edit</button>
            {!bill.discontinued
              ? <button onClick={()=>onDiscontinue(bill.id)} style={{...S.act,borderColor:"#e74c3c55",color:"#e74c3c88"}}>⊘ Discontinue</button>
              : <button onClick={()=>onRestore(bill.id)} style={{...S.act,borderColor:"#2ecc71",color:"#2ecc71"}}>↩ Restore</button>
            }
            {isCustom && <button onClick={()=>onDelete(bill.id)} style={{...S.act,borderColor:"#e74c3c",color:"#e74c3c"}}>🗑 Delete</button>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MONTH VIEW ────────────────────────────────────────────────────────────────
function MonthView({bills,...rest}){
  const sorted=[...bills].sort((a,b)=>(a.dayOfMonth||0)-(b.dayOfMonth||0));
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"10px"}}>
      {sorted.map(b=><BillCard key={b.id} bill={b} {...rest}/>)}
      {sorted.length===0 && <div style={{color:"#333",gridColumn:"1/-1",padding:"40px",textAlign:"center",fontSize:"14px"}}>No expenses match the current filters.</div>}
    </div>
  );
}

// ── WEEK VIEW ─────────────────────────────────────────────────────────────────
function WeekView({bills,year,month,weeks,...rest}){
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>
      {weeks.map((weekDays,wi)=>{
        const wb=bills.filter(b=>billInWeek(b,year,month,weekDays));
        const wTotal=wb.reduce((s,b)=>s+Number(b.amount||0),0);
        return (
          <div key={wi} style={{background:"#0d1420",border:"1px solid #1e2d4a",borderRadius:"8px",overflow:"hidden"}}>
            <div style={{background:"linear-gradient(90deg,#0d1b3e,#1a2d5a)",padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #c9a84c22"}}>
              <span style={{fontSize:"10px",color:"#c9a84c",letterSpacing:"3px",textTransform:"uppercase"}}>Week {wi+1}</span>
              <span style={{color:"#888",fontSize:"12px"}}>{MONTHS[month].slice(0,3)} {weekDays[0].day}–{weekDays[weekDays.length-1].day}</span>
              <span style={{fontSize:"14px",fontWeight:"bold",color:"#fff"}}>{fmt(wTotal)} <span style={{fontSize:"10px",color:"#444"}}>({wb.length})</span></span>
            </div>
            <div style={{padding:"10px 16px",display:"flex",flexDirection:"column",gap:"7px"}}>
              {wb.length===0 ? <div style={{color:"#333",fontSize:"12px",padding:"6px 0"}}>No bills this week</div>
                : wb.map(b=><BillCard key={b.id} bill={b} year={year} month={month} {...rest}/>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── BILL FORM MODAL ───────────────────────────────────────────────────────────
function BillFormModal({title,initial,allCategories,isSeedBill,onSave,onClose}){
  const [f,setF]=useState(initial);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const valid=f.name.trim()&&Number(f.amount)>=0;

  return (
    <Modal title={title} onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:"13px"}}>

        <Field label="Name">
          <input value={f.name} onChange={e=>set("name",e.target.value)} style={S.inp} placeholder="Expense name" disabled={isSeedBill}/>
          {isSeedBill && <div style={{fontSize:"10px",color:"#555",marginTop:"2px"}}>Built-in expense — only amount & note can be changed here.</div>}
        </Field>

        {!isSeedBill && (
          <Field label="Account">
            <select value={f.account} onChange={e=>set("account",e.target.value)} style={S.inp}>
              {Object.keys(ACCOUNTS).map(a=><option key={a}>{a}</option>)}
            </select>
          </Field>
        )}

        <Field label="Amount ($)">
          <input type="number" min="0" step="0.01" value={f.amount} onChange={e=>set("amount",e.target.value)} style={S.inp} placeholder="0.00"/>
        </Field>

        <Field label="Category">
          <select value={f.category} onChange={e=>set("category",e.target.value)} style={S.inp} disabled={isSeedBill}>
            {allCategories.map(c=><option key={c}>{c}</option>)}
          </select>
        </Field>

        {!isSeedBill && (
          <Field label="Frequency">
            <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
              {[["monthly","Monthly"],["weekly","Weekly"],["annual","Yearly"],["oneTime","One-Time"]].map(([val,lbl])=>(
                <button key={val} type="button" onClick={()=>set("frequency",val)}
                  style={{...S.pill,fontSize:"12px",padding:"5px 12px",background:f.frequency===val?"#c9a84c":"transparent",color:f.frequency===val?"#0d1b3e":"#c9a84c"}}>
                  {lbl}
                </button>
              ))}
            </div>
          </Field>
        )}

        {!isSeedBill && f.frequency==="monthly" && (
          <Field label="Day of Month">
            <input type="number" min="1" max="31" value={f.dayOfMonth} onChange={e=>set("dayOfMonth",e.target.value)} style={{...S.inp,width:"80px"}}/>
          </Field>
        )}
        {!isSeedBill && f.frequency==="weekly" && (
          <Field label="Day of Week">
            <select value={f.weekDay} onChange={e=>set("weekDay",e.target.value)} style={S.inp}>
              {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d=><option key={d}>{d}</option>)}
            </select>
          </Field>
        )}
        {!isSeedBill && f.frequency==="annual" && (
          <Field label="Month it occurs">
            <select value={f.annualMonth} onChange={e=>set("annualMonth",e.target.value)} style={S.inp}>
              {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
            </select>
          </Field>
        )}
        {!isSeedBill && f.frequency==="oneTime" && (
          <div style={{display:"flex",gap:"10px"}}>
            <Field label="Month">
              <select value={f.oneTimeMonth} onChange={e=>set("oneTimeMonth",Number(e.target.value))} style={S.inp}>
                {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
              </select>
            </Field>
            <Field label="Year">
              <input type="number" value={f.oneTimeYear} onChange={e=>set("oneTimeYear",Number(e.target.value))} style={{...S.inp,width:"90px"}}/>
            </Field>
          </div>
        )}

        <Field label="Note (optional)">
          <input value={f.note} onChange={e=>set("note",e.target.value)} style={S.inp} placeholder="e.g. Variable amount"/>
        </Field>

        <div style={{display:"flex",gap:"8px",justifyContent:"flex-end",paddingTop:"4px"}}>
          <button onClick={onClose} style={{...S.act,borderColor:"#333",color:"#666"}}>Cancel</button>
          <button onClick={()=>valid&&onSave(f)} style={{...S.act,borderColor:valid?"#2ecc71":"#333",color:valid?"#2ecc71":"#444",cursor:valid?"pointer":"not-allowed",minWidth:"80px"}}>Save</button>
        </div>
      </div>
    </Modal>
  );
}

// ── SMALL UI COMPONENTS ───────────────────────────────────────────────────────
function StatusBadge({status}){
  const map={paid:{l:"PAID",c:"#2ecc71"},overdue:{l:"OVERDUE",c:"#e74c3c"},upcoming:{l:"DUE SOON",c:"#c9a84c"},pending:{l:"PENDING",c:"#444"},discontinued:{l:"DISCONTINUED",c:"#333"}};
  const {l,c}=map[status]||map.pending;
  return <span style={{fontSize:"9px",letterSpacing:"1px",padding:"1px 5px",borderRadius:"3px",border:`1px solid ${c}55`,background:c+"22",color:c,fontWeight:"bold",display:"inline-block",marginTop:"2px"}}>{l}</span>;
}

function FilterRow({label,value,onChange,options,colorFn,labelFn}){
  return (
    <div style={{display:"flex",gap:"4px",alignItems:"center",flexWrap:"wrap"}}>
      <span style={{fontSize:"9px",color:"#444",letterSpacing:"2px",textTransform:"uppercase",marginRight:"3px"}}>{label}:</span>
      {options.map(o=>{
        const col=colorFn?.(o);
        const active=value===o;
        return <button key={o} onClick={()=>onChange(o)} style={{padding:"2px 8px",borderRadius:"20px",border:`1px solid ${active?(col||"#c9a84c"):"#222"}`,background:active?(col||"#c9a84c")+"22":"transparent",color:active?(col||"#c9a84c"):"#555",fontSize:"10px",cursor:"pointer",fontFamily:"inherit"}}>{labelFn(o)}</button>;
      })}
    </div>
  );
}

function Field({label,children}){
  return (
    <div>
      <div style={{fontSize:"9px",color:"#c9a84c",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"4px"}}>{label}</div>
      {children}
    </div>
  );
}

function Modal({children,onClose,title}){
  return (
    <div style={{position:"fixed",inset:0,background:"#000b",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:"16px"}} onClick={onClose}>
      <div style={{background:"#0d1b3e",border:"1px solid #c9a84c",borderRadius:"8px",maxWidth:"500px",width:"100%",maxHeight:"90vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid #1e2d4a",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2 style={{margin:0,color:"#c9a84c",fontSize:"16px"}}>{title}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:"20px",lineHeight:1}}>×</button>
        </div>
        <div style={{padding:"18px 20px"}}>{children}</div>
      </div>
    </div>
  );
}

// ── STYLE CONSTANTS ───────────────────────────────────────────────────────────
const S={
  navBtn:{background:"transparent",border:"1px solid #c9a84c33",color:"#c9a84c",width:"32px",height:"32px",borderRadius:"50%",cursor:"pointer",fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center"},
  pill:{padding:"6px 14px",borderRadius:"4px",border:"1px solid #c9a84c",fontFamily:"inherit",cursor:"pointer",fontSize:"11px",fontWeight:"600",letterSpacing:"1px"},
  act:{padding:"6px 10px",borderRadius:"4px",border:"1px solid",background:"transparent",fontFamily:"inherit",cursor:"pointer",fontSize:"11px",textAlign:"center"},
  inp:{width:"100%",background:"#060d1f",border:"1px solid #1e2d4a",color:"#e8e0d0",padding:"7px 9px",borderRadius:"4px",fontSize:"13px",fontFamily:"inherit"},
  mini:(col)=>({background:"none",border:`1px solid ${col}`,color:col,borderRadius:"3px",cursor:"pointer",padding:"2px 5px",fontSize:"10px",fontFamily:"inherit"}),
};
