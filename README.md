# Esraa Moments — Production-ready starter

متجر RTL عربي بتصميم Quiet Luxury، مع Catalog، Product Details، Cart، Checkout، Custom Design Studio، Order Tracking، Auth، وAdmin Console.

## 1) تشغيل محلي
```bash
npm install
npm run dev
```

## 2) تشغيل Supabase
1. أنشئي مشروعًا في Supabase.
2. افتحي SQL Editor.
3. الصقي محتوى `supabase/schema.sql` ونفذيه.
4. من Project Settings انسخي Project URL وPublishable/Anon key.
5. انسخي `.env.example` إلى `.env` وضعي القيم.
6. شغلي `npm run dev`.

> لا تضعي Service Role/Secret Key في Vite أو أي كود Frontend.

## 3) إنشاء حساب الإدارة
- فعّلي Email/Password في Supabase Auth.
- أنشئي مستخدمًا إداريًا.
- من Table Editor > user_roles، أضيفي صفًا لهذا المستخدم مع role=`admin`، أو نفذي SQL التعليق الموجود أسفل schema.sql.

## 4) الصور
في النسخة الحالية المنتجات تستخدم أصولًا محلية. في الإنتاج الأفضل رفع الصور إلى Supabase Storage ثم تخزين الرابط في `products.image_url`.

## 5) WhatsApp
ضعي الرقم الدولي بدون `+` في settings ثم استخدميه في زر WhatsApp. لا تضعي رقمًا وهميًا.

## 6) الدفع الحقيقي
الـCheckout الحالي ينشئ الطلب ويدعم COD. خيار online مجرد placeholder. لربط بوابة دفع حقيقية، استخدمي Backend/Edge Function للتحقق من المبلغ وإنشاء جلسة الدفع؛ لا تضعي مفاتيح سرية في Frontend.

## 7) الشحن
غيّري `shippingFee` و`freeShippingOver` في جدول settings. يمكن لاحقًا إضافة جدول `shipping_zones` حسب المحافظات/المناطق.

## 8) نشر على Vercel
```bash
npm run build
```
ثم اربطي GitHub بالمشروع في Vercel، وأضيفي نفس متغيرات البيئة في Project Settings.

## 9) قبل الإطلاق
- استبدال البيانات التجريبية والأسعار.
- رفع صور المنتجات الحقيقية.
- ضبط Domain وSEO.
- إعداد Email confirmation وSMTP.
- إعداد RLS واختبار حساب customer وحساب admin.
- ربط بوابة الدفع الفعلية.
- ربط شركة الشحن/التتبع.
- إضافة Analytics وMeta Pixel إذا لزم.
- اختبار checkout على الهاتف.
- تفعيل backups ومراقبة الأخطاء.
