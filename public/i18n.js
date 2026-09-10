// ====== نظام الترجمة (i18n) ======
const translations = {
    ar: {
        // ====== عام ======
        app_name: "نظام إدارة الطلبات",
        app_subtitle: "نظام متكامل لإدارة الطلبات",
        loading: "جاري التحميل...",
        save: "حفظ",
        cancel: "إلغاء",
        close: "إغلاق",
        delete: "حذف",
        edit: "تعديل",
        add: "إضافة",
        back: "العودة",
        logout: "خروج",
        login: "دخول",
        preview: "معاينة",
        settings: "إعدادات",
        confirm: "تأكيد",
        yes: "نعم",
        no: "لا",
        ok: "حسناً",
        error: "خطأ",
        success: "نجاح",
        warning: "تحذير",
        info: "معلومة",
        
        // ====== تسجيل الدخول ======
        login_title: "دخول على النظام",
        login_subtitle: "سجل الدخول لإدارة طلباتك",
        username: "اسم المستخدم",
        username_placeholder: "أدخل اسم المستخدم",
        password: "كلمة المرور",
        password_placeholder: "أدخل كلمة المرور",
        login_button: "🚀 دخول",
        login_button_loading: "⏳ جاري...",
        login_error: "❌ اسم المستخدم أو كلمة المرور غير صحيحة",
        login_empty: "❌ الرجاء إدخال اسم المستخدم وكلمة المرور",
        login_connection_error: "❌ حدث خطأ في الاتصال بالخادم",
        login_footer: "🔒 جميع البيانات مشفرة وآمنة",
        admin_credentials: "👑 مدير عام",
        
        // ====== لوحة المدير ======
        admin_title: "🏢 لوحة التحكم الرئيسية",
        admin_subtitle: "إدارة جميع الاشتراكات",
        admin_add_shop: "➕ إضافة مشترك",
        admin_total_shops: "إجمالي الاشتركات",
        admin_active_shops: "الاشتراكات النشطة",
        admin_inactive_shops: "الاشتراكات الموقفة",
        admin_shops_list: "📋 قائمة المشتركين",
        admin_logo: "الشعار",
        admin_brand_name: "اسم العلامة",
        admin_username: "اسم المستخدم",
        admin_qr_link: "رابط QR",
        admin_status: "الحالة",
        admin_actions: "الإجراءات",
        admin_active: "✅ نشط",
        admin_inactive: "⛔ موقف",
        admin_admin: "👑 مدير",
        admin_open_qr: "📱 فتح QR",
        admin_not_set: "⚠️ غير محدد",
        admin_not_editable: "🚫 غير قابل للتعديل",
        admin_loading: "⏳ جاري التحميل...",
        admin_no_shops: "لا توجد مقاهي مسجلة",
        admin_data_error: "❌ حدث خطأ في تحميل البيانات",
        
        // ====== إضافة مقهى ======
        add_shop_title: "➕ إضافة مشترك جديد",
        add_shop_name: "اسم العلامة",
        add_shop_name_placeholder: "Coffee Shop",
        add_shop_username: "اسم المستخدم",
        add_shop_username_placeholder: "coffee_shop",
        add_shop_password: "كلمة المرور",
        add_shop_password_placeholder: "********",
        add_shop_google_maps: "رابط تقييم Google Maps",
        add_shop_google_maps_placeholder: "https://g.page/.../review",
        add_shop_submit: "✅ إضافة",
        add_shop_success: "✅ تم إضافة المشترك بنجاح!",
        add_shop_empty: "⚠️ الرجاء ملء جميع الحقول المطلوبة",
        add_shop_error: "❌ حدث خطأ",
        
        // ====== لوحة البارستا ======
        dashboard_title: "☕ لوحة البارستا",
        dashboard_new_order: "➕ طلب جديد",
        dashboard_banner: "🖼️ البانر",
        dashboard_settings: "⚙️ الإعدادات",
        dashboard_logout: "🚪 خروج",
        dashboard_total_orders: "إجمالي الطلبات",
        dashboard_waiting: "في الانتظار",
        dashboard_preparing: "قيد التحضير",
        dashboard_ready: "جاهز للاستلام",
        dashboard_active_orders: "📋 الطلبات النشطة",
        dashboard_no_orders: "🎉 لا توجد طلبات نشطة حالياً",
        
        // ====== طلب جديد ======
        new_order_title: "📝 طلب جديد",
        new_order_customer: "اسم العميل",
        new_order_customer_placeholder: "أدخل اسم العميل",
        new_order_details: "تفاصيل الطلب",
        new_order_details_placeholder: "مثال: كابتشينو، كرواسان",
        new_order_submit: "إنشاء الطلب",
        
        // ====== QR ======
        qr_title: "📱 رمز QR للطلب",
        qr_subtitle: "اطبع أو اعرض هذا الرمز للعميل لمسحه",
        qr_print: "🖨️ طباعة",
        qr_order: "☕ رمز الطلب",
        qr_scan: "امسح الرمز لمتابعة طلبك",
        qr_back: "🔄 العودة للبانر",
        qr_waiting: "⏳ في الانتظار",
        qr_preparing: "👨‍🍳 قيد التحضير",
        qr_ready: "✅ جاهز للاستلام",
        qr_completed: "📦 تم التسليم",
        qr_auto_update: "🔄 سيتم التحديث تلقائياً عند مسح الرمز",
        
        // ====== الإعدادات ======
        settings_title: "⚙️ إعدادات المقهى",
        settings_save_all: "💾 حفظ جميع التغييرات",
        settings_preview: "👁️ معاينة كاملة",
        settings_back: "🔙 العودة",
        settings_logout: "🚪 خروج",
        
        // القسم 1: الهوية
        settings_identity: "🖼️ القسم 1: الهوية",
        settings_logo: "شعار المقهى (Logo)",
        settings_logo_choose: "📤 اختر شعار جديد",
        settings_banner: "بانر المقهى (صورة الشاشة الكبيرة)",
        settings_banner_choose: "📤 اختر بانر جديد",
        settings_banner_none: "لا يوجد بانر",
        settings_shop_name: "اسم المقهى",
        settings_shop_phone: "رقم الهاتف",
        settings_shop_address: "العنوان",
        settings_shop_hours: "ساعات العمل",
        settings_google_maps: "رابط تقييم Google Maps",
        
        // القسم 2: الألوان
        settings_colors: "🎨 القسم 2: الألوان (الوضع النهاري)",
        settings_primary_color: "اللون الأساسي (Primary)",
        settings_secondary_color: "اللون الثانوي (Secondary)",
        settings_bg_color: "لون الخلفية (Background)",
        settings_text_color: "لون النص (Text)",
        settings_card_color: "لون البطاقات (Cards)",
        settings_button_color: "لون الأزرار (Buttons)",
        settings_header_color: "لون الهيدر (Header)",
        settings_reset_colors: "🔄 إعادة الألوان الافتراضية",
        
        // القسم 3: الوضع الليلي
        settings_dark_mode: "🌙 القسم 3: الوضع الليلي",
        settings_dark_enable: "تفعيل الوضع الليلي",
        settings_dark_enable_desc: "سيتم تطبيق الألوان الليلية على جميع الصفحات",
        settings_dark_bg: "خلفية الوضع الليلي",
        settings_dark_text: "نص الوضع الليلي",
        settings_dark_card: "بطاقات الوضع الليلي",
        
        // القسم 4: المظهر
        settings_appearance: "✨ القسم 4: المظهر",
        settings_font: "نوع الخط",
        settings_border_radius: "نصف قطر الزوايا",
        settings_radius_square: "مربع (0px)",
        settings_radius_small: "صغير (8px)",
        settings_radius_medium: "متوسط (12px)",
        settings_radius_large: "كبير (16px)",
        settings_radius_round: "دائري (24px)",
        
        // القسم 5: المعاينة
        settings_live_preview: "👁️ القسم 5: المعاينة المباشرة",
        settings_live_preview_subtitle: "معاينة حية",
        settings_preview_order: "طلب رقم #1001",
        settings_preview_order_details: "كابتشينو + كرواسان",
        settings_preview_button_primary: "زر رئيسي",
        settings_preview_button_secondary: "زر ثانوي",
        
        // ====== المعاينة ======
        preview_title: "معاينة المقهى",
        preview_close: "✖ إغلاق",
        preview_shop_data: "📋 بيانات المقهى",
        preview_phone: "📞 الهاتف",
        preview_address: "📍 العنوان",
        preview_hours: "🕐 ساعات العمل",
        preview_colors_used: "🎨 الألوان المستخدمة",
        preview_color_primary: "الأساسي",
        preview_color_secondary: "الثانوي",
        preview_color_bg: "الخلفية",
        preview_color_text: "النص",
        preview_color_card: "البطاقات",
        preview_color_button: "الأزرار",
        preview_color_header: "الهيدر",
        preview_card: "🎫 معاينة بطاقة الطلب",
        preview_buttons: "🔘 معاينة الأزرار",
        preview_qr_screen: "📱 معاينة شاشة QR",
        preview_not_set: "غير محدد",
        
        // ====== بطاقة العميل ======
        customer_order_card: "بطاقة طلب",
        customer_order_number: "رقم الطلب",
        customer_order_details: "تفاصيل الطلب",
        customer_order_time: "🕐 وقت الطلب",
        customer_status_waiting: "⏳ في الانتظار",
        customer_status_preparing: "👨‍🍳 قيد التحضير",
        customer_status_ready: "✅ جاهز للاستلام",
        customer_status_completed: "📦 تم التسليم",
        customer_status_waiting_msg: "طلبك في قائمة الانتظار، سيبدأ تحضيره قريباً",
        customer_status_preparing_msg: "جاري تحضير طلبك، شكراً لصبرك",
        customer_status_ready_msg: "طلبك جاهز! يمكنك التوجه لاستلامه",
        customer_status_completed_msg: "تم تسليم طلبك، نشكرك على زيارتك",
        customer_ready_notification: "طلبك جاهز!",
        customer_ready_subtitle: "سيتم تشغيل التنبيه والاهتزاز",
        customer_thanks: "شكراً لزيارتك!",
        customer_order_delivered: "تم تسليم طلبك بنجاح",
        customer_enjoy: "نتمنى أن تستمتع بمشروبك ☕",
        customer_rate_us: "قيمنا على Google Maps",
        customer_rate_desc: "شاركنا رأيك وساعدنا في تحسين خدماتنا",
        customer_rate_button: "⭐ تقييم على Google",
        customer_remind_later: "تذكرني لاحقاً",
        customer_new_order: "طلب جديد",
        customer_auto_update: "🔄 يتم التحديث تلقائياً",
        customer_no_order: "لم يتم العثور على طلب",
        customer_scan_qr: "يرجى مسح رمز QR الخاص بطلبك",
        customer_welcome: "مرحباً بك!",
        
        // ====== الحالات ======
        status_waiting: "في الانتظار",
        status_preparing: "قيد التحضير",
        status_ready: "جاهز للاستلام",
        status_completed: "تم التسليم",
        
        // ====== التنبيهات ======
        alert_order_created: "✅ تم إنشاء الطلب بنجاح!",
        alert_order_updated: "✅ تم تحديث حالة الطلب!",
        alert_settings_saved: "✅ تم حفظ الإعدادات بنجاح!",
        alert_logo_uploaded: "✅ تم رفع الشعار بنجاح!",
        alert_banner_uploaded: "✅ تم رفع البانر بنجاح!",
        alert_logout_confirm: "هل أنت متأكد من تسجيل الخروج؟",
        alert_delete_confirm: "⚠️ هل أنت متأكد من الحذف نهائياً؟",
        alert_toggle_confirm: "هل أنت متأكد من تغيير الحالة؟",
        alert_reset_colors: "هل تريد إعادة جميع الألوان إلى الافتراضية؟",
        alert_no_shop: "⚠️ لم يتم تحديد مقهى",
        alert_upload_error: "❌ حدث خطأ في الرفع",
        alert_save_error: "❌ حدث خطأ في الحفظ",
        
        // ====== الحالة ======
        status_connected: "✅ متصل",
        status_disconnected: "❌ غير متصل",
        status_ready_bar: "🟢 جاهز",
        status_notifications_enabled: "الإشعارات مفعلة",
        status_notifications_denied: "الرجاء السماح بالإشعارات",
        
        // ====== اللغة ======
        language_switch: "English",
        language_name: "العربية"
    },
    
    en: {
        // ====== General ======
        app_name: "Order Management System",
        app_subtitle: "Integrated Order Management System",
        loading: "Loading...",
        save: "Save",
        cancel: "Cancel",
        close: "Close",
        delete: "Delete",
        edit: "Edit",
        add: "Add",
        back: "Back",
        logout: "Logout",
        login: "Login",
        preview: "Preview",
        settings: "Settings",
        confirm: "Confirm",
        yes: "Yes",
        no: "No",
        ok: "OK",
        error: "Error",
        success: "Success",
        warning: "Warning",
        info: "Info",
        
        // ====== Login ======
        login_title: "Login to System",
        login_subtitle: "Sign in to manage your orders",
        username: "Username",
        username_placeholder: "Enter username",
        password: "Password",
        password_placeholder: "Enter password",
        login_button: "🚀 Login",
        login_button_loading: "⏳ Loading...",
        login_error: "❌ Invalid username or password",
        login_empty: "❌ Please enter username and password",
        login_connection_error: "❌ Connection error",
        login_footer: "🔒 All data is encrypted and secure",
        admin_credentials: "👑 Admin",
        
        // ====== Admin Panel ======
        admin_title: "🏢 Admin Dashboard",
        admin_subtitle: "Manage all subscriptions",
        admin_add_shop: "➕ Add Subscriber",
        admin_total_shops: "Total Subscribers",
        admin_active_shops: "Active Subscribers",
        admin_inactive_shops: "Inactive Subscribers",
        admin_shops_list: "📋 Subscribers List",
        admin_logo: "Logo",
        admin_brand_name: "Brand Name",
        admin_username: "Username",
        admin_qr_link: "QR Link",
        admin_status: "Status",
        admin_actions: "Actions",
        admin_active: "✅ Active",
        admin_inactive: "⛔ Inactive",
        admin_admin: "👑 Admin",
        admin_open_qr: "📱 Open QR",
        admin_not_set: "⚠️ Not set",
        admin_not_editable: "🚫 Not editable",
        admin_loading: "⏳ Loading...",
        admin_no_shops: "No shops registered",
        admin_data_error: "❌ Error loading data",
        
        // ====== Add Shop ======
        add_shop_title: "➕ Add New Subscriber",
        add_shop_name: "Brand Name",
        add_shop_name_placeholder: "Coffee Shop",
        add_shop_username: "Username",
        add_shop_username_placeholder: "coffee_shop",
        add_shop_password: "Password",
        add_shop_password_placeholder: "********",
        add_shop_google_maps: "Google Maps Review Link",
        add_shop_google_maps_placeholder: "https://g.page/.../review",
        add_shop_submit: "✅ Add",
        add_shop_success: "✅ Subscriber added successfully!",
        add_shop_empty: "⚠️ Please fill all required fields",
        add_shop_error: "❌ Error occurred",
        
        // ====== Dashboard ======
        dashboard_title: "☕ Barista Dashboard",
        dashboard_new_order: "➕ New Order",
        dashboard_banner: "🖼️ Banner",
        dashboard_settings: "⚙️ Settings",
        dashboard_logout: "🚪 Logout",
        dashboard_total_orders: "Total Orders",
        dashboard_waiting: "Waiting",
        dashboard_preparing: "Preparing",
        dashboard_ready: "Ready",
        dashboard_active_orders: "📋 Active Orders",
        dashboard_no_orders: "🎉 No active orders",
        
        // ====== New Order ======
        new_order_title: "📝 New Order",
        new_order_customer: "Customer Name",
        new_order_customer_placeholder: "Enter customer name",
        new_order_details: "Order Details",
        new_order_details_placeholder: "e.g., Cappuccino, Croissant",
        new_order_submit: "Create Order",
        
        // ====== QR ======
        qr_title: "📱 Order QR Code",
        qr_subtitle: "Print or show this code to customer",
        qr_print: "🖨️ Print",
        qr_order: "☕ Order Code",
        qr_scan: "Scan code to track your order",
        qr_back: "🔄 Back to Banner",
        qr_waiting: "⏳ Waiting",
        qr_preparing: "👨‍🍳 Preparing",
        qr_ready: "✅ Ready",
        qr_completed: "📦 Completed",
        qr_auto_update: "🔄 Will update automatically when scanned",
        
        // ====== Settings ======
        settings_title: "⚙️ Shop Settings",
        settings_save_all: "💾 Save All Changes",
        settings_preview: "👁️ Full Preview",
        settings_back: "🔙 Back",
        settings_logout: "🚪 Logout",
        
        // Section 1: Identity
        settings_identity: "🖼️ Section 1: Identity",
        settings_logo: "Shop Logo",
        settings_logo_choose: "📤 Choose New Logo",
        settings_banner: "Shop Banner",
        settings_banner_choose: "📤 Choose New Banner",
        settings_banner_none: "No banner",
        settings_shop_name: "Shop Name",
        settings_shop_phone: "Phone Number",
        settings_shop_address: "Address",
        settings_shop_hours: "Working Hours",
        settings_google_maps: "Google Maps Review Link",
        
        // Section 2: Colors
        settings_colors: "🎨 Section 2: Colors (Light Mode)",
        settings_primary_color: "Primary Color",
        settings_secondary_color: "Secondary Color",
        settings_bg_color: "Background Color",
        settings_text_color: "Text Color",
        settings_card_color: "Cards Color",
        settings_button_color: "Buttons Color",
        settings_header_color: "Header Color",
        settings_reset_colors: "🔄 Reset to Default Colors",
        
        // Section 3: Dark Mode
        settings_dark_mode: "🌙 Section 3: Dark Mode",
        settings_dark_enable: "Enable Dark Mode",
        settings_dark_enable_desc: "Dark colors will be applied to all pages",
        settings_dark_bg: "Dark Background",
        settings_dark_text: "Dark Text",
        settings_dark_card: "Dark Cards",
        
        // Section 4: Appearance
        settings_appearance: "✨ Section 4: Appearance",
        settings_font: "Font Family",
        settings_border_radius: "Border Radius",
        settings_radius_square: "Square (0px)",
        settings_radius_small: "Small (8px)",
        settings_radius_medium: "Medium (12px)",
        settings_radius_large: "Large (16px)",
        settings_radius_round: "Round (24px)",
        
        // Section 5: Preview
        settings_live_preview: "👁️ Section 5: Live Preview",
        settings_live_preview_subtitle: "Live Preview",
        settings_preview_order: "Order #1001",
        settings_preview_order_details: "Cappuccino + Croissant",
        settings_preview_button_primary: "Primary Button",
        settings_preview_button_secondary: "Secondary Button",
        
        // ====== Preview ======
        preview_title: "Shop Preview",
        preview_close: "✖ Close",
        preview_shop_data: "📋 Shop Data",
        preview_phone: "📞 Phone",
        preview_address: "📍 Address",
        preview_hours: "🕐 Working Hours",
        preview_colors_used: "🎨 Used Colors",
        preview_color_primary: "Primary",
        preview_color_secondary: "Secondary",
        preview_color_bg: "Background",
        preview_color_text: "Text",
        preview_color_card: "Cards",
        preview_color_button: "Buttons",
        preview_color_header: "Header",
        preview_card: "🎫 Order Card Preview",
        preview_buttons: "🔘 Buttons Preview",
        preview_qr_screen: "📱 QR Screen Preview",
        preview_not_set: "Not set",
        
        // ====== Customer Card ======
        customer_order_card: "Order Card",
        customer_order_number: "Order Number",
        customer_order_details: "Order Details",
        customer_order_time: "🕐 Order Time",
        customer_status_waiting: "⏳ Waiting",
        customer_status_preparing: "👨‍🍳 Preparing",
        customer_status_ready: "✅ Ready",
        customer_status_completed: "📦 Completed",
        customer_status_waiting_msg: "Your order is in queue, will start preparing soon",
        customer_status_preparing_msg: "Preparing your order, thanks for waiting",
        customer_status_ready_msg: "Your order is ready! You can pick it up",
        customer_status_completed_msg: "Order delivered, thank you for visiting",
        customer_ready_notification: "Your order is ready!",
        customer_ready_subtitle: "Alert and vibration will play",
        customer_thanks: "Thank you for visiting!",
        customer_order_delivered: "Your order has been delivered",
        customer_enjoy: "Enjoy your drink ☕",
        customer_rate_us: "Rate us on Google Maps",
        customer_rate_desc: "Share your feedback and help us improve",
        customer_rate_button: "⭐ Rate on Google",
        customer_remind_later: "Remind me later",
        customer_new_order: "New Order",
        customer_auto_update: "🔄 Auto-updating",
        customer_no_order: "No order found",
        customer_scan_qr: "Please scan your order QR code",
        customer_welcome: "Welcome!",
        
        // ====== Status ======
        status_waiting: "Waiting",
        status_preparing: "Preparing",
        status_ready: "Ready",
        status_completed: "Completed",
        
        // ====== Alerts ======
        alert_order_created: "✅ Order created successfully!",
        alert_order_updated: "✅ Order status updated!",
        alert_settings_saved: "✅ Settings saved successfully!",
        alert_logo_uploaded: "✅ Logo uploaded successfully!",
        alert_banner_uploaded: "✅ Banner uploaded successfully!",
        alert_logout_confirm: "Are you sure you want to logout?",
        alert_delete_confirm: "⚠️ Are you sure you want to delete?",
        alert_toggle_confirm: "Are you sure you want to change status?",
        alert_reset_colors: "Reset all colors to default?",
        alert_no_shop: "⚠️ No shop selected",
        alert_upload_error: "❌ Upload error",
        alert_save_error: "❌ Save error",
        
        // ====== Status ======
        status_connected: "✅ Connected",
        status_disconnected: "❌ Disconnected",
        status_ready_bar: "🟢 Ready",
        status_notifications_enabled: "Notifications enabled",
        status_notifications_denied: "Please allow notifications",
        
        // ====== Language ======
        language_switch: "العربية",
        language_name: "English"
    }
};

// ====== اللغة الحالية ======
let currentLang = localStorage.getItem('language') || 'ar';

// ====== دالة جلب الترجمة ======
function t(key) {
    return translations[currentLang][key] || key;
}

// ====== دالة تغيير اللغة ======
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    
    // تغيير اتجاه الصفحة
    if (lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', 'en');
    }
    
    // تطبيق الترجمات
    applyTranslations();
    
    // تحديث زر اللغة
    updateLanguageButton();
}

// ====== دالة تبديل اللغة ======
function toggleLanguage() {
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
}

// ====== دالة تطبيق الترجمات ======
function applyTranslations() {
    // 1. النصوص العادية
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translation;
        } else {
            el.textContent = translation;
        }
    });
    
    // 2. Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    
    // 3. Title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.title = t(key);
    });
}

// ====== دالة تحديث زر اللغة ======
function updateLanguageButton() {
    const btn = document.getElementById('languageToggle');
    if (btn) {
        btn.textContent = currentLang === 'ar' ? '🌐 EN' : '🌐 AR';
        btn.title = currentLang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية';
    }
}

// ====== إنشاء زر اللغة تلقائياً ======
function createLanguageButton() {
    // التحقق من عدم وجود الزر
    if (document.getElementById('languageToggle')) return;
    
    // التحقق من أن الصفحة لا تمنع ظهور الزر
    if (window.hideLanguageButton === true) return;
    
    
    const btn = document.createElement('button');
    btn.id = 'languageToggle';
    btn.className = 'language-toggle';
    btn.textContent = currentLang === 'ar' ? '🌐 EN' : '🌐 AR';
    btn.title = currentLang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية';
    btn.onclick = toggleLanguage;
    
    // إضافة الأنماط
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 99999;
        background: var(--button-color, #667EEA);
        color: white;
        border: none;
        padding: 7px 7px;
        border-radius: 50px;
        font-size: 9px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
        font-family: inherit;
    `;
    
    btn.onmouseenter = () => {
        btn.style.transform = 'scale(1.1)';
        btn.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.3)';
    };
    btn.onmouseleave = () => {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
    };
    
    document.body.appendChild(btn);
}

// ====== تهيئة اللغة عند تحميل الصفحة ======
document.addEventListener('DOMContentLoaded', function() {
    // تعيين الاتجاه حسب اللغة
    if (currentLang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', 'en');
    }
    
    // إنشاء زر اللغة
    createLanguageButton();
    
    // تطبيق الترجمات
    applyTranslations();
});

// ====== تصدير الدوال للاستخدام العام ======
window.t = t;
window.setLanguage = setLanguage;
window.toggleLanguage = toggleLanguage;
window.applyTranslations = applyTranslations;