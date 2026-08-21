import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ShoppingBag, Search, Menu, X, ArrowLeft, ArrowRight, Plus, Minus,
  Package, LayoutDashboard, Box, Users, Tag, Settings, Sparkles, Instagram,
  MessageCircle, ChevronDown, LogIn, LogOut, Check, Trash2, ShieldCheck,
  Heart, Sun, Moon, MapPin, CreditCard, Send, Store, Music, Edit3, Eye,
  BarChart3, TrendingUp, Clock, Truck, Star, Filter, Download, Globe,
  Lock, Palette, Gift, Calendar, Phone, Mail, Hash, DollarSign,
  AlertTriangle, ChevronRight, ChevronLeft, Image as ImageIcon, RotateCw, Upload, FileText
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { supabase } from './lib/supabase';
import './styles.css';

type Product = { id: string; name: string; name_en?: string; category: string; price: number; stock: number; image: string; desc: string; desc_en?: string; featured?: boolean; isStartingFrom?: boolean };
type Lang = 'ar' | 'en';
let uiLang: Lang = 'ar';
const prodName = (p: Product) => (uiLang === 'en' && p.name_en ? p.name_en : p.name);
const prodDesc = (p: Product) => (uiLang === 'en' && p.desc_en ? p.desc_en : p.desc);
type CartItem = Product & { qty: number };
type Design = { occasion: string; type: string; qty: number; color: string; name: string; date: string; extras: string };
type Coupon = { id: string; code: string; discount: number; type: 'percent' | 'fixed'; maxUsage: number; usageCount: number; minOrder: number; expiry: string; active: boolean };
type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  city: string;
  address: string;
  occasion: string;
  notes: string;
  payment_method: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: string;
  payment_status: string;
  payment_proof?: string;
  created_at: string;
};
type Customer = { name: string; email: string; phone: string; ordersCount: number; totalSpent: number };

const occasions = [
  'سبوع', 'خطوبة', 'حنة', 'كتب كتاب', 'زفاف',
  'عيد ميلاد', 'تخرج', 'استقبال مولود', 'رمضان', 'عيد', 'توزيعات شركات'
];

const occasionEn: Record<string, string> = {
  'سبوع': 'Baby Shower', 'خطوبة': 'Engagement', 'حنة': 'Henna Night', 'كتب كتاب': 'Katb Ktab',
  'زفاف': 'Wedding', 'عيد ميلاد': 'Birthday', 'تخرج': 'Graduation', 'استقبال مولود': 'New Baby',
  'رمضان': 'Ramadan', 'عيد': 'Eid', 'توزيعات شركات': 'Corporate Gifts'
};
const occLabel = (o: string) => (uiLang === 'en' ? occasionEn[o] || o : o);
const favorTypeEn: Record<string, string> = { 'علبة': 'Box', 'برطمان': 'Jar', 'كيس فاخر': 'Luxury Bag', 'بوكس هدية': 'Gift Box' };
const colorEn: Record<string, string> = { 'آيفوري وذهبي': 'Ivory & Gold', 'وردي ذهبي': 'Rose Gold', 'أبيض وفضي': 'White & Silver', 'كحلي وذهبي': 'Navy & Gold' };
const cityEn: Record<string, string> = { 'القاهرة': 'Cairo', 'الإسكندرية': 'Alexandria', 'الجيزة': 'Giza', 'المنصورة': 'Mansoura', 'أخرى': 'Other' };
const pickLabel = (v: string, map: Record<string, string>) => (uiLang === 'en' ? map[v] || v : v);

const translations = {
  ar: {
    store: 'المتجر',
    designStudio: 'صممي توزيعتك',
    aboutUs: 'من نحن',
    faq: 'الأسئلة الشائعة',
    track: 'تتبعي طلبك',
    login: 'تسجيل الدخول',
    cart: 'سلة الطلب',
    browseShop: 'تصفحي المتجر',
    heroEyebrow: 'HANDCRAFTED • PERSONALIZED • TIMELESS',
    heroTitle: 'تفاصيل صغيرة…\nتصنع لحظات لا تُنسى.',
    heroTitleA: 'تفاصيل صغيرة…', heroTitleEm: 'تصنع لحظات', heroTitleB: 'لا تُنسى.',
    heroDesc: 'توزيعات وهدايا مصممة بعناية لكل مناسبة، من أول فكرة حتى آخر تفصيلة.',
    exploreFavors: 'اكتشفي التوزيعات',
    designYourWay: 'صممي توزيعتك',
    chooseOccasion: 'اختاري مناسبتك',
    occasionsSub: 'لكل لحظة طابعها الخاص، ولكل طابع تفاصيله.',
    curated: 'اختياراتنا المميزة',
    allCollection: 'شاهدي المجموعة كاملة',
    bestSellers: 'الأكثر مبيعاً',
    viewAll: 'شاهدي الكل',
    stayConnected: 'ابقي على تواصل',
    subscribeText: 'سجّلي للحصول على أحدث التصاميم والعروض الحصرية مباشرة في بريدك.',
    subscribeBtn: 'اشتركي',
    faqTitle: 'الأسئلة الشائعة',
    letsCreate: 'LET\'S CREATE',
    transforming: '-transforming moments into memories-',
    startJourney: 'ابدئي رحلتك',
    searchPlaceholder: 'ابحثي عن توزيعة…',
    addToCart: 'أضيفي للسلة',
    addShort: 'أضيفي',
    saved: 'محفوظة',
    save: 'حفظ',
    productDetails: 'تفاصيل المنتج',
    checkout: 'إتمام الطلب',
    orderSummary: 'ملخص الطلب',
    subtotal: 'المنتجات',
    shipping: 'الشحن',
    free: 'مجاني',
    total: 'الإجمالي',
    confirmOrder: 'تأكيد الطلب',
    paymentMethod: 'طريقة الدفع',
    cod: 'الدفع عند الاستلام',
    instapay: 'إنستاباي / محفظة إلكترونية',
    card: 'بطاقة ائتمانية',
    paymentInstructionsTitle: 'تعليمات الدفع والتحويل',
    paymentInstructionsText: 'يرجى التحويل عبر إنستاباي أو المحفظة الإلكترونية إلى رقم: 01000000000 ثم رفع صورة الإيصال أدناه.',
    uploadProof: 'رفع إيصال الدفع',
    paymentStatus: 'حالة الدفع',
    pageTitle: 'Esraa Moments — تفاصيل تصنع لحظات',
    cartEmptyTitle: 'السلة فاضية',
    cartEmptySub: 'ابدئي التسوق واكتشفي توزيعاتنا المميزة',
    freeShippingHint: 'شحن مجاني للطلبات فوق 500 ج.م',
    madeWithLove: 'مصنوعة بحب',
    forYourMoments: 'For your moments',
    storyEyebrow: 'OUR STORY',
    storyTitle: 'لمساتنا',
    storyTitleAccent: 'الفريدة',
    storyQuote: 'كل توزيعة تحكي قصة. نستخدم أجود الخامات وأرقى التصاميم لنصنع لحظات لا تُنسى لمناسبتك.',
    storyText: 'من اختيار الورود الطبيعية حتى آخر طبقة ذهبي، كل تفصيلة مصممة بعناية. نؤمن بأن اللحظات الجميلة تستحق تفاصيل لا تُنسى.',
    yourEmail: 'بريدك الإلكتروني',
    shopTitle: 'كل التوزيعات',
    sortAll: 'الكل', sortPriceLow: 'الأقل سعراً', sortPriceHigh: 'الأعلى سعراً', sortNewest: 'الأحدث',
    allPill: 'الكل',
    productsCountWord: 'منتج',
    noResultsTitle: 'مفيش نتائج مطابقة',
    noResultsSub: 'جربي كلمة بحث أو مناسبة مختلفة.',
    available: 'متوفر', pieces: 'قطعة', outStock: 'نفذ من المخزون',
    qty: 'الكمية',
    details: [
      { l: 'التخصيص', t: 'متاح من خلال استوديو التصميم.' },
      { l: 'التغليف', t: 'تغليف هدايا أنيق مع شريط ساتان.' },
      { l: 'الطلب', t: 'الحد الأدنى يختلف حسب التصميم.' },
      { l: 'الشحن', t: 'مجاني للطلبات فوق 500 ج.م.' }
    ],
    relatedTitle: 'منتجات مشابهة',
    custTitle: 'صممي توزيعتك', custTitleAccent: 'من الصفر.',
    custSub: 'اختاري كل تفصيلة بنفسك، وسنحوّل فكرتك إلى قطعة مصممة لمناسبتك.',
    custSteps: ['المناسبة', 'التوزيعة', 'التفاصيل', 'المراجعة'],
    stepWord: 'الخطوة', ofWord: 'من',
    favorType: 'نوع التوزيعة',
    favorTypes: ['علبة', 'برطمان', 'كيس فاخر', 'بوكس هدية'],
    colors: ['آيفوري وذهبي', 'وردي ذهبي', 'أبيض وفضي', 'كحلي وذهبي'],
    printedName: 'الاسم المطبوع', namePlaceholder: 'مثال: مريم & أحمد',
    dateLabel: 'التاريخ', extraNotes: 'ملاحظات إضافية', extrasPlaceholder: 'أي تفاصيل إضافية…',
    previewNamePh: 'اسم مناسبتك', previewDatePh: 'تاريخ المناسبة', previewHint: 'المعاينة بتتحدث لحظياً مع كل اختيار',
    sOccasion: 'المناسبة', sType: 'التوزيعة', sQty: 'الكمية', sColor: 'اللون', sName: 'الاسم', sDate: 'التاريخ', sNotes: 'ملاحظات',
    piecesWord: 'قطعة',
    prevBtn: 'السابق', nextBtn: 'التالي', sendDesign: 'إرسال الطلب',
    designReceivedT: 'تم استلام طلب التصميم',
    designReceivedP: 'احتفظي بالتفاصيل، ويمكنك متابعة الطلب بعد إنشاء طلب من صفحة الدفع.',
    exploreProducts: 'استكشفي المنتجات',
    checkoutTitle: 'إرسال طلب التوزيعات',
    fullName: 'الاسم الكامل', phoneNum: 'رقم الهاتف', emailLabel: 'البريد الإلكتروني',
    cityLabel: 'المدينة', cities: ['القاهرة', 'الإسكندرية', 'الجيزة', 'المنصورة', 'أخرى'],
    addressLabel: 'العنوان بالتفصيل للشحن',
    occasionField: 'المناسبة',
    notesLabel: 'ملاحظات التخصيص أو الأسماء المطلوب طباعتها',
    notesPlaceholder: 'مثال: الأسماء المطلوب طباعتها، الألوان، أو أي تعليمات خاصة…',
    paymentPreferred: 'طريقة الدفع المفضلة (تتم بعد تأكيد السعر والشحن)',
    payInstapay: 'إنستاباي (InstaPay)', payWallet: 'محفظة إلكترونية (Mobile Wallet)',
    estimated: '(تقديري)',
    couponPlaceholder: 'كود الخصم', applyBtn: 'تطبيق',
    errInvalidCoupon: 'كوبون غير صالح', errExpiredCoupon: 'انتهت صلاحية الكوبون', errUsedUpCoupon: 'تم استنفاد عدد مرات استخدام الكوبون', errMinOrderPrefix: 'الحد الأدنى',
    couponAppliedPrefix: 'كوبون', discountWord: 'خصم',
    discountLabel: 'الخصم', grandEst: 'الإجمالي (تقديري)',
    finalPriceNote: '* السعر النهائي ومصاريف الشحن يتم تأكيدها من قِبل الإدارة بعد مراجعة تفاصيل التخصيص والكمية.',
    submitOrder: 'إرسال طلب التوزيعات',
    successTitle: 'تم استلام طلبك بنجاح', orderNoWord: 'رقم الطلب:',
    successDesc: 'سيقوم فريق إسراء مومنتس بمراجعة تفاصيل التخصيص والكمية وتأكيد السعر النهائي ومصاريف الشحن معك قريباً.',
    trackAndPay: 'تتبع الطلب والدفع',
    trackTitle: 'تتبعي طلبك والدفع',
    orderPlaceholder: 'أدخلي رقم الطلب (EM-XXXXXXXX)', searchBtn: 'بحث',
    customerWord: 'العميل:', orderStatusLabelK: 'حالة الطلب',
    totalFinalLabel: 'المبلغ الإجمالي النهائي', shippingConfirmedLabel: 'مصاريف الشحن المؤكدة', addressShort: 'العنوان',
    payInstrNote: 'بعد التحويل، قومي برفع صورة إيصال التحويل أدناه ليقوم فريق الإدارة بالتحقق واعتماد الطلب فوراً.',
    proofDone: 'تم رفع الإيصال بنجاح', proofUnderReview: 'قيد التحقق من الإدارة', proofFileFallback: 'إيصال التحويل',
    statusFlow: ['قيد المراجعة', 'تم تأكيد السعر', 'بانتظار الدفع', 'تم رفع إيصال الدفع', 'تم التحقق والإنتاج', 'تم الشحن', 'مكتمل'],
    notFoundTitle: 'لم يتم العثور على طلب', notFoundSub: 'جربي رقم طلب مختلف.',
    enterNoTitle: 'أدخلي رقم الطلب', enterNoSub: 'لعرض تفاصيل السعر، الشحن، وحالة الدفع.',
    loginTitle: 'تسجيل الدخول', signupTitle: 'إنشاء حساب',
    passwordLabel: 'كلمة المرور', loginBtn: 'دخول', signupBtn: 'إنشاء الحساب',
    noAccount: 'ليس لديك حساب؟ أنشئي حسابًا', haveAccount: 'لديك حساب؟ سجلي الدخول',
    signupNotice: 'تم إنشاء الحساب. حسابات جديدة تُسجَّل كعميل تلقائياً وليس كإدارة — لازم مسؤول يمنحك صلاحية admin من جدول user_roles.',
    noRoleError: 'هذا الحساب لا يملك صلاحية الدخول للوحة الإدارة.',
    quickLinks: 'روابط سريعة', contactUs: 'التواصل', location: 'القاهرة، مصر',
    rights: 'جميع الحقوق محفوظة.',
    footerDesc: 'تفاصيل صغيرة تصنع لحظات لا تُنسى. توزيعات وهدايا مخصصة لكل مناسباتك السعيدة في مصر.',
    admChecking: 'جارِ التحقق من الصلاحية…',
    admPanel: 'لوحة التحكم',
    admProtected: 'هذه المنطقة محمية. سجلي الدخول بحساب إدارة يملك صلاحية admin أو staff.',
    tabOverview: 'نظرة عامة', tabProducts: 'المنتجات', tabOrders: 'الطلبات والأسعار', tabCustomers: 'العملاء', tabCoupons: 'الكوبونات', tabSettings: 'الإعدادات',
    viewStore: 'عرض المتجر', logout: 'خروج',
    stSales: 'المبيعات', stSalesSub: 'إجمالي المبيعات المؤكدة', stOrders: 'الطلبات', stOrdersSub: 'طلبات العملاء', stProducts: 'المنتجات', stProductsSub: 'في الكتالوج', stCustomers: 'العملاء', stCustomersSub: 'عملاء فريدون',
    recentOrdersHead: 'آخر الطلبات وتأكيد الأسعار', ordersWord: 'طلب',
    thOrderNo: 'رقم الطلب', thCustomer: 'العميل', thTotal: 'الإجمالي', thPayStatus: 'حالة الدفع', thDate: 'التاريخ',
    noOrdersYet: 'لا توجد طلبات بعد.',
    underReviewWord: 'قيد المراجعة',
    stockHead: 'تنبيه المخزون', allStockOk: 'جميع المنتجات متوفرة.', piecesShort: 'قطعة',
    quickActionsHead: 'إجراءات سريعة', qaAddProduct: 'إضافة منتج', qaExport: 'تصدير', qaCoupon: 'كوبون',
    productsMgmt: 'إدارة المنتجات', addProduct: 'إضافة منتج',
    fName: 'اسم المنتج', fCategory: 'القسم / المناسبة', fPrice: 'السعر (ج.م)', fStock: 'المخزون', fImage: 'رابط الصورة', fDesc: 'الوصف', fFeatured: 'منتج مميز',
    updateBtn: 'تحديث', addBtn: 'إضافة', cancelBtn: 'إلغاء',
    thImage: 'الصورة', thProduct: 'المنتج', thCategory: 'القسم', thPrice: 'السعر', thStock: 'المخزون', thActions: 'إجراءات',
    editTitle: 'تعديل', delTitle: 'حذف',
    alertSaveFail: 'تعذر حفظ المنتج: ', alertAddFail: 'تعذر إضافة المنتج: ', alertDeleteFail: 'تعذر حذف المنتج: ',
    ordersMgmt: 'مراجعة الطلبات وتأكيد الأسعار والشحن',
    reviewConfirm: 'مراجعة وتأكيد', thOccasion: 'المناسبة', thAction: 'الإجراء',
    noOrdersSoFar: 'لا توجد طلبات حتى الآن.',
    reviewDetails: 'مراجعة تفاصيل الطلب:',
    customerL: 'العميل:', addressL: 'العنوان:', occasionL: 'المناسبة:', notesL: 'ملاحظات التخصيص:',
    setFinalHead: 'تحديد السعر النهائي ومصاريف الشحن',
    finalPriceL: 'سعر المنتجات النهائي (ج.م)', shippingL: 'مصاريف الشحن (ج.م)', payStatusL: 'حالة الدفع',
    saveConfirmBtn: 'حفظ وتأكيد السعر والشحن للعميل',
    verifyBtn: 'التحقق من إيصال الدفع واعتماد الطلب',
    alertUpdateFail: 'تعذر حفظ التحديث: ', alertPriceSaved: 'تم تحديث السعر ومصاريف الشحن بنجاح!', alertPaymentVerified: 'تم التحقق من الدفع واعتماد الطلب للإنتاج!',
    customersMgmt: 'إدارة العملاء', customersWord: 'عميل',
    thCustName: 'اسم العميل', thPhone: 'الهاتف', thEmail: 'البريد', thOrdersCount: 'عدد الطلبات', thSpent: 'إجمالي الإنفاق',
    ordersCountSuffix: 'طلب', noCustomers: 'لا يوجد عملاء بعد.',
    couponsMgmt: 'إدارة الكوبونات والعروض', addCoupon: 'إضافة كوبون',
    cCode: 'الكود', cType: 'نوع الخصم', cPercent: 'نسبة %', cFixed: 'مبلغ ثابت', cValue: 'قيمة الخصم', cMaxUse: 'الحد الأقصى للاستخدام', cExpiry: 'تاريخ الانتهاء',
    thCode: 'الكود', thDiscount: 'الخصم', thMin: 'الحد الأدنى', thUsage: 'الاستخدام', thStatus: 'الحالة',
    activeC: 'نشط', inactiveC: 'موقوف', noCoupons: 'لا توجد كوبونات بعد.',
    alertCouponFail: 'تعذر إضافة الكوبون: ',
    settingsMgmt: 'إعدادات المتجر والمنصة',
    setName: 'اسم المتجر', setPayPhone: 'رقم هاتف الدفع (InstaPay / Wallet)', setShipFee: 'رسوم الشحن الافتراضية (ج.م)', setFreeShip: 'حد الشحن المجاني (ج.م)', setWhats: 'واتساب (رقم دولي بدون +)', setDesc: 'وصف المتجر',
    savingBtn: 'جارِ الحفظ…', saveSettings: 'حفظ الإعدادات',
    alertSettingsFail: 'تعذر حفظ الإعدادات: ', alertSettingsSaved: 'تم حفظ الإعدادات بنجاح!',
    faqs: [
      { q: 'كم يستغرق تجهيز الطلب؟', a: 'عادة من 3 إلى 5 أيام عمل، ثم الشحن خلال 24-48 ساعة. الطلبات الكبيرة قد تحتاج وقتاً إضافياً.' },
      { q: 'ما الحد الأدنى للطلب؟', a: 'الحد الأدنى 15 قطعة للتوزيعات المخصصة. للمنتجات الجاهزة لا يوجد حد أدنى.' },
      { q: 'هل يمكن معاينة العينة؟', a: 'نعم، نرسل صور وفيديو للعينة الأولى قبل البدء بالكمية لضمان رضاكِ التام.' },
      { q: 'ما طرق الدفع المتاحة؟', a: 'إنستاباي، المحافظ الإلكترونية، والتحويل بعد تأكيد السعر والشحن النهائي.' },
      { q: 'هل الشحن مجاني؟', a: 'نعم، الشحن مجاني للطلبات فوق 500 ج.م. رسوم الشحن الافتراضية 25 ج.م.' }
    ],
    statuses: {
      new: 'طلب جديد',
      underReview: 'قيد المراجعة',
      priceConfirmed: 'تم تأكيد السعر',
      waitingPayment: 'بانتظار الدفع',
      proofSubmitted: 'تم رفع إيصال الدفع',
      verified: 'تم التحقق من الدفع',
      paid: 'مدفوع',
      preparing: 'قيد التجهيز',
      production: 'قيد الإنتاج',
      ready: 'جاهز',
      shipped: 'تم الشحن',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    }
  },
  en: {
    store: 'Shop',
    designStudio: 'Custom Studio',
    aboutUs: 'About Us',
    faq: 'FAQ',
    track: 'Track Order',
    login: 'Login',
    cart: 'Shopping Bag',
    browseShop: 'Explore Collection',
    heroEyebrow: 'HANDCRAFTED • PERSONALIZED • TIMELESS',
    heroTitle: 'Exquisite details…\nfor unforgettable moments.',
    heroTitleA: 'Exquisite details…', heroTitleEm: 'for unforgettable moments.', heroTitleB: '',
    heroDesc: 'Thoughtfully crafted custom event favors and gifts for every celebration.',
    exploreFavors: 'Explore Favors',
    designYourWay: 'Design Your Favor',
    chooseOccasion: 'Shop By Occasion',
    occasionsSub: 'Every moment has its unique character and refined details.',
    curated: 'Curated Collection',
    allCollection: 'View Complete Collection',
    bestSellers: 'Best Sellers',
    viewAll: 'View All',
    stayConnected: 'Stay Connected',
    subscribeText: 'Subscribe to receive the latest designs and exclusive offers in your inbox.',
    subscribeBtn: 'Subscribe',
    faqTitle: 'Frequently Asked Questions',
    letsCreate: 'LET\'S CREATE',
    transforming: '-transforming moments into memories-',
    startJourney: 'Begin Journey',
    searchPlaceholder: 'Search favor…',
    addToCart: 'Add to Bag',
    addShort: 'Add',
    saved: 'Saved',
    save: 'Save',
    productDetails: 'Product Details',
    checkout: 'Checkout',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'Free',
    total: 'Total',
    confirmOrder: 'Confirm Order',
    paymentMethod: 'Payment Method',
    cod: 'Cash on Delivery',
    instapay: 'InstaPay / Mobile Wallet',
    card: 'Credit Card',
    paymentInstructionsTitle: 'Payment & Transfer Instructions',
    paymentInstructionsText: 'Please transfer via InstaPay or Mobile Wallet to: 01000000000 and upload your receipt below.',
    uploadProof: 'Upload Payment Proof',
    paymentStatus: 'Payment Status',
    pageTitle: 'Esraa Moments — Details That Make Moments',
    cartEmptyTitle: 'Your bag is empty',
    cartEmptySub: 'Start shopping and discover our signature favors',
    freeShippingHint: 'Free shipping on orders over EGP 500',
    madeWithLove: 'Made with love',
    forYourMoments: 'For your moments',
    storyEyebrow: 'OUR STORY',
    storyTitle: 'Our', storyTitleAccent: 'Unique Touches',
    storyQuote: 'Every favor tells a story. We use the finest materials and most refined designs to craft unforgettable moments for your occasion.',
    storyText: 'From selecting natural flowers to the last layer of gold, every detail is thoughtfully designed. We believe beautiful moments deserve unforgettable details.',
    yourEmail: 'Your email address',
    shopTitle: 'All Favors',
    sortAll: 'All', sortPriceLow: 'Price: Low to High', sortPriceHigh: 'Price: High to Low', sortNewest: 'Newest',
    allPill: 'All',
    productsCountWord: 'products',
    noResultsTitle: 'No matching results',
    noResultsSub: 'Try a different keyword or occasion.',
    available: 'Available', pieces: 'pcs', outStock: 'Out of Stock',
    qty: 'Quantity',
    details: [
      { l: 'Customization', t: 'Available through the Design Studio.' },
      { l: 'Packaging', t: 'Elegant gift wrapping with satin ribbon.' },
      { l: 'Orders', t: 'Minimum quantity varies by design.' },
      { l: 'Shipping', t: 'Free on orders over EGP 500.' }
    ],
    relatedTitle: 'You May Also Like',
    custTitle: 'Design Your Favor', custTitleAccent: 'From Scratch.',
    custSub: 'Choose every detail yourself, and we will turn your idea into a bespoke piece for your occasion.',
    custSteps: ['Occasion', 'Favor', 'Details', 'Review'],
    stepWord: 'Step', ofWord: 'of',
    favorType: 'Favor Type',
    favorTypes: ['Box', 'Jar', 'Luxury Bag', 'Gift Box'],
    colors: ['Ivory & Gold', 'Rose Gold', 'White & Silver', 'Navy & Gold'],
    printedName: 'Printed Name', namePlaceholder: 'e.g. Mariam & Ahmed',
    dateLabel: 'Date', extraNotes: 'Additional Notes', extrasPlaceholder: 'Any extra details…',
    previewNamePh: 'Your Occasion Name', previewDatePh: 'Event Date', previewHint: 'The preview updates live with every choice',
    sOccasion: 'Occasion', sType: 'Favor', sQty: 'Quantity', sColor: 'Color', sName: 'Name', sDate: 'Date', sNotes: 'Notes',
    piecesWord: 'pcs',
    prevBtn: 'Back', nextBtn: 'Next', sendDesign: 'Submit Request',
    designReceivedT: 'Design Request Received',
    designReceivedP: 'Keep the details safe. You can follow up after placing an order from the checkout page.',
    exploreProducts: 'Explore Products',
    checkoutTitle: 'Place Your Favors Order',
    fullName: 'Full Name', phoneNum: 'Phone Number', emailLabel: 'Email Address',
    cityLabel: 'City', cities: ['Cairo', 'Alexandria', 'Giza', 'Mansoura', 'Other'],
    addressLabel: 'Detailed Shipping Address',
    occasionField: 'Occasion',
    notesLabel: 'Customization notes or names to print',
    notesPlaceholder: 'e.g. Names to print, colors, or any special instructions…',
    paymentPreferred: 'Preferred Payment Method (after price & shipping confirmation)',
    payInstapay: 'InstaPay', payWallet: 'Mobile Wallet',
    estimated: '(estimated)',
    couponPlaceholder: 'Discount code', applyBtn: 'Apply',
    errInvalidCoupon: 'Invalid coupon code', errExpiredCoupon: 'This coupon has expired', errUsedUpCoupon: 'This coupon has reached its usage limit', errMinOrderPrefix: 'Minimum order',
    couponAppliedPrefix: 'Coupon', discountWord: 'discount',
    discountLabel: 'Discount', grandEst: 'Estimated Total',
    finalPriceNote: '* Final price and shipping fees are confirmed by our team after reviewing customization details and quantity.',
    submitOrder: 'Submit Favors Order',
    successTitle: 'Order Received Successfully', orderNoWord: 'Order Number:',
    successDesc: 'The Esraa Moments team will review your customization details and quantity, then confirm the final price and shipping fees with you shortly.',
    trackAndPay: 'Track Order & Pay',
    trackTitle: 'Track Your Order & Payment',
    orderPlaceholder: 'Enter order number (EM-XXXXXXXX)', searchBtn: 'Search',
    customerWord: 'Customer:', orderStatusLabelK: 'Order Status',
    totalFinalLabel: 'Final Total', shippingConfirmedLabel: 'Confirmed Shipping', addressShort: 'Address',
    payInstrNote: 'After transferring, upload a photo of your receipt below so our team can verify and approve your order right away.',
    proofDone: 'Receipt uploaded successfully', proofUnderReview: 'under admin review', proofFileFallback: 'Transfer receipt',
    statusFlow: ['Under Review', 'Price Confirmed', 'Awaiting Payment', 'Receipt Submitted', 'Verified & In Production', 'Shipped', 'Completed'],
    notFoundTitle: 'Order Not Found', notFoundSub: 'Try a different order number.',
    enterNoTitle: 'Enter Your Order Number', enterNoSub: 'To view pricing, shipping and payment status.',
    loginTitle: 'Login', signupTitle: 'Create Account',
    passwordLabel: 'Password', loginBtn: 'Login', signupBtn: 'Create Account',
    noAccount: 'No account? Create one', haveAccount: 'Have an account? Login',
    signupNotice: 'Account created. New accounts are registered as customers only — an admin must grant you the admin role in the user_roles table.',
    noRoleError: 'This account does not have access to the admin panel.',
    quickLinks: 'Quick Links', contactUs: 'Contact', location: 'Cairo, Egypt',
    rights: 'All rights reserved.',
    footerDesc: 'Little details that make unforgettable moments. Custom favors and gifts for all your happy occasions in Egypt.',
    admChecking: 'Verifying access…',
    admPanel: 'Admin Panel',
    admProtected: 'This area is protected. Sign in with an admin account that has the admin or staff role.',
    tabOverview: 'Overview', tabProducts: 'Products', tabOrders: 'Orders & Pricing', tabCustomers: 'Customers', tabCoupons: 'Coupons', tabSettings: 'Settings',
    viewStore: 'View Store', logout: 'Logout',
    stSales: 'Sales', stSalesSub: 'Total confirmed sales', stOrders: 'Orders', stOrdersSub: 'Customer orders', stProducts: 'Products', stProductsSub: 'In catalog', stCustomers: 'Customers', stCustomersSub: 'Unique customers',
    recentOrdersHead: 'Recent Orders & Price Confirmation', ordersWord: 'orders',
    thOrderNo: 'Order No.', thCustomer: 'Customer', thTotal: 'Total', thPayStatus: 'Payment Status', thDate: 'Date',
    noOrdersYet: 'No orders yet.',
    underReviewWord: 'Under Review',
    stockHead: 'Stock Alerts', allStockOk: 'All products in stock.', piecesShort: 'pcs',
    quickActionsHead: 'Quick Actions', qaAddProduct: 'Add Product', qaExport: 'Export', qaCoupon: 'Coupon',
    productsMgmt: 'Manage Products', addProduct: 'Add Product',
    fName: 'Product Name', fCategory: 'Category / Occasion', fPrice: 'Price (EGP)', fStock: 'Stock', fImage: 'Image URL', fDesc: 'Description', fFeatured: 'Featured Product',
    updateBtn: 'Update', addBtn: 'Add', cancelBtn: 'Cancel',
    thImage: 'Image', thProduct: 'Product', thCategory: 'Category', thPrice: 'Price', thStock: 'Stock', thActions: 'Actions',
    editTitle: 'Edit', delTitle: 'Delete',
    alertSaveFail: 'Could not save product: ', alertAddFail: 'Could not add product: ', alertDeleteFail: 'Could not delete product: ',
    ordersMgmt: 'Review Orders & Confirm Pricing/Shipping',
    reviewConfirm: 'Review', thOccasion: 'Occasion', thAction: 'Action',
    noOrdersSoFar: 'No orders yet.',
    reviewDetails: 'Order Details:',
    customerL: 'Customer:', addressL: 'Address:', occasionL: 'Occasion:', notesL: 'Customization Notes:',
    setFinalHead: 'Set Final Price & Shipping',
    finalPriceL: 'Final Products Price (EGP)', shippingL: 'Shipping Fee (EGP)', payStatusL: 'Payment Status',
    saveConfirmBtn: 'Save & Confirm Price/Shipping',
    verifyBtn: 'Verify Receipt & Approve Order',
    alertUpdateFail: 'Could not save update: ', alertPriceSaved: 'Price and shipping updated successfully!', alertPaymentVerified: 'Payment verified — order approved for production!',
    customersMgmt: 'Customers', customersWord: 'customers',
    thCustName: 'Customer Name', thPhone: 'Phone', thEmail: 'Email', thOrdersCount: 'Orders', thSpent: 'Total Spent',
    ordersCountSuffix: 'orders', noCustomers: 'No customers yet.',
    couponsMgmt: 'Coupons & Offers', addCoupon: 'Add Coupon',
    cCode: 'Code', cType: 'Discount Type', cPercent: 'Percent %', cFixed: 'Fixed Amount', cValue: 'Discount Value', cMaxUse: 'Max Uses', cExpiry: 'Expiry Date',
    thCode: 'Code', thDiscount: 'Discount', thMin: 'Minimum', thUsage: 'Usage', thStatus: 'Status',
    activeC: 'Active', inactiveC: 'Disabled', noCoupons: 'No coupons yet.',
    alertCouponFail: 'Could not add coupon: ',
    settingsMgmt: 'Store & Platform Settings',
    setName: 'Store Name', setPayPhone: 'Payment Phone (InstaPay / Wallet)', setShipFee: 'Default Shipping Fee (EGP)', setFreeShip: 'Free Shipping Over (EGP)', setWhats: 'WhatsApp (intl. without +)', setDesc: 'Store Description',
    savingBtn: 'Saving…', saveSettings: 'Save Settings',
    alertSettingsFail: 'Could not save settings: ', alertSettingsSaved: 'Settings saved successfully!',
    faqs: [
      { q: 'How long does order preparation take?', a: 'Typically 3–5 business days, then shipping within 24–48 hours. Large orders may need extra time.' },
      { q: 'What is the minimum order quantity?', a: 'The minimum is 15 pieces for custom favors. Ready-made products have no minimum.' },
      { q: 'Can I preview a sample?', a: 'Yes — we send photos and a video of the first sample before starting production to guarantee your satisfaction.' },
      { q: 'What payment methods are available?', a: 'InstaPay, mobile wallets, and bank transfer after confirming the final price and shipping.' },
      { q: 'Is shipping free?', a: 'Yes, shipping is free on orders over EGP 500. The default shipping fee is EGP 25.' }
    ],
    statuses: {
      new: 'New Request',
      underReview: 'Under Review',
      priceConfirmed: 'Price Confirmed',
      waitingPayment: 'Waiting for Payment',
      proofSubmitted: 'Payment Proof Submitted',
      verified: 'Payment Verified',
      paid: 'Paid',
      preparing: 'Preparing',
      production: 'In Production',
      ready: 'Ready',
      shipped: 'Shipped',
      completed: 'Completed',
      cancelled: 'Cancelled'
    }
  }
};

const seed: Product[] = [
  { id: 'p1', name: 'توزيعة سبوع الدبدوب الملكي', name_en: 'Royal Teddy Baby Shower Favor', category: 'سبوع', price: 35, stock: 120, image: '/images/Gemini_Generated_Image_wh7xokwh7xokwh7x.jpeg', desc: 'مجسم دبدوب فاخر مع زجاجة مسك أبيض وكرت ترحيب بالطفل.', desc_en: 'Luxury teddy bear figurine with white musk bottle and baby welcome card.', featured: true },
  { id: 'p2', name: 'توزيعة سبوع الحوت والسبحة', name_en: 'Whale & Tasbeeh Baby Shower Favor', category: 'سبوع', price: 30, stock: 150, image: '/images/Gemini_Generated_Image_sligebsligebslig.jpeg', desc: 'عداد تسبيح رقمي مع شوكولاتة مستوردة في علبة أنيقة.', desc_en: 'Digital prayer counter with imported chocolates in an elegant box.', featured: true },
  { id: 'p3', name: 'عقد اللؤلؤ والخطوبة الكلاسيكي', name_en: 'Classic Pearl Engagement Favor', category: 'خطوبة', price: 36, stock: 60, image: '/images/Gemini_Generated_Image_p97awfp97awfp97a.jpeg', desc: 'كرت عريض برسمة خاتم الخطوبة مع سوار أنيق من اللؤلؤ.', desc_en: 'Wide card featuring a ring illustration with an elegant pearl bracelet.', featured: true },
  { id: 'p4', name: 'بوكس الأكريليك المذهب للخطوبة', name_en: 'Gold-Acrylic Engagement Box', category: 'خطوبة', price: 42, stock: 40, image: '/images/Gemini_Generated_Image_p2yjpfp2yjpfp2yj.jpeg', desc: 'علبة أكريليك فاخرة بداخلها شوكولاتة ومسك مع شريطة ذهبية.', desc_en: 'Premium acrylic box with chocolates, musk and a golden ribbon.', featured: true },
  { id: 'p5', name: 'توزيعات حنة الورود المخملية', name_en: 'Velvet Rose Henna Favor', category: 'حنة', price: 28, stock: 80, image: '/images/Gemini_Generated_Image_wl5xnywl5xnywl5x.jpeg', desc: 'كرت فاخر بتصميم يدوي مع شوكولاتة قلب حمراء وزهور مجففة.', desc_en: 'Handcrafted luxury card with red heart chocolate and dried flowers.', featured: true },
  { id: 'p6', name: 'مانيكير وفراشة الحنة ثلاثية الأبعاد', name_en: '3D Butterfly & Manicure Henna Favor', category: 'حنة', price: 26, stock: 60, image: '/images/Gemini_Generated_Image_vh32ruvh32ruvh32.jpeg', desc: 'طلاء أظافر بألوان أنثوية مع أجنحة فراشة مفرغة يدوياً.', desc_en: 'Feminine-tone nail polish with hand-cut butterfly wings.', featured: true },
  { id: 'p7', name: 'مسك الختام والعود الملكي', name_en: 'Royal Oud & Musk Favor', category: 'كتب كتاب', price: 38, stock: 70, image: '/images/Gemini_Generated_Image_vkeew8vkeew8vkee.jpeg', desc: 'زجاجة عطرية كريستالية مع كرت شكر وتقدير لضيوف كتب الكتاب.', desc_en: 'Crystal fragrance bottle with a thank-you card for Katb Ktab guests.', featured: true },
  { id: 'p8', name: 'شموع الصويا الطبيعية باللؤلؤ', name_en: 'Pearl Soy Candles', category: 'كتب كتاب', price: 45, stock: 50, image: '/images/Gemini_Generated_Image_q2ritlq2ritlq2ri.jpeg', desc: 'شمعة صويا معطرة بعبير الياسمين مزينة بحبات لؤلؤ وشريط ساتان.', desc_en: 'Jasmine-scented soy candle adorned with pearls and satin ribbon.', featured: true },
  { id: 'p9', name: 'مروحة ورقية مذهبة للزفاف', name_en: 'Gilded Paper Wedding Fan', category: 'زفاف', price: 35, stock: 100, image: '/images/Gemini_Generated_Image_w92zqyw92zqyw92z.jpeg', desc: 'مروحة ورقية بتطريز وردي وطباعة أسماء العروسين بماء الذهب.', desc_en: 'Paper fan with rose embroidery and the couple\'s names in gold ink.', featured: true },
  { id: 'p10', name: 'بوكس زفاف الورد والذهب', name_en: 'Rose & Gold Wedding Box', category: 'زفاف', price: 50, stock: 20, image: '/images/Gemini_Generated_Image_ehh0puehh0puehh0.jpeg', desc: 'بوكس هدية كبير بلمسات روز جولد وزهور طبيعية.', desc_en: 'Large gift box with rose-gold touches and natural flowers.', featured: true },
  { id: 'p11', name: 'توزيعات عيد الميلاد بالبالون والكرت', name_en: 'Balloon & Card Birthday Favor', category: 'عيد ميلاد', price: 25, stock: 90, image: '/images/Gemini_Generated_Image_o7uafio7uafio7ua.jpeg', desc: 'شوكولاتة مخصصة مع كرت عيد ميلاد مرح وملون.', desc_en: 'Custom chocolate with a cheerful colorful birthday card.', featured: true },
  { id: 'p12', name: 'توزيعات التخرج بقبعة الأكاديمية', name_en: 'Graduation Cap Favor', category: 'تخرج', price: 32, stock: 75, image: '/images/Gemini_Generated_Image_o2jvt3o2jvt3o2jv.jpeg', desc: 'مجسم قبعة تخرج مع بطاقة تهنئة وخريطة إنجاز.', desc_en: 'Graduation cap figurine with a congratulation card and achievement map.', featured: true },
  { id: 'p13', name: 'استقبال مولود زهور ولبان دكر', name_en: 'New Baby Flowers & Frankincense Favor', category: 'استقبال مولود', price: 30, stock: 110, image: '/images/Gemini_Generated_Image_pbsa2xpbsa2xpbsa.jpeg', desc: 'توزيعات أنيقة للمستشفى والتهنئة بالمولود الجديد.', desc_en: 'Elegant hospital-visit favors celebrating the newborn.', featured: true },
  { id: 'p14', name: 'فانوس رمضان والأذكار الفاخرة', name_en: 'Ramadan Lantern & Prayers Favor', category: 'رمضان', price: 40, stock: 130, image: '/images/Gemini_Generated_Image_i6nilyi6nilyi6ni.jpeg', desc: 'فانوس أكريليك مصغر مع بطاقة أدعية رمضانية.', desc_en: 'Miniature acrylic lantern with Ramadan prayers card.', featured: true },
  { id: 'p15', name: 'عيدية العيد الفاخرة في مغلف مذهب', name_en: 'Deluxe Eidi Gold Envelope', category: 'عيد', price: 20, stock: 200, image: '/images/Gemini_Generated_Image_hlt09bhlt09bhlt0.jpeg', desc: 'مغلف عيدية مطبوع بعبارات العيد السعيد وتصميم راقٍ.', desc_en: 'Eidi envelope printed with festive greetings in a refined design.', featured: true },
  { id: 'p16', name: 'توزيعات الشركات وهدايا العملاء', name_en: 'Corporate & Client Gifts', category: 'توزيعات شركات', price: 60, stock: 90, image: '/images/Gemini_Generated_Image_etc9loetc9loetc9.jpeg', desc: 'علبة هدايا رسمية بشعار الشركة ومنتجات عطرية فاخرة.', desc_en: 'Official gift box with company branding and premium fragrances.', featured: true },
];

const money = (n: number) => uiLang === 'en' ? `EGP ${Number(n || 0).toLocaleString('en-US')}` : `${Number(n || 0).toLocaleString('ar-EG')} ج.م`;
const orderStatusLabels: Record<Lang, Record<string, string>> = {
  ar: {
    pending: 'قيد المراجعة', confirmed: 'تم تأكيد السعر', processing: 'تم التحقق والإنتاج',
    ready: 'جاهز للشحن', shipped: 'تم الشحن', delivered: 'مكتمل', cancelled: 'ملغي', returned: 'مرتجع',
    proof_submitted: 'تم رفع الإيصال (قيد التحقق)', waiting_price: 'بانتظار تأكيد السعر والشحن'
  },
  en: {
    pending: 'Under Review', confirmed: 'Price Confirmed', processing: 'Verified & In Production',
    ready: 'Ready to Ship', shipped: 'Shipped', delivered: 'Completed', cancelled: 'Cancelled', returned: 'Returned',
    proof_submitted: 'Receipt Submitted (Under Review)', waiting_price: 'Awaiting Price Confirmation'
  }
};
const paymentStatusLabels: Record<Lang, Record<string, string>> = {
  ar: { unpaid: 'بانتظار الدفع', paid: 'تم التحقق (مدفوع)', refunded: 'تم الاسترجاع', proof_submitted: 'تم رفع الإيصال (قيد التحقق)', waiting_price: 'بانتظار تأكيد السعر والشحن' },
  en: { unpaid: 'Awaiting Payment', paid: 'Verified (Paid)', refunded: 'Refunded', proof_submitted: 'Receipt Submitted (Under Review)', waiting_price: 'Awaiting Price Confirmation' }
};
const orderStatusLabel = (s?: string) => (s ? orderStatusLabels[uiLang][s] || orderStatusLabels.ar[s] || s : '');
const paymentStatusLabel = (s?: string) => (s ? paymentStatusLabels[uiLang][s] || paymentStatusLabels.ar[s] || s : '');
const getLocal = <T,>(k: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? fallback } catch { return fallback } };
const ease: [number, number, number, number] = [.22, 1, .36, 1];

function AnimateScroll({ children, delay = 0, className = '', ...props }: { children: React.ReactNode; delay?: number; className?: string; [k: string]: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 50, filter: 'blur(8px)' }}
      transition={{ duration: .7, delay, ease }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function AnimateScale({ children, delay = 0, className = '', ...props }: { children: React.ReactNode; delay?: number; className?: string; [k: string]: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: .85, rotate: -2 }}
      animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: .85, rotate: -2 }}
      transition={{ duration: .6, delay, ease }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function StaggerContainer({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [k: string]: any }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ visible: { transition: { staggerChildren: .12 } } }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [k: string]: any }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40, scale: .96 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: .5, ease } }
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 20, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: .5, ease } as const },
  exit: { opacity: 0, y: -20, filter: 'blur(6px)', transition: { duration: .3 } }
};

function useProducts() {
  const [items, setItems] = useState<Product[]>(seed);
  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.from('products').select('id,name,price,stock,image_url,description,is_featured,categories(name)').eq('is_active', true);
      if (active && data?.length) setItems(data.map((p: any) => ({
        id: p.id, name: p.name, category: p.categories?.name || 'مناسبات خاصة',
        price: Number(p.price), stock: p.stock, image: p.image_url || seed[0].image, desc: p.description || '', featured: !!p.is_featured
      })));
    })();
    return () => { active = false };
  }, []);
  return items;
}

function useLocalStorage<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [val, setVal] = useState<T>(() => getLocal(key, fallback));
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
}

function useScrollShadow() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return scrolled;
}

function App() {
  const products = useProducts();
  const [cart, setCart] = useLocalStorage<CartItem[]>('em-cart', []);
  const [wish, setWish] = useLocalStorage<string[]>('em-wish', []);
  const [dark, setDark] = useState(() => localStorage.getItem('em-dark') === '1');
  const [lang, setLang] = useLocalStorage<'ar' | 'en'>('em-lang', 'ar');
  const [menu, setMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('em-dark', dark ? '1' : '0');
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  useEffect(() => {
    uiLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = translations[lang].pageTitle;
  }, [lang]);

  useEffect(() => { if (!location.hash) window.scrollTo(0, 0); setMenu(false); }, [location.pathname]);

  useEffect(() => {
    if (!location.hash) return;
    const timer = setTimeout(() => {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => clearTimeout(timer);
  }, [location]);

  const addToCart = useCallback((p: Product) => {
    setCart(c => {
      const existing = c.find(i => i.id === p.id);
      if (existing) return c.map(i => i.id === p.id ? { ...i, qty: Math.min(i.qty + 1, p.stock) } : i);
      return [...c, { ...p, qty: 1 }];
    });
    setCartOpen(true);
  }, [setCart]);

  const removeFromCart = useCallback((id: string) => setCart(c => c.filter(x => x.id !== id)), [setCart]);

  const changeQty = useCallback((id: string, delta: number) => {
    setCart(c => c.map(x => x.id === id ? { ...x, qty: Math.max(1, Math.min(x.qty + delta, x.stock)) } : x));
  }, [setCart]);

  const cartCount = cart.reduce((s, x) => s + x.qty, 0);
  const cartTotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const t = translations[lang];

  return (
    <div className={`app ${lang === 'en' ? 'lang-en' : 'lang-ar'}`}>
      <Header
        cartCount={cartCount}
        menu={menu}
        setMenu={setMenu}
        dark={dark}
        setDark={setDark}
        lang={lang}
        setLang={setLang}
        t={t}
        onCartClick={() => setCartOpen(true)}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        changeQty={changeQty}
        remove={removeFromCart}
        total={cartTotal}
        t={t}
      />

      <AnimatePresence mode="wait">
        <motion.div key={location.pathname + lang} variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <Routes location={location}>
            <Route path="/" element={<Home products={products} addToCart={addToCart} wish={wish} setWish={setWish} t={t} />} />
            <Route path="/shop" element={<ShopPage products={products} addToCart={addToCart} wish={wish} setWish={setWish} t={t} />} />
            <Route path="/product/:id" element={<ProductPage products={products} addToCart={addToCart} wish={wish} setWish={setWish} t={t} />} />
            <Route path="/custom" element={<Customizer t={t} />} />
            <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} cartTotal={cartTotal} t={t} />} />
            <Route path="/track" element={<TrackingPage t={t} />} />
            <Route path="/login" element={<LoginPage t={t} />} />
            <Route path="/admin/*" element={<AdminPage t={t} />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <Footer t={t} />
    </div>
  );
}

function Header({
  cartCount, menu, setMenu, dark, setDark, lang, setLang, t, onCartClick
}: {
  cartCount: number; menu: boolean; setMenu: (v: boolean) => void;
  dark: boolean; setDark: (v: boolean) => void;
  lang: 'ar' | 'en'; setLang: (l: 'ar' | 'en') => void;
  t: typeof translations.ar; onCartClick: () => void;
}) {
  const scrolled = useScrollShadow();
  return (
    <motion.header
      className={`header ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -82 }}
      animate={{ y: 0 }}
      transition={{ duration: .6, ease }}
    >
      <div className="header-inner">
        <button className="nav-mobile-toggle mobileOnly" onClick={() => setMenu(!menu)} aria-label="Menu">
          <span></span>
        </button>

        <Link to="/" className="brand">
          <motion.img src="/images/logo.jpeg" alt="Esraa Moments" className="brand-logo" whileHover={{ scale: 1.08 }} transition={{ duration: .4 }} />
          <span className="brand-text"><b>ESRAA</b> <small>Moments</small></span>
        </Link>

        <nav className={`nav-desktop ${menu ? 'mobile-active' : ''}`}>
          <Link to="/shop" className="nav-link" onClick={() => setMenu(false)}>{t.store}</Link>
          <Link to="/custom" className="nav-link" onClick={() => setMenu(false)}>{t.designStudio}</Link>
          <Link to="/#about" className="nav-link" onClick={() => setMenu(false)}>{t.aboutUs}</Link>
          <Link to="/#faq" className="nav-link" onClick={() => setMenu(false)}>{t.faq}</Link>
          <Link to="/track" className="nav-link" onClick={() => setMenu(false)}>{t.track}</Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <motion.button
            className="header-btn"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: .95 }}
            title="Switch Language"
          >
            <Globe size={18} />
          </motion.button>

          <motion.button
            className="header-btn"
            onClick={() => setDark(!dark)}
            whileHover={{ rotate: 180, scale: 1.1 }}
            whileTap={{ scale: .9 }}
            transition={{ duration: .4 }}
            aria-label="Toggle Theme"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          <motion.button className="header-btn" onClick={onCartClick} whileHover={{ scale: 1.15 }} whileTap={{ scale: .9 }} aria-label="Cart">
            <ShoppingBag size={18} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.i
                  className="count"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  {cartCount}
                </motion.i>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

function CartDrawer({
  open, onClose, cart, changeQty, remove, total, t
}: {
  open: boolean; onClose: () => void; cart: CartItem[];
  changeQty: (id: string, d: number) => void; remove: (id: string) => void;
  total: number; t: typeof translations.ar;
}) {
  const storeCfg = getLocal<any | null>('em-settings', null);
  const SHIP_FEE = Number(storeCfg?.shippingFee) > 0 ? Number(storeCfg.shippingFee) : 25;
  const FREE_OVER = Number(storeCfg?.freeShippingThreshold) || 500;
  const shipping = total >= FREE_OVER || !total ? 0 : SHIP_FEE;
  const nav = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="cartOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .3 }}
            onClick={onClose}
          />
          <motion.div
            className="cartDrawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: .4, ease }}
          >
            <div className="cartDrawerHead">
              <h2><ShoppingBag size={20} /> {t.cart}</h2>
              <motion.button className="icon" onClick={onClose} whileHover={{ rotate: 90 }} whileTap={{ scale: .9 }}>
                <X size={22} />
              </motion.button>
            </div>

            {!cart.length ? (
              <div className="cartEmpty">
                <ShoppingBag size={48} strokeWidth={1} />
                <h3>{t.cartEmptyTitle}</h3>
                <p>{t.cartEmptySub}</p>
                <motion.button className="btn primary" whileHover={{ y: -2 }} whileTap={{ scale: .96 }} onClick={() => { onClose(); nav('/shop'); }}>
                  {t.browseShop}
                </motion.button>
              </div>
            ) : (
              <>
                <div className="cartDrawerItems">
                  <AnimatePresence initial={false}>
                    {cart.map(item => (
                      <motion.div
                        className="cartDrawerItem"
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0, padding: 0 }}
                        transition={{ duration: .3, ease }}
                      >
                        <img src={item.image} alt={prodName(item)} className="cartDrawerImg" />
                        <div className="cartDrawerInfo">
                          <Link to={`/product/${item.id}`} onClick={onClose}>{prodName(item)}</Link>
                          <span className="cartDrawerPrice">{money(item.price)}</span>
                          <div className="qtyControls">
                            <motion.button whileTap={{ scale: .8 }} onClick={() => changeQty(item.id, -1)}><Minus size={14} /></motion.button>
                            <span>{item.qty}</span>
                            <motion.button whileTap={{ scale: .8 }} onClick={() => changeQty(item.id, 1)}><Plus size={14} /></motion.button>
                          </div>
                        </div>
                        <div className="cartDrawerRight">
                          <span className="cartDrawerLineTotal">{money(item.price * item.qty)}</span>
                          <motion.button className="icon removeBtn" whileHover={{ scale: 1.2, color: '#a44' }} whileTap={{ scale: .8 }} onClick={() => remove(item.id)}>
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="cartDrawerFoot">
                  <div className="cartDrawerSummary">
                    <div><span>{t.subtotal}</span><b>{money(total)}</b></div>
                    <div><span>{t.shipping}</span><b className={shipping === 0 ? 'freeShipping' : ''}>{shipping ? money(shipping) : t.free}</b></div>
                    {total < FREE_OVER && total > 0 && <p className="shippingHint">{t.freeShippingHint}</p>}
                    <hr />
                    <div className="cartDrawerGrand"><span>{t.total}</span><b>{money(total + shipping)}</b></div>
                  </div>
                  <motion.button
                    className="btn primary full"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: .97 }}
                    onClick={() => { onClose(); nav('/checkout'); }}
                  >
                    {t.checkout} <ArrowLeft size={18} className="flip-x" />
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ProductCard({ p, addToCart, wish, setWish, t }: { p: Product; addToCart: (p: Product) => void; wish: string[]; setWish: (x: string[]) => void; t: typeof translations.ar }) {
  const liked = wish.includes(p.id);
  return (
    <motion.article
      className="productCard"
      whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(50,30,20,.12)' }}
      transition={{ duration: .4, ease }}
    >
      <Link to={`/product/${p.id}`} className="productCardImage">
        <motion.img src={p.image} alt={prodName(p)} whileHover={{ scale: 1.05 }} transition={{ duration: .7, ease }} />
        <motion.button
          type="button"
          className="wishBtn"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: .8 }}
          onClick={e => { e.preventDefault(); setWish(liked ? wish.filter(x => x !== p.id) : [...wish, p.id]); }}
          aria-label="Wishlist"
        >
          <Heart fill={liked ? 'var(--rose)' : 'none'} color={liked ? 'var(--rose)' : 'currentColor'} size={18} />
        </motion.button>
        <span className="productCatTag">{occLabel(p.category)}</span>
      </Link>
      <div className="productCardBody">
        <Link to={`/product/${p.id}`}><h3>{prodName(p)}</h3></Link>
        <p className="productDesc">{prodDesc(p)}</p>
        <div className="productCardFooter">
          <strong className="priceGrad">{money(p.price)}</strong>
          <motion.button
            className="addCartBtn"
            whileHover={{ scale: 1.05, backgroundColor: 'var(--ink)', color: 'var(--bg)' }}
            whileTap={{ scale: .95 }}
            onClick={() => addToCart(p)}
          >
            {t.addShort} <Plus size={16} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

function Home({ products, addToCart, wish, setWish, t }: { products: Product[]; addToCart: (p: Product) => void; wish: string[]; setWish: (x: string[]) => void; t: typeof translations.ar }) {
  const faqData = t.faqs;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const bestSellers = useMemo(() => [...products].sort((a, b) => b.stock - a.stock).slice(0, 6), [products]);

  return (
    <>
      <section className="hero">
        <div className="heroCopy">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .7, delay: .2, ease }}
          >
            {t.heroEyebrow}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .8, delay: .4, ease }}
          >
            {t.heroTitleA}<br /><em>{t.heroTitleEm}</em>{t.heroTitleB ? ` ${t.heroTitleB}` : ''}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .7, delay: .6, ease }}
          >
            {t.heroDesc}
          </motion.p>
          <motion.div
            className="heroCta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .8, ease }}
          >
            <motion.div whileHover={{ y: -4 }} whileTap={{ scale: .96 }}>
              <Link className="btn primary btnLg" to="/shop">{t.exploreFavors} <ArrowLeft size={18} className="flip-x" /></Link>
            </motion.div>
            <motion.div whileHover={{ y: -4 }} whileTap={{ scale: .96 }}>
              <Link className="btn ghost btnLg" to="/custom">{t.designYourWay} <Sparkles size={18} /></Link>
            </motion.div>
          </motion.div>
          <motion.div
            className="scrollIndicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <ChevronDown size={24} />
            </motion.div>
          </motion.div>
        </div>
        <div className="heroImage">
          <motion.img
            src="/images/Gemini_Generated_Image_ehh0puehh0puehh0.jpeg"
            alt="Esraa Moments"
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: .3, ease }}
          />
          <motion.div
            className="floatingBadge"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .8, delay: 1 }}
            whileHover={{ y: -5 }}
          >
            {t.madeWithLove}<br /><small>{t.forYourMoments}</small>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="sectionHead">
          <AnimateScroll>
            <div><span className="eyebrow">YOUR OCCASION</span><h2>{t.chooseOccasion}</h2></div>
          </AnimateScroll>
          <AnimateScroll delay={.1}>
            <p>{t.occasionsSub}</p>
          </AnimateScroll>
        </div>
        <StaggerContainer className="occasionGrid">
          {occasions.map((o, i) => (
            <StaggerItem key={o}>
              <motion.div whileHover={{ x: -12, backgroundColor: 'var(--paper)' }} transition={{ duration: .3, ease }}>
                <Link to={`/shop?cat=${encodeURIComponent(o)}`} className="occasionCard">
                  <span className="occasionNum">{i < 9 ? `0${i + 1}` : i + 1}</span>
                  <b>{occLabel(o)}</b>
                  <ArrowLeft size={18} className="flip-x" />
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="section" id="shop">
        <div className="sectionHead">
          <AnimateScroll>
            <div><span className="eyebrow">CURATED COLLECTION</span><h2>{t.curated}</h2></div>
          </AnimateScroll>
          <AnimateScroll delay={.1}>
            <Link className="textLink" to="/shop">{t.allCollection} <ArrowLeft size={16} className="flip-x" /></Link>
          </AnimateScroll>
        </div>
        <StaggerContainer className="productGrid">
          {products.filter(x => x.featured).map(p => (
            <StaggerItem key={p.id}>
              <ProductCard p={p} addToCart={addToCart} wish={wish} setWish={setWish} t={t} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="section brandStory" id="about">
        <div className="brandStoryInner">
          <AnimateScroll>
            <span className="eyebrow">{t.storyEyebrow}</span>
            <h2>{t.storyTitle} <em>{t.storyTitleAccent}</em></h2>
            <blockquote className="storyQuote">
              {t.storyQuote}
            </blockquote>
            <p>
              {t.storyText}
            </p>
          </AnimateScroll>
        </div>
        <div className="brandStoryImages">
          <AnimateScroll delay={.1}>
            <motion.img
              src="/images/Gemini_Generated_Image_hlt09bhlt09bhlt0.jpeg"
              alt="لمساتنا"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: .5, ease }}
            />
          </AnimateScroll>
          <AnimateScroll delay={.2}>
            <motion.img
              src="/images/Gemini_Generated_Image_etc9loetc9loetc9.jpeg"
              alt="تفاصيل"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: .5, ease }}
            />
          </AnimateScroll>
        </div>
      </section>

      <section className="section" id="bestsellers">
        <div className="sectionHead">
          <AnimateScroll>
            <div><span className="eyebrow">BEST SELLERS</span><h2>{t.bestSellers}</h2></div>
          </AnimateScroll>
          <AnimateScroll delay={.1}>
            <Link className="textLink" to="/shop">{t.viewAll} <ArrowLeft size={16} className="flip-x" /></Link>
          </AnimateScroll>
        </div>
        <div className="bestSellersScroll">
          {bestSellers.map((p, i) => (
            <motion.div
              key={p.id}
              className="bestSellerCard"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * .1, duration: .5, ease }}
            >
              <Link to={`/product/${p.id}`}>
                <img src={p.image} alt={prodName(p)} />
                <div>
                  <span className="bsRank">#{i + 1}</span>
                  <h4>{prodName(p)}</h4>
                  <strong className="priceGrad">{money(p.price)}</strong>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section newsletter">
        <AnimateScroll>
          <div className="newsletterInner">
            <span className="eyebrow">STAY CONNECTED</span>
            <h2>{t.stayConnected}</h2>
            <p>{t.subscribeText}</p>
            <div className="newsletterForm">
              <input type="email" placeholder={t.yourEmail} />
              <motion.button className="btn primary" whileHover={{ y: -2 }} whileTap={{ scale: .96 }}>
                <Send size={16} /> {t.subscribeBtn}
              </motion.button>
            </div>
          </div>
        </AnimateScroll>
      </section>

      <section className="section faq" id="faq">
        <AnimateScroll>
          <div className="sectionHead center">
            <div><span className="eyebrow">FAQ</span><h2>{t.faqTitle}</h2></div>
          </div>
        </AnimateScroll>
        <StaggerContainer className="faqList">
          {faqData.map((f, i) => (
            <StaggerItem key={i}>
              <motion.div
                className={`faqItem ${openFaq === i ? 'open' : ''}`}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: .2 }}
              >
                <motion.button
                  className="faqQ"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  whileHover={{ x: 4 }}
                >
                  {f.q}
                  <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: .3 }}>
                    <ChevronDown size={18} />
                  </motion.span>
                </motion.button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: .3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p className="faqA">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <motion.section
        className="ctaBanner"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: .8 }}
      >
        <span className="eyebrow">{t.letsCreate}</span>
        <h2>{t.transforming}</h2>
        <motion.div whileHover={{ y: -4, boxShadow: '0 15px 40px rgba(0,0,0,.25)' }} whileTap={{ scale: .96 }}>
          <Link className="btn light btnLg" to="/custom">{t.startJourney} <Sparkles size={18} /></Link>
        </motion.div>
      </motion.section>
    </>
  );
}

function ShopPage({ products, addToCart, wish, setWish, t }: { products: Product[]; addToCart: (p: Product) => void; wish: string[]; setWish: (x: string[]) => void; t: typeof translations.ar }) {
  const location = useLocation();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(new URLSearchParams(location.search).get('cat') || '');
  const [sort, setSort] = useState('');

  useEffect(() => { setCat(new URLSearchParams(location.search).get('cat') || ''); }, [location.search]);

  const filtered = useMemo(() => {
    let items = products.filter(p => (!cat || p.category === cat) && (p.name + p.category + p.desc + (p.name_en || '') + (p.desc_en || '')).toLowerCase().includes(q.toLowerCase()));
    if (sort === 'priceLow') items = [...items].sort((a, b) => a.price - b.price);
    else if (sort === 'priceHigh') items = [...items].sort((a, b) => b.price - a.price);
    else if (sort === 'newest') items = [...items].reverse();
    return items;
  }, [products, cat, q, sort]);

  return (
    <motion.section className="section page" {...pageVariants}>
      <div className="sectionHead">
        <AnimateScroll><div><span className="eyebrow">SHOP</span><h2>{t.shopTitle}</h2></div></AnimateScroll>
      </div>

      <div className="shopToolbar">
        <AnimateScroll>
          <div className="searchBar"><Search size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder={t.searchPlaceholder} /></div>
        </AnimateScroll>
        <AnimateScroll delay={.05}>
          <div className="shopSort">
            <Filter size={16} />
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="">{t.sortAll}</option>
              <option value="priceLow">{t.sortPriceLow}</option>
              <option value="priceHigh">{t.sortPriceHigh}</option>
              <option value="newest">{t.sortNewest}</option>
            </select>
          </div>
        </AnimateScroll>
      </div>

      <AnimateScroll>
        <div className="filterPills">
          <motion.button className={!cat ? 'pill active' : 'pill'} onClick={() => setCat('')} whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}>{t.allPill}</motion.button>
          {occasions.map(o => (
            <motion.button key={o} className={cat === o ? 'pill active' : 'pill'} onClick={() => setCat(o)} whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}>
              {occLabel(o)}
            </motion.button>
          ))}
        </div>
      </AnimateScroll>

      <p className="productCount">{filtered.length} {t.productsCountWord}</p>

      <StaggerContainer className="productGrid">
        {filtered.map(p => (
          <StaggerItem key={p.id}>
            <ProductCard p={p} addToCart={addToCart} wish={wish} setWish={setWish} t={t} />
          </StaggerItem>
        ))}
      </StaggerContainer>

      {!filtered.length && (
        <AnimateScroll>
          <div className="emptyState">
            <Search size={48} strokeWidth={1} />
            <h3>{t.noResultsTitle}</h3>
            <p>{t.noResultsSub}</p>
          </div>
        </AnimateScroll>
      )}
    </motion.section>
  );
}

function ProductPage({ products, addToCart, wish, setWish, t }: { products: Product[]; addToCart: (p: Product) => void; wish: string[]; setWish: (x: string[]) => void; t: typeof translations.ar }) {
  const { id } = useParams();
  const p = products.find(x => x.id === id) || products[0];
  const [qty, setQty] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const liked = wish.includes(p.id);
  const related = useMemo(() => products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4), [products, p]);

  useEffect(() => { setQty(1); }, [id]);

  return (
    <motion.section className="section page productPage" {...pageVariants}>
      <div className="productPageGrid">
        <AnimateScroll>
          <div className="productGallery">
            <motion.img
              src={p.image}
              alt={p.name}
              className="galleryMain"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: .8, ease }}
            />
          </div>
        </AnimateScroll>

        <div className="productInfo">
          <AnimateScroll delay={.1}><span className="eyebrow">{occLabel(p.category)}</span></AnimateScroll>
          <AnimateScroll delay={.15}><h1>{prodName(p)}</h1></AnimateScroll>
          <AnimateScroll delay={.2}><strong className="detailPrice priceGrad">{money(p.price)}</strong></AnimateScroll>
          <AnimateScroll delay={.25}>
            <div className="stockBadge">
              <ShieldCheck size={16} />
              {p.stock > 0 ? `${t.available} • ${p.stock} ${t.pieces}` : t.outStock}
            </div>
          </AnimateScroll>
          <AnimateScroll delay={.3}><p className="productLead">{prodDesc(p)}</p></AnimateScroll>

          <AnimateScroll delay={.35}>
            <div className="qtySelector">
              <span>{t.qty}</span>
              <div className="qtyButtons">
                <motion.button whileTap={{ scale: .85 }} onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></motion.button>
                <span className="qtyValue">{qty}</span>
                <motion.button whileTap={{ scale: .85 }} onClick={() => setQty(Math.min(p.stock, qty + 1))}><Plus size={16} /></motion.button>
              </div>
            </div>
          </AnimateScroll>

          <AnimateScroll delay={.4}>
            <div className="productActions">
              <motion.button
                className="btn primary btnLg"
                whileHover={{ y: -3 }}
                whileTap={{ scale: .96 }}
                onClick={() => { for (let i = 0; i < qty; i++) addToCart(p); }}
                disabled={p.stock === 0}
              >
                <ShoppingBag size={18} /> {t.addToCart}
              </motion.button>
              <motion.button
                className="btn ghost"
                whileHover={{ y: -3 }}
                whileTap={{ scale: .96 }}
                onClick={() => setWish(liked ? wish.filter(x => x !== p.id) : [...wish, p.id])}
              >
                <Heart size={18} fill={liked ? 'var(--rose)' : 'none'} color={liked ? 'var(--rose)' : 'currentColor'} />
                {liked ? t.saved : t.save}
              </motion.button>
            </div>
          </AnimateScroll>

          <AnimateScroll delay={.45}>
            <div className="detailsAccordion">
              <motion.button
                className="detailsAccordionBtn"
                onClick={() => setDetailsOpen(!detailsOpen)}
                whileHover={{ x: 4 }}
              >
                {t.productDetails}
                <motion.span animate={{ rotate: detailsOpen ? 180 : 0 }} transition={{ duration: .3 }}>
                  <ChevronDown size={18} />
                </motion.span>
              </motion.button>
              <AnimatePresence>
                {detailsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: .3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="detailsContent">
                      {t.details.map((d, i) => <p key={i}><b>{d.l}:</b> {d.t}</p>)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </AnimateScroll>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="sectionHead">
            <AnimateScroll><div><span className="eyebrow">RELATED</span><h2>{t.relatedTitle}</h2></div></AnimateScroll>
          </div>
          <StaggerContainer className="productGrid">
            {related.map(rp => (
              <StaggerItem key={rp.id}>
                <ProductCard p={rp} addToCart={addToCart} wish={wish} setWish={setWish} t={t} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}
    </motion.section>
  );
}

const PALETTES: Record<string, { bg: string; deep: string; soft: string }> = {
  'آيفوري وذهبي': { bg: '#fdfaf3', deep: '#a97c50', soft: '#efe2cb' },
  'وردي ذهبي': { bg: '#fdf3f1', deep: '#b96a60', soft: '#f4d9d3' },
  'أبيض وفضي': { bg: '#f9fafb', deep: '#8b95a1', soft: '#dfe3e8' },
  'كحلي وذهبي': { bg: '#eff2f8', deep: '#33415e', soft: '#d5dcec' }
};
const TYPE_ICONS: Record<string, any> = { 'علبة': Box, 'برطمان': Package, 'كيس فاخر': ShoppingBag, 'بوكس هدية': Gift };

function Customizer({ t }: { t: typeof translations.ar }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Design>({ occasion: 'زفاف', type: 'علبة', qty: 30, color: 'آيفوري وذهبي', name: '', date: '', extras: '' });
  const [sent, setSent] = useState(false);
  const steps = ['المناسبة', 'التوزيعة', 'التفاصيل', 'المراجعة'];
  const pal = PALETTES[form.color] || PALETTES['آيفوري وذهبي'];
  const TypeIcon = TYPE_ICONS[form.type] || Gift;
  const monogram = (form.name.trim()[0] || 'E').toUpperCase();

  const submit = async () => {
    if (supabase) {
      const { error } = await supabase.from('custom_designs').insert({
        reference: `CD-${Date.now().toString().slice(-7)}`,
        occasion: form.occasion, favor_type: form.type, quantity: form.qty,
        palette: form.color, inscription: form.name, event_date: form.date || null, extras: form.extras
      });
      if (error) { alert(error.message); return; }
    } else {
      localStorage.setItem('em-design', JSON.stringify(form));
    }
    setSent(true);
  };

  return (
    <motion.section className="section page customPage" {...pageVariants}>
      <div className="studioHero">
        <span className="studioGlow g1" /><span className="studioGlow g2" /><span className="studioGlow g3" />
        <AnimateScroll className="studioHeroInner">
          <span className="eyebrow">BESPOKE STUDIO</span>
          <h1>{t.custTitle} <em>{t.custTitleAccent}</em></h1>
          <p>{t.custSub}</p>
        </AnimateScroll>
      </div>

      <div className="studioBody">
        <div className="studioPreviewCol">
          <motion.div
            className="favorBox"
            style={{ '--pvBg': pal.bg, '--pvDeep': pal.deep, '--pvSoft': pal.soft } as React.CSSProperties}
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }}
          >
            <span className="ribbonV" /><span className="ribbonH" />
            <motion.span key={monogram + form.name} className="monogram" initial={{ scale: .5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>{monogram}</motion.span>
            <div className="favorText">
              <motion.b key={form.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}>{form.name || t.previewNamePh}</motion.b>
              <small>{form.date || t.previewDatePh}</small>
            </div>
            <div className="favorMeta"><TypeIcon size={13} /> {pickLabel(form.type, favorTypeEn)}<i>•</i>{pickLabel(form.color, colorEn)}</div>
            <div className="swatchRow">
              {Object.keys(PALETTES).map(c => (
                <button key={c} type="button" title={pickLabel(c, colorEn)} className={c === form.color ? 'swatch on' : 'swatch'} style={{ background: PALETTES[c].deep }} onClick={() => setForm({ ...form, color: c })} />
              ))}
            </div>
          </motion.div>
          <p className="previewHint"><Sparkles size={14} /> {t.previewHint}</p>
        </div>

        <div className="studioFormCol">
          <div className="stepPills">
            {t.custSteps.map((s, i) => (
              <button key={s} type="button" className={i === step ? 'on' : i < step ? 'done' : ''} disabled={i > step} onClick={() => setStep(i)}>
                <i>{i < step ? <Check size={11} /> : i + 1}</i>
                <span>{s}</span>
              </button>
            ))}
          </div>

          <div className="studioCard">
            {sent ? (
              <motion.div className="successBlock" initial={{ opacity: 0, scale: .85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260 }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: .1 }}>
                  <Check size={44} />
                </motion.div>
                <h3>{t.designReceivedT}</h3>
                <p>{t.designReceivedP}</p>
                <Link className="btn primary" to="/shop">{t.exploreProducts}</Link>
              </motion.div>
            ) : (
              <>
                <span className="stepTitle">{t.stepWord} {step + 1} {t.ofWord} 4 — {t.custSteps[step]}</span>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: .28, ease }}
                    className="stepContent"
                  >
                    {step === 0 && (
                      <div className="occGrid">
                        {occasions.map((o, i) => (
                          <button key={o} type="button" className={form.occasion === o ? 'occCard on' : 'occCard'} onClick={() => setForm({ ...form, occasion: o })}>
                            <span className="occIdx">{String(i + 1).padStart(2, '0')}</span>
                            <b>{occLabel(o)}</b>
                            <ArrowLeft size={15} className="flip-x occArrow" />
                          </button>
                        ))}
                      </div>
                    )}
                    {step === 1 && (
                      <div className="typeGrid">
                        {['علبة', 'برطمان', 'كيس فاخر', 'بوكس هدية'].map(ty => {
                          const I = TYPE_ICONS[ty] || Gift;
                          return (
                            <button key={ty} type="button" className={form.type === ty ? 'typeCard on' : 'typeCard'} onClick={() => setForm({ ...form, type: ty })}>
                              <I size={24} strokeWidth={1.6} />
                              <b>{pickLabel(ty, favorTypeEn)}</b>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {step === 2 && (
                      <div className="formGrid">
                        <label>{t.qty}<input type="number" min="1" value={form.qty} onChange={e => setForm({ ...form, qty: Math.max(1, +e.target.value || 1) })} /></label>
                        <label>{t.sColor}<select value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}>{Object.keys(PALETTES).map(c => <option key={c} value={c}>{pickLabel(c, colorEn)}</option>)}</select></label>
                        <label className="wide">{t.printedName}<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t.namePlaceholder} /></label>
                        <label className="wide">{t.dateLabel}<input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
                        <label className="wide">{t.extraNotes}<textarea value={form.extras} onChange={e => setForm({ ...form, extras: e.target.value })} placeholder={t.extrasPlaceholder} /></label>
                      </div>
                    )}
                    {step === 3 && (
                      <div className="summaryReview">
                        <div className="summaryRow link" onClick={() => setStep(0)}><span>{t.sOccasion}</span><b>{occLabel(form.occasion)}</b><Edit3 size={13} /></div>
                        <div className="summaryRow link" onClick={() => setStep(1)}><span>{t.sType}</span><b>{pickLabel(form.type, favorTypeEn)}</b><Edit3 size={13} /></div>
                        <div className="summaryRow link" onClick={() => setStep(2)}><span>{t.sQty}</span><b>{form.qty} {t.piecesWord}</b><Edit3 size={13} /></div>
                        <div className="summaryRow link" onClick={() => setStep(2)}><span>{t.sColor}</span><b>{pickLabel(form.color, colorEn)}</b><Edit3 size={13} /></div>
                        <div className="summaryRow link" onClick={() => setStep(2)}><span>{t.sName}</span><b>{form.name || '---'}</b><Edit3 size={13} /></div>
                        <div className="summaryRow link" onClick={() => setStep(2)}><span>{t.sDate}</span><b>{form.date || '---'}</b><Edit3 size={13} /></div>
                        {form.extras && <div className="summaryRow link" onClick={() => setStep(2)}><span>{t.sNotes}</span><b>{form.extras}</b><Edit3 size={13} /></div>}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="stepNav">
                  {step > 0 ? (
                    <motion.button className="btn ghost" whileTap={{ scale: .95 }} onClick={() => setStep(step - 1)}>
                      <ArrowRight size={16} className="flip-x" /> {t.prevBtn}
                    </motion.button>
                  ) : <span />}
                  {step < steps.length - 1 ? (
                    <motion.button className="btn primary" whileHover={{ y: -2 }} whileTap={{ scale: .95 }} onClick={() => setStep(step + 1)}>
                      {t.nextBtn} <ArrowLeft size={16} className="flip-x" />
                    </motion.button>
                  ) : (
                    <motion.button className="btn primary btnLg" whileHover={{ y: -2 }} whileTap={{ scale: .95 }} onClick={submit}>
                      {t.sendDesign} <Sparkles size={16} />
                    </motion.button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

type SetCart = React.Dispatch<React.SetStateAction<CartItem[]>>;
function CheckoutPage({ cart, setCart, cartTotal, t }: { cart: CartItem[]; setCart: SetCart; cartTotal: number; t: typeof translations.ar }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: 'القاهرة', address: '', occasion: 'سبوع', notes: '', payment: 'instapay' });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [done, setDone] = useState<string | null>(null);

  // Per business specs, shipping & final price are confirmed after admin review, but we show estimated starting subtotal & request submission
  const storeCfg = getLocal<any | null>('em-settings', null);
  const SHIP_FEE = Number(storeCfg?.shippingFee) > 0 ? Number(storeCfg.shippingFee) : 25;
  const FREE_OVER = Number(storeCfg?.freeShippingThreshold) || 500;
  const estimatedShipping = cartTotal >= FREE_OVER ? 0 : SHIP_FEE;
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent' ? Math.round(cartTotal * appliedCoupon.discount / 100) : appliedCoupon.discount
    : 0;
  const estimatedTotal = cartTotal - discount + estimatedShipping;

  const defaultCoupons: Coupon[] = [
    { id: 'c1', code: 'MOMENTS10', discount: 10, type: 'percent', maxUsage: 100, usageCount: 12, minOrder: 200, expiry: '2026-12-31', active: true },
    { id: 'c2', code: 'ESRAA2026', discount: 15, type: 'percent', maxUsage: 50, usageCount: 5, minOrder: 300, expiry: '2026-12-31', active: true },
  ];

  const applyCoupon = async () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    let c: Coupon | null = null;
    if (supabase) {
      const { data } = await supabase.from('coupons').select('*').eq('code', code).eq('is_active', true).maybeSingle();
      if (data) c = {
        id: data.id, code: data.code, discount: Number(data.amount), type: data.discount_type === 'fixed' ? 'fixed' : 'percent',
        maxUsage: data.usage_limit ?? Infinity, usageCount: data.used_count ?? 0, minOrder: 0,
        expiry: data.expires_at || '', active: !!data.is_active
      };
    } else {
      c = defaultCoupons.find(x => x.code.toUpperCase() === code && x.active) || null;
    }
    if (!c) { setCouponError(t.errInvalidCoupon); return; }
    if (c.expiry && new Date(c.expiry).getTime() < Date.now()) { setCouponError(t.errExpiredCoupon); return; }
    if (c.maxUsage !== Infinity && c.usageCount >= c.maxUsage) { setCouponError(t.errUsedUpCoupon); return; }
    if (c.minOrder > cartTotal) { setCouponError(`${t.errMinOrderPrefix} ${money(c.minOrder)}`); return; }
    setAppliedCoupon(c);
    setCouponError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;
    const orderNo = `EM-${Date.now().toString().slice(-8)}`;
    const orderData = {
      order_number: orderNo,
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: form.email,
      city: form.city,
      address: form.address,
      occasion: form.occasion,
      notes: form.notes,
      payment_method: form.payment,
      subtotal: cartTotal,
      shipping_fee: estimatedShipping,
      total: estimatedTotal,
      status: 'قيد المراجعة',
      payment_status: 'بانتظار تأكيد السعر والشحن',
      items: cart,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase.from('orders').insert({
        order_number: orderNo, customer_name: form.name, customer_phone: form.phone,
        customer_email: form.email, city: form.city, address: form.address,
        occasion: form.occasion, notes: form.notes, payment_method: form.payment,
        subtotal: cartTotal, shipping_fee: estimatedShipping, discount, total: estimatedTotal,
        status: 'pending', payment_status: 'unpaid'
      }).select().single();
      if (error) { alert(error.message); return; }
      await supabase.from('order_items').insert(cart.map(i => ({
        order_id: data.id, product_id: i.id, name: i.name,
        unit_price: i.price, quantity: i.qty, total: i.price * i.qty
      })));
      if (appliedCoupon) {
        await supabase.from('coupons').update({ used_count: appliedCoupon.usageCount + 1 }).eq('id', appliedCoupon.id);
      }
    } else {
      localStorage.setItem('em-last-order', JSON.stringify(orderData));
      const existingOrders = getLocal<any[]>('em-all-orders', []);
      localStorage.setItem('em-all-orders', JSON.stringify([orderData, ...existingOrders]));
    }
    setCart([]);
    setDone(orderNo);
  };

  if (done) return (
    <motion.section className="section page successPage" {...pageVariants}>
      <motion.div className="successIcon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
        <Check size={48} />
      </motion.div>
      <h1>{t.successTitle}</h1>
      <p className="orderNumber">{t.orderNoWord} <b>{done}</b></p>
      <p>{t.successDesc}</p>
      <motion.div whileHover={{ y: -3 }} whileTap={{ scale: .96 }}>
        <Link className="btn primary" to={`/track?order=${done}`}><MapPin size={18} /> {t.trackAndPay}</Link>
      </motion.div>
    </motion.section>
  );

  if (!cart.length) return (
    <motion.section className="section page" {...pageVariants}>
      <div className="emptyState">
        <ShoppingBag size={48} strokeWidth={1} />
        <h3>{t.cartEmptyTitle}</h3>
        <p>{t.cartEmptySub}</p>
        <Link className="btn primary" to="/shop">{t.browseShop}</Link>
      </div>
    </motion.section>
  );

  return (
    <motion.section className="section page" {...pageVariants}>
      <div className="sectionHead">
        <AnimateScroll><div><span className="eyebrow">ORDER REQUEST</span><h2>{t.checkoutTitle}</h2></div></AnimateScroll>
      </div>
      <form className="checkoutGrid" onSubmit={submit}>
        <div className="checkoutFields">
          <AnimateScroll><label><span className="labelIcon"><Phone size={14} /></span> {t.fullName}<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label></AnimateScroll>
          <AnimateScroll delay={.05}><label><span className="labelIcon"><Phone size={14} /></span> {t.phoneNum}<input type="tel" required pattern="01[0-9]{9}" title={uiLang === 'en' ? 'Egyptian mobile, e.g. 01012345678' : 'رقم موبايل مصري مثل 01012345678'} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" /></label></AnimateScroll>
          <AnimateScroll delay={.1}><label><span className="labelIcon"><Mail size={14} /></span> {t.emailLabel}<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label></AnimateScroll>
          <AnimateScroll delay={.15}><label><span className="labelIcon"><MapPin size={14} /></span> {t.cityLabel}<select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>{['القاهرة', 'الإسكندرية', 'الجيزة', 'المنصورة', 'أخرى'].map(c => <option key={c} value={c}>{pickLabel(c, cityEn)}</option>)}</select></label></AnimateScroll>
          <AnimateScroll delay={.2}><label className="wide"><span className="labelIcon"><MapPin size={14} /></span> {t.addressLabel}<textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></label></AnimateScroll>
          <AnimateScroll delay={.25}><label><span className="labelIcon"><Gift size={14} /></span> {t.occasionField}<select value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })}>{occasions.map(o => <option key={o} value={o}>{occLabel(o)}</option>)}</select></label></AnimateScroll>
          <AnimateScroll delay={.3}><label className="wide"><span className="labelIcon"><Edit3 size={14} /></span> {t.notesLabel}<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder={t.notesPlaceholder} /></label></AnimateScroll>

          <AnimateScroll delay={.35}>
            <div className="paymentSection">
              <p className="paymentTitle"><CreditCard size={16} /> {t.paymentPreferred}</p>
              {([
                { key: 'instapay', label: t.payInstapay, icon: <DollarSign size={16} /> },
                { key: 'wallet', label: t.payWallet, icon: <CreditCard size={16} /> }
              ] as const).map(opt => (
                <motion.button
                  key={opt.key}
                  type="button"
                  className={form.payment === opt.key ? 'paymentOption active' : 'paymentOption'}
                  whileTap={{ scale: .97 }}
                  onClick={() => setForm({ ...form, payment: opt.key })}
                >
                  {opt.icon} {opt.label}
                </motion.button>
              ))}
            </div>
          </AnimateScroll>
        </div>

        <AnimateScroll>
          <div className="orderSummaryCard">
            <h3>{t.orderSummary}</h3>
            {cart.map(i => (
              <div key={i.id} className="summaryItem">
                <span>{prodName(i)} × {i.qty}</span>
                <b>{money(i.price * i.qty)}</b>
              </div>
            ))}
            <hr />
            <div className="summaryItem"><span>{t.subtotal}</span><b>{money(cartTotal)}</b></div>
            <div className="summaryItem"><span>{t.shipping} {t.estimated}</span><b className={estimatedShipping === 0 ? 'freeShipping' : ''}>{estimatedShipping ? money(estimatedShipping) : t.free}</b></div>

            <div className="couponSection">
              <div className="couponInput">
                <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder={t.couponPlaceholder} />
                <motion.button type="button" className="btn primary" whileTap={{ scale: .95 }} onClick={applyCoupon}>{t.applyBtn}</motion.button>
              </div>
              {couponError && <p className="couponError">{couponError}</p>}
              {appliedCoupon && (
                <p className="couponApplied">
                  <Check size={14} /> {t.couponAppliedPrefix} {appliedCoupon.code} — {t.discountWord} {appliedCoupon.type === 'percent' ? `${appliedCoupon.discount}%` : money(appliedCoupon.discount)}
                </p>
              )}
            </div>

            {discount > 0 && <div className="summaryItem discount"><span>{t.discountLabel}</span><b>-{money(discount)}</b></div>}
            <hr />
            <div className="summaryGrand"><span>{t.grandEst}</span><b>{money(estimatedTotal)}</b></div>
            <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>{t.finalPriceNote}</p>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: .96 }} style={{ marginTop: 16 }}>
              <button className="btn primary full btnLg" type="submit" disabled={!cart.length}>
                <Send size={18} /> {t.submitOrder}
              </button>
            </motion.div>
          </div>
        </AnimateScroll>
      </form>
    </motion.section>
  );
}

function TrackingPage({ t }: { t: typeof translations.ar }) {
  const location = useLocation();
  const q = new URLSearchParams(location.search).get('order');
  const [order, setOrder] = useState<any>(null);
  const [input, setInput] = useState(q || '');
  const [found, setFound] = useState<boolean | null>(null);
  const [proofFile, setProofFile] = useState<string | null>(null);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const payPhone = getLocal<any | null>('em-settings', null)?.phone || '01000000000';

  const statusList = t.statusFlow;
  const codeIdx: Record<string, number> = { pending: 0, waiting_price: 0, confirmed: 1, unpaid: 2, proof_submitted: 3, processing: 4, ready: 5, shipped: 5, delivered: 6 };
  const legacyIdx: Record<string, number> = {
    'قيد المراجعة': 0, 'بانتظار تأكيد السعر والشحن': 0, 'Under Review': 0, 'Awaiting Price Confirmation': 0,
    'تم تأكيد السعر': 1, 'Price Confirmed': 1,
    'بانتظار الدفع': 2, 'Awaiting Payment': 2,
    'تم رفع إيصال الدفع': 3, 'تم رفع الإيصال (قيد التحقق)': 3, 'Receipt Submitted': 3, 'Receipt Submitted (Under Review)': 3,
    'تم التحقق والإنتاج': 4, 'Verified & In Production': 4,
    'جاهز للشحن': 5, 'Ready to Ship': 5, 'تم الشحن': 5, 'Shipped': 5,
    'مكتمل': 6, 'Completed': 6
  };
  const idxOf = (v?: string | null) => (v == null ? -1 : codeIdx[v] ?? legacyIdx[v] ?? -1);
  const flowIndex = (o: any): number => Math.max(idxOf(o?.status), idxOf(o?.payment_status), 0);
  const statusIdx = order ? flowIndex(order) : 0;

  const search = async (val?: string) => {
    const v = (typeof val === 'string' ? val : input).trim();
    if (!v) return;
    if (supabase) {
      const { data } = await supabase.from('orders').select('*').eq('order_number', v).maybeSingle();
      setOrder(data); setFound(!!data);
    } else {
      const allOrders = getLocal<any[]>('em-all-orders', []);
      const foundOrd = allOrders.find(o => o.order_number === v);
      const lastOrd = getLocal<any | null>('em-last-order', null);
      const match = foundOrd || (lastOrd?.order_number === v ? lastOrd : null);
      if (match) { setOrder(match); setFound(true); }
      else { setOrder(null); setFound(false); }
    }
  };

  useEffect(() => {
    if (!q) return;
    setInput(q);
    const timer = setTimeout(() => search(q), 300);
    return () => clearTimeout(timer);
  }, [q]);

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !order) return;
    setProofFile(file.name);
    const updated = { ...order, status: 'proof_submitted', payment_status: 'proof_submitted' };
    if (supabase) {
      const proofNote = `[${uiLang === 'en' ? 'Payment receipt uploaded' : 'تم رفع إيصال دفع'}: ${file.name} — ${new Date().toLocaleString(uiLang === 'en' ? 'en-US' : 'ar-EG')}]`;
      const { error } = await supabase.from('orders').update({ payment_status: 'proof_submitted', notes: `${order.notes || ''}\n${proofNote}`.trim() }).eq('id', order.id);
      if (error) { alert((uiLang === 'en' ? 'Could not upload receipt, please try again: ' : 'تعذر رفع الإيصال، حاولي مرة أخرى: ') + error.message); return; }
    } else {
      localStorage.setItem('em-last-order', JSON.stringify(updated));
      const allOrders = getLocal<any[]>('em-all-orders', []).map(o => o.order_number === order.order_number ? updated : o);
      localStorage.setItem('em-all-orders', JSON.stringify(allOrders));
    }
    setOrder(updated);
    setProofSubmitted(true);
  };

  return (
    <motion.section className="section page" {...pageVariants}>
      <div className="sectionHead">
        <AnimateScroll><div><span className="eyebrow">ORDER TRACKING & PAYMENT</span><h2>{t.trackTitle}</h2></div></AnimateScroll>
      </div>
      <div className="trackingPage">
        <AnimateScroll>
          <div className="trackingSearch">
            <Search size={18} />
            <input value={input} onChange={e => setInput(e.target.value)} placeholder={t.orderPlaceholder} onKeyDown={e => e.key === 'Enter' && search()} />
            <motion.button className="btn primary" whileHover={{ y: -2 }} whileTap={{ scale: .95 }} onClick={() => search()}>{t.searchBtn}</motion.button>
          </div>
        </AnimateScroll>

        {order ? (
          <AnimateScroll>
            <div className="trackingCard">
              <div className="trackingCardHead">
                <Package size={24} />
                <div>
                  <h3>{order.order_number}</h3>
                  <p>{t.customerWord} <b>{order.customer_name || '---'}</b></p>
                </div>
              </div>
              <div className="trackingMeta">
                <div><span>{t.orderStatusLabelK}</span><b>{orderStatusLabel(order.status) || t.statusFlow[0]}</b></div>
                <div><span>{t.paymentStatus}</span><b className="priceGrad">{paymentStatusLabel(order.payment_status) || orderStatusLabels.ar.waiting_price}</b></div>
                <div><span>{t.totalFinalLabel}</span><b className="priceGrad">{money(Number(order.total || 0))}</b></div>
                <div><span>{t.shippingConfirmedLabel}</span><b>{money(Number(order.shipping_fee || 25))}</b></div>
                <div><span>{t.addressShort}</span><b>{order.city || '---'} - {order.address || '---'}</b></div>
              </div>

              {/* Payment instructions & proof upload */}
              <div className="paymentWorkflowBox" style={{ marginTop: 24, padding: 20, background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <h4><CreditCard size={18} /> {t.paymentInstructionsTitle}</h4>
                <p style={{ marginTop: 8, fontSize: 14 }}>{uiLang === 'en'
                  ? <>Please transfer the final total ({money(Number(order.total || 0))}) via InstaPay or Vodafone Cash to: <b>{payPhone}</b>.</>
                  : <>يرجى التحويل عبر InstaPay أو محفظة فودافون كاش إلى الرقم: <b>{payPhone}</b> بالمبلغ الإجمالي النهائي ({money(Number(order.total || 0))}).</>}
                </p>
                <p style={{ marginTop: 4, fontSize: 13, color: 'var(--muted)' }}>{t.payInstrNote}</p>

                <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label className="btn primary" style={{ cursor: 'pointer' }}>
                    <Upload size={16} /> {t.uploadProof}
                    <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleProofUpload} />
                  </label>
                  {(proofFile || proofSubmitted || order.payment_status === 'proof_submitted' || order.payment_status?.includes('تم رفع')) && (
                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                      <Check size={16} /> {t.proofDone} ({proofFile || t.proofFileFallback}) — {t.proofUnderReview}
                    </span>
                  )}
                </div>
              </div>

              <div className="trackingTimeline" style={{ marginTop: 24 }}>
                {statusList.map((s, i) => (
                  <motion.span
                    key={s}
                    className={i <= (statusIdx >= 0 ? statusIdx : 0) ? 'timelineStep active' : 'timelineStep'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * .1 }}
                  >
                    <i>{i <= (statusIdx >= 0 ? statusIdx : 0) ? <Check size={14} /> : i + 1}</i>{s}
                  </motion.span>
                ))}
              </div>
            </div>
          </AnimateScroll>
        ) : found === false ? (
          <AnimateScroll>
            <div className="emptyState">
              <Search size={48} strokeWidth={1} />
              <h3>{t.notFoundTitle}</h3>
              <p>{t.notFoundSub}</p>
            </div>
          </AnimateScroll>
        ) : (
          <AnimateScroll>
            <div className="emptyState">
              <MapPin size={48} strokeWidth={1} />
              <h3>{t.enterNoTitle}</h3>
              <p>{t.enterNoSub}</p>
            </div>
          </AnimateScroll>
        )}
      </div>
    </motion.section>
  );
}

function LoginPage({ t }: { t: typeof translations.ar }) {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!supabase) { localStorage.setItem('em-admin-demo', '1'); nav('/admin'); return; }
    const r = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (r.error) { setError(r.error.message); return; }
    if (mode === 'signup') {
      setError(t.signupNotice);
      setMode('login');
      return;
    }
    const userId = r.data.user?.id;
    const { data: roles, error: roleErr } = await supabase.from('user_roles').select('role').eq('user_id', userId).in('role', ['admin', 'staff']);
    if (roleErr || !roles || roles.length === 0) {
      await supabase.auth.signOut();
      setError(t.noRoleError);
      return;
    }
    nav('/admin');
  };

  return (
    <motion.section className="section page authPage" {...pageVariants}>
      <AnimateScale>
        <div className="authCard">
          <motion.div className="authIcon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <LogIn size={28} />
          </motion.div>
          <span className="eyebrow">ACCOUNT</span>
          <h1>{mode === 'login' ? t.loginTitle : t.signupTitle}</h1>
          <form onSubmit={submit}>
            <label>
              <span className="labelIcon"><Mail size={14} /></span>
              {t.emailLabel}
              <input type="email" required placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <label>
              <span className="labelIcon"><Lock size={14} /></span>
              {t.passwordLabel}
              <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </label>
            <motion.button className="btn primary full btnLg" whileHover={{ y: -2 }} whileTap={{ scale: .96 }}>
              <LogIn size={18} /> {mode === 'login' ? t.loginBtn : t.signupBtn}
            </motion.button>
          </form>
          {error && <p className="authError">{error}</p>}
          <motion.button
            className="textButton"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: .98 }}
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
          >
            {mode === 'login' ? t.noAccount : t.haveAccount}
          </motion.button>
        </div>
      </AnimateScale>
    </motion.section>
  );
}

function AdminPage({ t }: { t: typeof translations.ar }) {
  const [tab, setTab] = useState('dashboard');
  const [logged, setLogged] = useState(!supabase && localStorage.getItem('em-admin-demo') === '1');
  const [checkingAuth, setCheckingAuth] = useState(!!supabase);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(seed);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([
    { id: 'c1', code: 'MOMENTS10', discount: 10, type: 'percent', maxUsage: 100, usageCount: 12, minOrder: 200, expiry: '2026-12-31', active: true },
    { id: 'c2', code: 'ESRAA2026', discount: 15, type: 'percent', maxUsage: 50, usageCount: 5, minOrder: 300, expiry: '2026-12-31', active: true },
  ]);
  const [settings, setSettings] = useState({
    storeName: 'ESRAA Moments', storeDesc: 'تفاصيل صغيرة تصنع لحظات لا تُنسى',
    logoUrl: '/images/logo.jpeg', shippingFee: '25', freeShippingThreshold: '500',
    whatsapp: '201xxxxxxxxx', email: 'info@esraamoments.com', phone: '01000000000',
    instagram: 'https://instagram.com/esraamomentsstore', tiktok: 'https://tiktok.com/@esraamomentsstore'
  });

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (active) { setLogged(false); setCheckingAuth(false); } return; }
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).in('role', ['admin', 'staff']);
      if (!active) return;
      setLogged(!!roles && roles.length > 0);
      setCheckingAuth(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setLogged(false);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    (async () => {
      if (supabase) {
        if (!logged) return;
        const a = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50);
        if (a.data) setOrders(a.data as Order[]);
        const b = await supabase.from('products').select('id,name,price,stock,is_active,image_url,description,is_featured,categories(name)');
        if (b.data) setProducts(b.data.map((x: any) => ({
          id: x.id, name: x.name, category: x.categories?.name || '', price: Number(x.price),
          stock: x.stock, image: x.image_url || seed[0].image, desc: x.description || '', featured: !!x.is_featured
        })));
      } else {
        const localOrders = getLocal<Order[]>('em-all-orders', []);
        const lastOrder = getLocal<Order | null>('em-last-order', null);
        let combined = localOrders;
        if (lastOrder && !combined.some(o => o.order_number === lastOrder.order_number)) {
          combined = [lastOrder, ...combined];
        }
        if (combined.length) setOrders(combined);
      }
    })();
  }, [logged]);

  useEffect(() => {
    (async () => {
      if (!supabase || !logged) return;
      const c = await supabase.from('coupons').select('*');
      if (c.data) setCoupons(c.data.map((row: any) => ({
        id: row.id, code: row.code, discount: Number(row.amount), type: row.discount_type === 'fixed' ? 'fixed' : 'percent',
        maxUsage: row.usage_limit ?? Infinity, usageCount: row.used_count ?? 0, minOrder: 0,
        expiry: row.expires_at || '', active: !!row.is_active
      })));
      const s = await supabase.from('settings').select('value').eq('key', 'store').maybeSingle();
      if (s.data?.value) {
        const v = s.data.value;
        setSettings(prev => ({
          ...prev,
          storeName: v.name ?? prev.storeName,
          shippingFee: String(v.shippingFee ?? prev.shippingFee),
          freeShippingThreshold: String(v.freeShippingOver ?? prev.freeShippingThreshold),
          phone: v.phone ?? prev.phone,
          whatsapp: v.whatsapp ?? prev.whatsapp,
          instagram: v.instagram ?? prev.instagram,
          tiktok: v.tiktok ?? prev.tiktok
        }));
      }
    })();
  }, [logged]);

  useEffect(() => {
    const customerMap = new Map<string, Customer>();
    orders.forEach(o => {
      const name = o.customer_name || 'مجهول';
      const existing = customerMap.get(name);
      if (existing) { existing.ordersCount++; existing.totalSpent += Number(o.total || 0); }
      else customerMap.set(name, { name, email: o.customer_email || '', phone: o.customer_phone || '', ordersCount: 1, totalSpent: Number(o.total || 0) });
    });
    setCustomers(Array.from(customerMap.values()));
  }, [orders]);

  if (checkingAuth) return (
    <motion.section className="section page authPage" {...pageVariants}>
      <p className="muted">{t.admChecking}</p>
    </motion.section>
  );

  if (!logged) return (
    <motion.section className="section page authPage" {...pageVariants}>
      <AnimateScale>
        <div className="authCard">
          <motion.div className="authIcon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <LayoutDashboard size={28} />
          </motion.div>
          <span className="eyebrow">ADMIN</span>
          <h1>{t.admPanel}</h1>
          <p>{t.admProtected}</p>
          <Link className="btn primary full btnLg" to="/login"><LogIn size={18} /> {t.loginTitle}</Link>
        </div>
      </AnimateScale>
    </motion.section>
  );

  const tabs: [string, string, any][] = [
    ['dashboard', t.tabOverview, LayoutDashboard],
    ['products', t.tabProducts, Box],
    ['orders', t.tabOrders, Package],
    ['customers', t.tabCustomers, Users],
    ['coupons', t.tabCoupons, Tag],
    ['settings', t.tabSettings, Settings],
  ];

  return (
    <div className="admin">
      <aside className="adminSidebar">
        <div className="adminBrand">
          <img src="/images/logo.jpeg" alt="ESRAA" className="adminLogo" />
          <div><b>ESRAA</b><small>ADMIN</small></div>
        </div>
        {tabs.map(([k, label, Icon]) => (
          <motion.button
            key={k}
            className={tab === k ? 'sidebarLink active' : 'sidebarLink'}
            onClick={() => setTab(k)}
            whileHover={{ x: uiLang === 'en' ? 5 : -5 }}
            whileTap={{ scale: .97 }}
          >
            <Icon size={18} />{label}
          </motion.button>
        ))}
        <button
          className="sidebarLogout"
          onClick={async () => {
            if (supabase) await supabase.auth.signOut();
            localStorage.removeItem('em-admin-demo');
            setLogged(false);
          }}
        >
          <LogOut size={18} /> {t.logout}
        </button>
      </aside>

      <main className="adminMain">
        <div className="adminTop">
          <div>
            <span className="eyebrow">ESRAA MOMENTS</span>
            <h1>{tabs.find(t => t[0] === tab)?.[1]}</h1>
          </div>
          <Link className="btn ghost" to="/"><Store size={16} /> {t.viewStore}</Link>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: .3 }}>
            {tab === 'dashboard' && <DashboardPanel orders={orders} products={products} t={t} onNavigate={setTab} />}
            {tab === 'products' && <ProductsAdmin products={products} setProducts={setProducts} t={t} />}
            {tab === 'orders' && <OrdersAdmin orders={orders} setOrders={setOrders} t={t} />}
            {tab === 'customers' && <CustomersAdmin customers={customers} orders={orders} t={t} />}
            {tab === 'coupons' && <CouponsAdmin coupons={coupons} setCoupons={setCoupons} t={t} />}
            {tab === 'settings' && <SettingsAdmin settings={settings} setSettings={setSettings} t={t} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function DashboardPanel({ orders, products, t, onNavigate }: { orders: Order[]; products: Product[]; t: typeof translations.ar; onNavigate: (tab: string) => void }) {
  const totalSales = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const lowStock = products.filter(p => p.stock < 20);
  const recentOrders = orders.slice(0, 5);

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['Order', 'Customer', 'Phone', 'City', 'Subtotal', 'Shipping', 'Total', 'Payment', 'Date'],
      ...orders.map(o => [o.order_number, o.customer_name, o.customer_phone, o.city, o.subtotal ?? '', o.shipping_fee ?? '', o.total ?? '', paymentStatusLabel(o.payment_status) || o.payment_status || '', o.created_at?.slice(0, 10) || ''])
    ];
    const csv = '\uFEFF' + rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `esraa-orders-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <StaggerContainer className="statsGrid">
        {([
          { label: t.stSales, value: money(totalSales), Icon: TrendingUp, sub: t.stSalesSub },
          { label: t.stOrders, value: orders.length.toString(), Icon: Package, sub: t.stOrdersSub },
          { label: t.stProducts, value: products.length.toString(), Icon: Box, sub: t.stProductsSub },
          { label: t.stCustomers, value: new Set(orders.map(o => o.customer_name)).size.toString(), Icon: Users, sub: t.stCustomersSub },
        ] as const).map((item, i) => (
          <StaggerItem key={i}>
            <motion.div className="statCard" whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,.1)' }} transition={{ duration: .3 }}>
              <div className="statCardIcon"><item.Icon size={20} /></div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.sub}</small>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="adminGrid">
        <div className="adminPanel">
          <div className="panelHead">
            <h3><Clock size={18} /> {t.recentOrdersHead}</h3>
            <span className="muted">{orders.length} {t.ordersWord}</span>
          </div>
          <div className="adminTable">
            <div className="adminTableRow header">
              <span>{t.thOrderNo}</span><span>{t.thCustomer}</span><span>{t.thTotal}</span><span>{t.thPayStatus}</span><span>{t.thDate}</span>
            </div>
            {recentOrders.map(o => (
              <motion.div className="adminTableRow" key={o.id || o.order_number} whileHover={{ backgroundColor: 'var(--paper)' }}>
                <span><b>{o.order_number}</b></span>
                <span>{o.customer_name}</span>
                <span>{money(Number(o.total || 0))}</span>
                <span><span className="badge badgeWarning">{paymentStatusLabel(o.payment_status) || orderStatusLabel(o.status) || t.underReviewWord}</span></span>
                <small>{o.created_at ? new Date(o.created_at).toLocaleDateString(uiLang === 'en' ? 'en-US' : 'ar-EG') : '---'}</small>
              </motion.div>
            ))}
            {!recentOrders.length && <div className="adminTableRow"><span className="muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 30 }}>{t.noOrdersYet}</span></div>}
          </div>
        </div>

        <div className="adminPanel">
          <div className="panelHead"><h3><AlertTriangle size={18} /> {t.stockHead}</h3></div>
          {lowStock.length > 0 ? lowStock.map(p => (
            <motion.div className="stockAlert" key={p.id} whileHover={{ x: 4 }}>
              <div className="stockAlertInfo"><Box size={14} /><span>{prodName(p)}</span></div>
              <div className="stockAlertBar"><i style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }} /></div>
              <small>{p.stock} {t.piecesShort}</small>
            </motion.div>
          )) : <p className="muted">{t.allStockOk}</p>}

          <div className="panelHead" style={{ marginTop: 20 }}><h3><Sparkles size={18} /> {t.quickActionsHead}</h3></div>
          <div className="quickActions">
            <motion.button className="btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }} onClick={() => onNavigate('products')}><Plus size={16} /> {t.qaAddProduct}</motion.button>
            <motion.button className="btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }} onClick={exportCsv}><Download size={16} /> {t.qaExport}</motion.button>
            <motion.button className="btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }} onClick={() => onNavigate('coupons')}><Tag size={16} /> {t.qaCoupon}</motion.button>
          </div>
        </div>
      </div>
    </>
  );
}

function ProductsAdmin({ products, setProducts, t }: { products: Product[]; setProducts: (p: Product[] | ((prev: Product[]) => Product[])) => void; t: typeof translations.ar }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: 'سبوع', price: '', stock: '', image: '', desc: '', featured: false });

  const resetForm = () => { setForm({ name: '', category: 'سبوع', price: '', stock: '', image: '', desc: '', featured: false }); setEditId(null); setShowForm(false); };
  const startEdit = (p: Product) => { setForm({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock), image: p.image, desc: p.desc, featured: !!p.featured }); setEditId(p.id); setShowForm(true); };

  const slugify = (name: string) => name.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '') || `p-${Date.now()}`;

  const saveProduct = async () => {
    if (!form.name || !form.price) return;
    if (supabase) {
      const { data: cat } = await supabase.from('categories').select('id').eq('name', form.category).maybeSingle();
      const payload = {
        name: form.name, description: form.desc, price: Number(form.price), stock: Number(form.stock),
        image_url: form.image || undefined, is_featured: form.featured, category_id: cat?.id ?? null
      };
      if (editId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editId);
        if (error) { alert(t.alertSaveFail + error.message); return; }
        setProducts(prev => prev.map(p => p.id === editId ? { ...p, name: form.name, category: form.category, price: Number(form.price), stock: Number(form.stock), image: form.image, desc: form.desc, featured: form.featured } : p));
      } else {
        const { data, error } = await supabase.from('products').insert({ ...payload, slug: slugify(form.name) }).select().single();
        if (error) { alert(t.alertAddFail + error.message); return; }
        setProducts(prev => [...prev, { id: data.id, name: form.name, category: form.category, price: Number(form.price), stock: Number(form.stock), image: form.image || seed[0].image, desc: form.desc, featured: form.featured }]);
      }
    } else if (editId) {
      setProducts(prev => prev.map(p => p.id === editId ? { ...p, name: form.name, category: form.category, price: Number(form.price), stock: Number(form.stock), image: form.image, desc: form.desc, featured: form.featured } : p));
    } else {
      setProducts(prev => [...prev, { id: `p${Date.now()}`, name: form.name, category: form.category, price: Number(form.price), stock: Number(form.stock), image: form.image || seed[0].image, desc: form.desc, featured: form.featured }]);
    }
    resetForm();
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm(uiLang === 'en' ? 'Are you sure you want to delete this product?' : 'هل أنت متأكد من حذف هذا المنتج نهائياً؟')) return;
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) { alert(t.alertDeleteFail + error.message); return; }
    }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="adminPanel">
      <div className="panelHead">
        <h3><Box size={18} /> {t.productsMgmt}</h3>
        <motion.button className="btn primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }} onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? <X size={16} /> : <><Plus size={16} /> {t.addProduct}</>}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="adminForm" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3 }}>
            <div className="formGrid">
              <label>{t.fName}<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
              <label>{t.fCategory}<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{occasions.map(o => <option key={o} value={o}>{occLabel(o)}</option>)}</select></label>
              <label><DollarSign size={14} /> {t.fPrice}<input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></label>
              <label><Package size={14} /> {t.fStock}<input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required /></label>
              <label className="wide"><ImageIcon size={14} /> {t.fImage}<input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="/images/..." /></label>
              <label className="wide"><Edit3 size={14} /> {t.fDesc}<textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} /></label>
              <label className="wide checkboxLabel"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> <Star size={14} /> {t.fFeatured}</label>
            </div>
            <div className="formActions">
              <motion.button className="btn primary" whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }} onClick={saveProduct}><Check size={16} /> {editId ? t.updateBtn : t.addBtn}</motion.button>
              <motion.button className="btn ghost" whileTap={{ scale: .97 }} onClick={resetForm}>{t.cancelBtn}</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="adminTable">
        <div className="adminTableRow header">
          <span>{t.thImage}</span><span>{t.thProduct}</span><span>{t.thCategory}</span><span>{t.thPrice}</span><span>{t.thStock}</span><span>{t.thActions}</span>
        </div>
        <AnimatePresence>
          {products.map(p => (
            <motion.div className="adminTableRow" key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }} whileHover={{ backgroundColor: 'var(--paper)' }}>
              <span><img src={p.image} alt={prodName(p)} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} /></span>
              <span><b>{prodName(p)}</b><small className="muted">{prodDesc(p).slice(0, 40)}...</small></span>
              <span>{occLabel(p.category)}</span>
              <span>{money(p.price)}</span>
              <span>{p.stock} {t.piecesShort}</span>
              <span className="tableActions">
                <button className="icon" onClick={() => startEdit(p)} title={t.editTitle}><Edit3 size={16} /></button>
                <button className="icon" onClick={() => deleteProduct(p.id)} title={t.delTitle} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OrdersAdmin({ orders, setOrders, t }: { orders: Order[]; setOrders: (o: Order[]) => void; t: typeof translations.ar }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editShipping, setEditShipping] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');

  const payStateOptions: { value: string; label: string }[] = [
    { value: 'waiting_price', label: orderStatusLabels.ar.waiting_price },
    { value: 'unpaid', label: paymentStatusLabels.ar.unpaid },
    { value: 'proof_submitted', label: paymentStatusLabels.ar.proof_submitted },
    { value: 'paid', label: paymentStatusLabels.ar.paid },
  ];
  const payStateToLabel = (v: string) => paymentStatusLabels.ar[v] || orderStatusLabels.ar[v] || v;
  const labelToPayState = (label: string) => {
    for (const [code, lbl] of Object.entries({ ...paymentStatusLabels.ar, ...orderStatusLabels.ar })) if (lbl === label) return code;
    return 'unpaid';
  };

  const updateOrderPricing = async (o: Order) => {
    const newTotal = Number(editPrice || o.subtotal) + Number(editShipping || o.shipping_fee);
    const code = editPaymentStatus ? labelToPayState(editPaymentStatus) : 'unpaid';
    const updated = {
      ...o,
      subtotal: Number(editPrice || o.subtotal),
      shipping_fee: Number(editShipping || o.shipping_fee),
      total: newTotal,
      status: 'confirmed',
      payment_status: code
    };
    if (supabase) {
      const { error } = await supabase.from('orders').update({
        subtotal: updated.subtotal, shipping_fee: updated.shipping_fee, total: updated.total,
        status: 'confirmed', payment_status: code
      }).eq('id', o.id);
      if (error) { alert(t.alertUpdateFail + error.message); return; }
    } else {
      localStorage.setItem('em-all-orders', JSON.stringify(orders.map(x => x.order_number === o.order_number ? updated : x)));
    }
    setOrders(orders.map(x => (x.id === o.id || x.order_number === o.order_number) ? updated : x));
    setSelectedOrder(null);
    alert(t.alertPriceSaved);
  };

  const verifyPayment = async (o: Order) => {
    const updated = { ...o, status: 'processing', payment_status: 'paid' };
    if (supabase) {
      const { error } = await supabase.from('orders').update({ status: 'processing', payment_status: 'paid' }).eq('id', o.id);
      if (error) { alert(t.alertUpdateFail + error.message); return; }
    } else {
      localStorage.setItem('em-all-orders', JSON.stringify(orders.map(x => x.order_number === o.order_number ? updated : x)));
    }
    setOrders(orders.map(x => (x.id === o.id || x.order_number === o.order_number) ? updated : x));
    setSelectedOrder(updated);
    alert(t.alertPaymentVerified);
  };

  return (
    <div className="adminPanel">
      <div className="panelHead">
        <h3><Package size={18} /> {t.ordersMgmt}</h3>
        <span className="muted">{orders.length} {t.ordersWord}</span>
      </div>

      <div className="adminTable">
        <div className="adminTableRow header">
          <span>{t.thOrderNo}</span><span>{t.thCustomer}</span><span>{t.thOccasion}</span><span>{t.thTotal}</span><span>{t.thPayStatus}</span><span>{t.thAction}</span>
        </div>
        {orders.map(o => (
          <motion.div className="adminTableRow" key={o.id || o.order_number} whileHover={{ backgroundColor: 'var(--paper)' }}>
            <span><b>{o.order_number}</b></span>
            <span>{o.customer_name}<br /><small className="muted">{o.customer_phone}</small></span>
            <span>{occLabel(o.occasion)}</span>
            <span><b>{money(Number(o.total || 0))}</b></span>
            <span><span className="badge badgeWarning">{paymentStatusLabel(o.payment_status) || orderStatusLabel(o.status) || t.underReviewWord}</span></span>
            <span>
              <motion.button className="btn btn-sm primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }} onClick={() => { setSelectedOrder(o); setEditPrice(String(o.subtotal || 0)); setEditShipping(String(o.shipping_fee || 25)); const known = paymentStatusLabels.ar[o.payment_status] || orderStatusLabels.ar[o.payment_status] ? o.payment_status : 'unpaid'; setEditPaymentStatus(payStateToLabel(known)); }}>
                {t.reviewConfirm} <Eye size={14} />
              </motion.button>
            </span>
          </motion.div>
        ))}
        {!orders.length && <div className="adminTableRow"><span className="muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>{t.noOrdersSoFar}</span></div>}
      </div>

      {selectedOrder && (
        <div className="modalOverlay" onClick={() => setSelectedOrder(null)}>
          <div className="modalCard" onClick={e => e.stopPropagation()}>
            <div className="modalHead">
              <h3>{t.reviewDetails} {selectedOrder.order_number}</h3>
              <button className="icon" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
            </div>
            <div className="modalBody" style={{ display: 'grid', gap: 16 }}>
              <p><b>{t.customerL}</b> {selectedOrder.customer_name} ({selectedOrder.customer_phone})</p>
              <p><b>{t.addressL}</b> {selectedOrder.city} - {selectedOrder.address}</p>
              <p><b>{t.occasionL}</b> {occLabel(selectedOrder.occasion)}</p>
              <p><b>{t.notesL}</b> {selectedOrder.notes || '---'}</p>

              <hr />
              <h4>{t.setFinalHead}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label>{t.finalPriceL}
                  <input type="number" className="input" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                </label>
                <label>{t.shippingL}
                  <input type="number" className="input" value={editShipping} onChange={e => setEditShipping(e.target.value)} />
                </label>
              </div>
              <label>{t.payStatusL}
                <select className="select" value={editPaymentStatus} onChange={e => setEditPaymentStatus(e.target.value)}>
                  {payStateOptions.map(opt => <option key={opt.value} value={opt.label}>{opt.label}</option>)}
                </select>
              </label>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <motion.button className="btn primary" whileTap={{ scale: .96 }} onClick={() => updateOrderPricing(selectedOrder)}>
                  {t.saveConfirmBtn}
                </motion.button>
                {(selectedOrder.payment_status === 'proof_submitted' || selectedOrder.payment_status?.includes('تم رفع')) && (
                  <motion.button className="btn" style={{ background: 'var(--success)', color: '#fff' }} whileTap={{ scale: .96 }} onClick={() => verifyPayment(selectedOrder)}>
                    <Check size={16} /> {t.verifyBtn}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomersAdmin({ customers, orders, t }: { customers: Customer[]; orders: Order[]; t: typeof translations.ar }) {
  return (
    <div className="adminPanel">
      <div className="panelHead">
        <h3><Users size={18} /> {t.customersMgmt}</h3>
        <span className="muted">{customers.length} {t.customersWord}</span>
      </div>
      <div className="adminTable">
        <div className="adminTableRow header">
          <span>{t.thCustName}</span><span>{t.thPhone}</span><span>{t.thEmail}</span><span>{t.thOrdersCount}</span><span>{t.thSpent}</span>
        </div>
        {customers.map((c, i) => (
          <motion.div className="adminTableRow" key={i} whileHover={{ backgroundColor: 'var(--paper)' }}>
            <span><b>{c.name}</b></span>
            <span dir="ltr">{c.phone || '---'}</span>
            <span>{c.email || '---'}</span>
            <span>{c.ordersCount} {t.ordersCountSuffix}</span>
            <span className="priceGrad"><b>{money(c.totalSpent)}</b></span>
          </motion.div>
        ))}
        {!customers.length && <div className="adminTableRow"><span className="muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 30 }}>{t.noCustomers}</span></div>}
      </div>
    </div>
  );
}

function CouponsAdmin({ coupons, setCoupons, t }: { coupons: Coupon[]; setCoupons: (c: Coupon[]) => void; t: typeof translations.ar }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discount: '10', type: 'percent' as 'percent' | 'fixed', maxUsage: '100', expiry: '' });

  const addCoupon = async () => {
    if (!form.code || !form.discount) return;
    const code = form.code.trim().toUpperCase();
    if (supabase) {
      const { data, error } = await supabase.from('coupons').insert({
        code, discount_type: form.type, amount: Number(form.discount),
        usage_limit: form.maxUsage ? Number(form.maxUsage) : null, expires_at: form.expiry || null, is_active: true
      }).select().single();
      if (error) { alert(t.alertCouponFail + error.message); return; }
      setCoupons([...coupons, { id: data.id, code, discount: Number(form.discount), type: form.type, maxUsage: Number(form.maxUsage) || Infinity, usageCount: 0, minOrder: 0, expiry: form.expiry, active: true }]);
    } else {
      setCoupons([...coupons, { id: `c${Date.now()}`, code, discount: Number(form.discount), type: form.type, maxUsage: Number(form.maxUsage) || Infinity, usageCount: 0, minOrder: 0, expiry: form.expiry, active: true }]);
    }
    setForm({ code: '', discount: '10', type: 'percent', maxUsage: '100', expiry: '' });
    setShowForm(false);
  };

  return (
    <div className="adminPanel">
      <div className="panelHead">
        <h3><Tag size={18} /> {t.couponsMgmt}</h3>
        <motion.button className="btn primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }} onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} /> : <><Plus size={16} /> {t.addCoupon}</>}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="adminForm" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3 }}>
            <div className="formGrid">
              <label>{t.cCode}<input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="MOMENTS10" /></label>
              <label>{t.cType}<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'percent' | 'fixed' })}><option value="percent">{t.cPercent}</option><option value="fixed">{t.cFixed}</option></select></label>
              <label>{t.cValue}<input type="number" min="0" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} /></label>
              <label>{t.cMaxUse}<input type="number" min="0" value={form.maxUsage} onChange={e => setForm({ ...form, maxUsage: e.target.value })} /></label>
              <label>{t.cExpiry}<input type="date" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} /></label>
            </div>
            <div className="formActions">
              <motion.button className="btn primary" whileTap={{ scale: .97 }} onClick={addCoupon}><Check size={16} /> {t.addBtn}</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="adminTable">
        <div className="adminTableRow header">
          <span>{t.thCode}</span><span>{t.thDiscount}</span><span>{t.thMin}</span><span>{t.thUsage}</span><span>{t.thStatus}</span>
        </div>
        {coupons.map(c => (
          <motion.div className="adminTableRow" key={c.id} whileHover={{ backgroundColor: 'var(--paper)' }}>
            <span><b>{c.code}</b></span>
            <span>{c.type === 'percent' ? `${c.discount}%` : money(c.discount)}</span>
            <span>{money(c.minOrder)}</span>
            <span>{c.usageCount} / {c.maxUsage === Infinity ? '∞' : c.maxUsage}</span>
            <span><span className={c.active ? 'badge badgeSuccess' : 'badge badgeWarning'}>{c.active ? t.activeC : t.inactiveC}</span></span>
          </motion.div>
        ))}
        {!coupons.length && <div className="adminTableRow"><span className="muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 30 }}>{t.noCoupons}</span></div>}
      </div>
    </div>
  );
}

function SettingsAdmin({ settings, setSettings, t }: { settings: any; setSettings: any; t: typeof translations.ar }) {
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    if (supabase) {
      const { error } = await supabase.from('settings').upsert({
        key: 'store',
        value: {
          name: settings.storeName, shippingFee: Number(settings.shippingFee) || 0,
          freeShippingOver: Number(settings.freeShippingThreshold) || 0,
          phone: settings.phone,
          whatsapp: settings.whatsapp, instagram: settings.instagram, tiktok: settings.tiktok
        }
      });
      setSaving(false);
      if (error) { alert(t.alertSettingsFail + error.message); return; }
    } else {
      localStorage.setItem('em-settings', JSON.stringify(settings));
      setSaving(false);
    }
    alert(t.alertSettingsSaved);
  };

  return (
    <div className="adminPanel">
      <div className="panelHead"><h3><Settings size={18} /> {t.settingsMgmt}</h3></div>
      <div className="formGrid" style={{ marginTop: 20 }}>
        <label>{t.setName}<input className="input" value={settings.storeName} onChange={e => setSettings({ ...settings, storeName: e.target.value })} /></label>
        <label>{t.setPayPhone}<input className="input" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} /></label>
        <label>{t.setShipFee}<input className="input" value={settings.shippingFee} onChange={e => setSettings({ ...settings, shippingFee: e.target.value })} /></label>
        <label>{t.setFreeShip}<input className="input" value={settings.freeShippingThreshold} onChange={e => setSettings({ ...settings, freeShippingThreshold: e.target.value })} /></label>
        <label>{t.setWhats}<input className="input" value={settings.whatsapp} onChange={e => setSettings({ ...settings, whatsapp: e.target.value })} dir="ltr" /></label>
        <label className="wide">{t.setDesc}<textarea className="textarea" value={settings.storeDesc} onChange={e => setSettings({ ...settings, storeDesc: e.target.value })} /></label>
      </div>
      <motion.button className="btn primary" style={{ marginTop: 24 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }} onClick={save} disabled={saving}>
        {saving ? t.savingBtn : t.saveSettings}
      </motion.button>
    </div>
  );
}

function Footer({ t }: { t: typeof translations.ar }) {
  return (
    <footer className="footer">
      <div className="container footerGrid">
        <div className="footerCol">
          <Link to="/" className="brand footerBrand">
            <span className="brandMark"><img src="/images/logo.jpeg" alt="Esraa Moments" /></span>
            <span className="brandText"><b>ESRAA</b><small>Moments</small></span>
          </Link>
          <p className="footerDesc">{t.footerDesc}</p>
          <div className="socialLinks">
            <motion.a href="https://instagram.com" target="_blank" rel="noreferrer" whileHover={{ scale: 1.2, color: 'var(--accent)' }} aria-label="Instagram">
              <Instagram size={20} />
            </motion.a>
            <motion.a href="https://whatsapp.com" target="_blank" rel="noreferrer" whileHover={{ scale: 1.2, color: 'var(--accent)' }} aria-label="WhatsApp">
              <MessageCircle size={20} />
            </motion.a>
          </div>
        </div>

        <div className="footerCol">
          <h4>{t.store}</h4>
          <ul>
            {occasions.slice(0, 6).map(o => (
              <li key={o}><Link to={`/shop?cat=${encodeURIComponent(o)}`}>{occLabel(o)}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footerCol">
          <h4>{t.quickLinks}</h4>
          <ul>
            <li><Link to="/custom">{t.designStudio}</Link></li>
            <li><Link to="/track">{t.track}</Link></li>
            <li><Link to="/#about">{t.aboutUs}</Link></li>
            <li><Link to="/#faq">{t.faq}</Link></li>
          </ul>
        </div>

        <div className="footerCol">
          <h4>{t.contactUs}</h4>
          <p className="footerContactItem"><MapPin size={16} /> {t.location}</p>
          <p className="footerContactItem"><Phone size={16} /> {getLocal<any | null>('em-settings', null)?.phone || '01000000000'}</p>
          <p className="footerContactItem"><Mail size={16} /> info@esraamoments.com</p>
        </div>
      </div>
      <div className="footerBottom">
        <div className="container flex-between">
          <p>© {new Date().getFullYear()} ESRAA Moments. {t.rights}</p>
          <p className="craftedBy">Luxury Custom Event Favors Platform</p>
        </div>
      </div>
    </footer>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
