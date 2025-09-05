require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const mongoose = require("mongoose");
const User = require("./models/User");
const Order = require("./models/Order");
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const { format, addMonths, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth } = require('date-fns');

const imagesDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Translation dictionaries
const translations = {
    uzbek: {
        welcome: "Zarinka Botiga xush kelibsiz! 👋\nBoshlash uchun /register dan foydalaning.",
        who_are_you: "Kim siz?",
        admin: "👩‍💻 Admin",
        baker: "👨‍🍳 Qandolatchi",
        phone_prompt: "📞 Iltimos, telefon raqamingizni yuboring:",
        share_phone: "📱 Telefon raqamini ulashish",
        registration_started: "Ro'yxatdan o'tish boshlandi!",
        first_name_prompt: "✍️ Iltimos, ismingizni kiriting:",
        last_name_prompt: "✍️ Iltimos, familiyangizni kiriting:",
        registered: " sifatida ro'yxatdan o'tdingiz!\nXush kelibsiz, ",
        login_successful: "Tizimga muvaffaqiyatli kirdingiz!",
        welcome_back: "⚡ Xush kelibsiz, ",
        logged_in_as: "! Siz ",
        role: " sifatida tizimga kirdingiz.",
        only_admins: "❌ Faqat adminlar buyurtma qo'sha oladi.",
        customer_name: "👤 Mijoz ismini kiriting:",
        product_name: "📦 Mahsulot nomini kiriting:",
        quantity: "🔢 Miqdorni kiriting:",
        valid_quantity: "❌ Iltimos, miqdor uchun haqiqiy raqam kiriting:",
        assign_baker: "👨‍🍳 Qandolatchiga topshirish:",
        no_assignment: "❌ Topshirilmagan",
        select_date: "📅 Yetkazib berish sanasini tanlang:",
        special_instructions: "💬 Maxsus ko'rsatmalarni kiriting (yoki 'o'tkazib yuborish' deb yozing):",
        order_created: "✅ Buyurtma muvaffaqiyatli yaratildi!",
        no_bakers: "⚡ Hali hech qanday Qandolatchi ro'yxatdan o'tmagan!",
        bakers_list: "👨‍🍳 Ro'yxatdan o'tgan Qandolatchilar:\n\n",
        not_registered: "❌ Iltimos, avval /register yordamida ro'yxatdan o'ting",
        no_orders: "📭 Hech qanday buyurtma topilmadi.",
        all_orders: "📋 Barcha buyurtmalar:\n\n",
        order: "📋 Buyurtma: ",
        product: "📦 Mahsulot: ",
        delivery: "📅 Yetkazib berish: ",
        status: "📊 Holati: ",
        instructions: "💬 Ko'rsatmalar: ",
        accept: "✅ Qabul qilish",
        reject: "❌ Rad etish",
        in_progress: "🔄 Jarayonda",
        complete: "✅ Tugatish",
        order_accepted: "✅ Buyurtma qabul qilindi!",
        order_rejected: "❌ Buyurtma rad etildi.",
        order_in_progress: "🔄 Buyurtma jarayonda sifatida belgilandi!",
        order_completed: "🎉 Buyurtma muvaffaqiyatli tugatildi!",
        only_bakers_accept: "❌ Faqat Qandolatchilar buyurtmalarni qabul qila oladi.",
        order_not_found: "❌ Buyurtma topilmadi.",
        not_assigned_to_you: "❌ Bu buyurtma sizga topshirilmagan.",
        order_already_status: "❌ Buyurtma holati allaqachon ",
        must_be_accepted: "❌ Buyurtma avval qabul qilinishi kerak. Joriy holati: ",
        must_be_in_progress: "❌ Buyurtma avval jarayonda bo'lishi kerak. Joriy holati: ",
        something_wrong: "⚠️ Nimadir noto'g'ri ketdi. Iltimos, qayta urinib ko'ring.",
        registration_failed: "⚠️ Ro'yxatdan o'tish muvaffaqiyatsiz tugadi, iltimos qayta urinib ko'ring.",
        logout_success: "🚪 Tizimdan muvaffaqiyatli chiqdingiz. Hisobingiz hali ham ro'yxatdan o'tgan.",
        not_registered_yet: "⚡ Siz hali ro'yxatdan o'tmagansiz.",
        logout_error: "Xatolik yuz berdi, keyinroq qayta urinib ko'ring.",
        months: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
        prev_month: '⬅️ Oldingi',
        today: 'Bugun',
        next_month: 'Keyingi ➡️',
        add_caption_prompt: "💬 Iltimos, ushbu rasm uchun sarlavha qo'shing (yoki sarlavhasiz o'tkazib yuborish uchun /skip yuboring)",
        caption_added: "✅ Rasmga sarlavha qo'shildi!",
        add_more_images: "📷 Ko'proq rasmlar qo'shish",
        send_images_prompt: "📷 Buyurtma uchun rasmlarni yuboring (yoki 'o'tkazib yuborish' tugmasini bosing)",
        skip_images: "📷 Rasmlarni o'tkazib yuborish",
        image_received: "✅ Rasm qabul qilindi. Sarlavha qo'shishingiz mumkin yoki yangi rasm yuboring",
        image_error: "❌ Rasmni qayta ishlashda xatolik",
        finish_order: "✅ Buyurtmani tugatish",
        add_caption_prompt: "💬 Iltimos, ushbu rasm uchun sarlavha qo'shishingizni so'raymiz (yoki /skip yuboring)",
        caption_added: "✅ Rasmga sarlavha qo'shildi!",
        add_more_images: "📷 Ko'proq rasmlar qo'shish",
        no_more_images: "✅ Boshqa rasmlar qo'shilmadi. Buyurtma yaratish uchun 'tugatish' tugmasini bosing",
        caption_skipped: "✅ Sarlavha o'tkazib yuborildi. Yangi rasm yuboring yoki 'tugatish' tugmasini bosing",
        skip: "⏭️ O'tkazib yuborish",
        skip_caption: "⏭️ Sarlavhasiz qoldirish",
        no_images: "📭 Rasmlarsiz davom etish",
        send_images_or_skip: "📷 Rasmlarni yuboring yoki ⏭️ o'tkazib yuboring",
        send_images_first: "📷 Avval buyurtma uchun rasmlarni yuboring:",
        notes_prompt: "💬 Maxsus ko'rsatmalarni kiriting:",
        skip_notes: "⏭️ Ko'rsatmalarni o'tkazib yuborish",
        no_notes: "📝 Ko'rsatmalarsiz davom etish",
    },
    russian: {
        welcome: "Добро пожаловать в Zarinka Bot! 👋\nИспользуйте /register чтобы начать.",
        who_are_you: "Кто вы?",
        admin: "👩‍💻 Администратор",
        baker: "👨‍🍳 Пекарь",
        phone_prompt: "📞 Пожалуйста, поделитесь своим номером телефона:",
        share_phone: "📱 Поделиться номером телефона",
        registration_started: "Регистрация началась!",
        first_name_prompt: "✍️ Пожалуйста, введите ваше имя:",
        last_name_prompt: "✍️ Пожалуйста, введите вашу фамилию:",
        registered: " зарегистрирован!\nДобро пожаловать, ",
        login_successful: "Вход выполнен успешно!",
        welcome_back: "⚡ С возвращением, ",
        logged_in_as: "! Вы вошли как ",
        role: ".",
        only_admins: "❌ Только администраторы могут добавлять заказы.",
        customer_name: "👤 Введите имя клиента:",
        product_name: "📦 Введите название продукта:",
        quantity: "🔢 Введите количество:",
        valid_quantity: "❌ Пожалуйста, введите действительное число для количества:",
        assign_baker: "👨‍🍳 Назначить пекарю:",
        no_assignment: "❌ Не назначено",
        select_date: "📅 Выберите дату доставки:",
        special_instructions: "💬 Введите особые инструкции (или введите 'пропустить'):",
        order_created: "✅ Заказ успешно создан!",
        no_bakers: "⚡ Еще нет зарегистрированных пекарей!",
        bakers_list: "👨‍🍳 Зарегистрированные пекари:\n\n",
        not_registered: "❌ Пожалуйста, сначала зарегистрируйтесь с помощью /register",
        no_orders: "📭 Заказы не найдены.",
        all_orders: "📋 Все заказы:\n\n",
        order: "📋 Заказ: ",
        product: "📦 Продукт: ",
        delivery: "📅 Доставка: ",
        status: "📊 Статус: ",
        instructions: "💬 Инструкции: ",
        accept: "✅ Принять",
        reject: "❌ Отклонить",
        in_progress: "🔄 В процессе",
        complete: "✅ Завершить",
        order_accepted: "✅ Заказ принят!",
        order_rejected: "❌ Заказ отклонен.",
        order_in_progress: "🔄 Заказ отмечен как в процессе!",
        order_completed: "🎉 Заказ успешно завершен!",
        only_bakers_accept: "❌ Только пекари могут принимать заказы.",
        order_not_found: "❌ Заказ не найден.",
        not_assigned_to_you: "❌ Этот заказ не назначен вам.",
        order_already_status: "❌ Статус заказа уже ",
        must_be_accepted: "❌ Заказ должен быть сначала принят. Текущий статус: ",
        must_be_in_progress: "❌ Заказ должен быть в процессе. Текущий статус: ",
        something_wrong: "⚠️ Что-то пошло не так. Пожалуйста, попробуйте еще раз.",
        registration_failed: "⚠️ Регистрация не удалась, пожалуйста, попробуйте еще раз.",
        logout_success: "🚪 Вы вышли из системы. Ваша учетная запись все еще зарегистрирована.",
        not_registered_yet: "⚡ Вы еще не зарегистрированы.",
        logout_error: "Что-то пошло не так, попробуйте позже.",
        months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        prev_month: '⬅️ Предыдущий',
        today: 'Сегодня',
        next_month: 'Следующий ➡️',
        add_caption_prompt: "💬 Пожалуйста, добавьте подпись к этому изображению (или отправьте /skip чтобы пропустить)",
        caption_added: "✅ Подпись добавлена к изображению!",
        add_more_images: "📷 Добавить еще изображения",
        send_images_prompt: "📷 Отправьте изображения для заказа (или нажмите 'пропустить')",
        skip_images: "📷 Пропустить изображения",
        image_received: "✅ Изображение получено. Вы можете добавить подпись или отправить новое изображение",
        image_error: "❌ Ошибка обработки изображения",
        finish_order: "✅ Завершить заказ",
        add_caption_prompt: "💬 Пожалуйста, добавьте подпись к этому изображению (или отправьте /skip)",
        caption_added: "✅ Подпись добавлена к изображению!",
        add_more_images: "📷 Добавить еще изображения",
        no_more_images: "✅ Больше изображений не добавлено. Нажмите 'завершить' чтобы создать заказ",
        caption_skipped: "✅ Подпись пропущена. Отправьте новое изображение или нажмите 'завершить'",
        skip: "⏭️ Пропустить",
        skip_caption: "⏭️ Без подписи",
        no_images: "📭 Продолжить без изображений",
        send_images_or_skip: "📷 Отправьте изображения или ⏭️ пропустите",
        send_images_first: "📷 Сначала отправьте изображения для заказа:",
        notes_prompt: "💬 Введите особые инструкции:",
        skip_notes: "⏭️ Пропустить инструкции",
        no_notes: "📝 Продолжить без инструкций",
    }
};

// In-memory sessions
const sessions = {};       // for orders
const regSessions = {};    // for registration
const userLanguages = {};  // to store user language preferences

// Helper function to get user language
function getUserLanguage(userId) {
    return userLanguages[userId] || 'uzbek'; // Default to Uzbek
}

// ---------- ROLE-BASED COMMANDS ----------
async function setCommandsForUser(ctx, role) {
    try {
        const lang = getUserLanguage(ctx.from.id);

        if (role === "admin") {
            await bot.telegram.setMyCommands(
                [
                    { command: "neworder", description: lang === 'uzbek' ? "Yangi buyurtma qo'shish" : "Добавить новый заказ" },
                    { command: "orders", description: lang === 'uzbek' ? "Barcha buyurtmalarni ko'rish" : "Просмотреть все заказы" },
                    { command: "bakers", description: lang === 'uzbek' ? "Barcha Qandolatchilarni ro'yxati" : "Список всех пекарей" },
                    { command: "logout", description: lang === 'uzbek' ? "Chiqish" : "Выйти" },
                ],
                { scope: { type: "chat", chat_id: ctx.chat.id } }
            );
        } else if (role === "baker") {
            await bot.telegram.setMyCommands(
                [
                    { command: "orders", description: lang === 'uzbek' ? "Menga topshirilgan buyurtmalar" : "Просмотреть мои заказы" },
                    { command: "logout", description: lang === 'uzbek' ? "Chiqish" : "Выйти" },
                ],
                { scope: { type: "chat", chat_id: ctx.chat.id } }
            );
        } else {
            await bot.telegram.setMyCommands(
                [{ command: "register", description: lang === 'uzbek' ? "Admin yoki Qandolatchi sifatida ro'yxatdan o'tish" : "Зарегистрироваться как Админ или Пекарь" }],
                { scope: { type: "chat", chat_id: ctx.chat.id } }
            );
        }
    } catch (err) {
        console.error("❌ Error setting commands:", err.message);
    }
}

// ========== Calendar Helper Functions ==========

function generateCalendar(date, userId) {
    const lang = getUserLanguage(userId);
    const t = translations[lang];

    const startDay = startOfWeek(startOfMonth(date));
    const endDay = endOfWeek(endOfMonth(date));

    let calendar = [];
    let row = [];
    let day = startDay;

    // Add month and year header
    const monthName = t.months[date.getMonth()];
    const year = date.getFullYear();

    calendar.push([
        Markup.button.callback(`${monthName} ${year}`, 'noop')
    ]);

    // Add day abbreviations
    const dayAbbreviations = lang === 'uzbek'
        ? ['Ya', 'Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha']
        : ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    const dayHeader = dayAbbreviations.map(day => Markup.button.callback(day, 'noop'));
    calendar.push(dayHeader);

    while (day <= endDay) {
        for (let i = 0; i < 7; i++) {
            if (isSameMonth(day, date)) {
                row.push(Markup.button.callback(
                    format(day, 'd'),
                    `select_date_${format(day, 'yyyy-MM-dd')}`
                ));
            } else {
                row.push(Markup.button.callback(' ', 'noop'));
            }
            day = addDays(day, 1);
        }
        calendar.push(row);
        row = [];
    }

    // Add navigation buttons
    calendar.push([
        Markup.button.callback(t.prev_month, 'prev_month'),
        Markup.button.callback(t.today, 'select_date_today'),
        Markup.button.callback(t.next_month, 'next_month')
    ]);

    return Markup.inlineKeyboard(calendar);
}

// ---------- MONGODB CONNECTION ----------
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected");

        // Debug middleware should be first
        bot.use((ctx, next) => {
            console.log("📩 Update received:", ctx.updateType, ctx.update.message?.text || ctx.update.callback_query?.data || "No text");
            return next();
        });

        setupBotHandlers();
        bot.launch();
        console.log("🤖 Zarinka Bot running...");
    })
    .catch((err) => console.log("❌ MongoDB connection error:", err));

function setupBotHandlers() {
    //
    // ======================= START =======================
    //
    bot.start(async (ctx) => {
        try {
            // Ask for language preference
            await ctx.reply(
                "Please choose your language / Iltimos, tilni tanlang / Пожалуйста, выберите язык:",
                Markup.inlineKeyboard([
                    [Markup.button.callback("O'zbek tili", "set_lang_uzbek")],
                    [Markup.button.callback("Русский язык", "set_lang_russian")],
                ])
            );
        } catch (err) {
            console.error("❌ Start command error:", err.message);
            ctx.reply("⚠️ Something went wrong. Please try again.");
        }
    });

    // Language selection handler
    bot.action(/set_lang_(.+)/, async (ctx) => {
        try {
            const lang = ctx.match[1];
            userLanguages[ctx.from.id] = lang;
            const t = translations[lang];

            await setCommandsForUser(ctx, null);
            await ctx.editMessageText(t.welcome);
            await ctx.answerCbQuery();
        } catch (err) {
            console.error("❌ Language selection error:", err.message);
            await ctx.answerCbQuery("⚠️ Something went wrong. Please try again.");
        }
    });

    bot.command("test", (ctx) => {
        console.log("Test command received");
        ctx.reply("✅ Test working!");
    });


    // ======================= REGISTRATION =======================
    bot.command("register", async (ctx) => {
        console.log("Register command received");
        try {
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            regSessions[ctx.from.id] = { step: "choose_role" };
            await ctx.reply(
                t.who_are_you,
                Markup.inlineKeyboard([
                    [Markup.button.callback(t.admin, "role_admin")],
                    [Markup.button.callback(t.baker, "role_baker")],
                ])
            );
        } catch (err) {
            console.error("❌ Register command error:", err.message);
            ctx.reply("⚠️ Registration failed. Please try again.");
        }
    });

    // Handle role choice
    bot.action(/role_(.+)/, async (ctx) => {
        console.log("Role action received:", ctx.match[1]);
        try {
            const role = ctx.match[1];
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            regSessions[ctx.from.id] = { step: "phone", role };

            await ctx.reply(
                t.phone_prompt,
                Markup.keyboard([Markup.button.contactRequest(t.share_phone)])
                    .oneTime()
                    .resize()
            );
            await ctx.answerCbQuery();
        } catch (err) {
            console.error("❌ Role selection error:", err.message);
            await ctx.answerCbQuery("⚠️ Something went wrong. Please try /register again.");
        }
    });

    // ======================= LOGOUT =======================

    bot.command("logout", async (ctx) => {
        console.log("Logout command received");
        try {
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            const user = await User.findOne({ telegramId: String(ctx.from.id) });

            if (!user) {
                return ctx.reply(t.not_registered_yet);
            }

            // Just clear sessions and update commands, DON'T delete the user
            delete regSessions[ctx.from.id];
            delete sessions[ctx.from.id];
            await setCommandsForUser(ctx, null);

            ctx.reply(t.logout_success);
        } catch (err) {
            console.error("❌ Logout error:", err.message);
            ctx.reply(t.logout_error);
        }
    });

    // ======================= ORDERS =======================
    bot.command("neworder", async (ctx) => {
        console.log("Neworder command received");
        try {
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            const user = await User.findOne({ telegramId: String(ctx.from.id) });
            if (!user || user.role !== "admin") {
                return ctx.reply(t.only_admins);
            }

            sessions[ctx.from.id] = { step: 1, data: {} };
            ctx.reply(t.customer_name);
        } catch (err) {
            console.error("❌ Neworder command error:", err.message);
            ctx.reply(t.something_wrong);
        }
    });

    // ======================= BAKERS LIST =======================
    bot.command("bakers", async (ctx) => {
        console.log("Bakers command received");
        try {
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            const user = await User.findOne({ telegramId: String(ctx.from.id) });
            console.log("🔎 Admin lookup:", user);

            if (!user || user.role !== "admin") {
                return ctx.reply(t.only_admins);
            }

            const bakers = await User.find({ role: "baker" });

            if (!bakers || bakers.length === 0) {
                return ctx.reply(t.no_bakers);
            }

            let message = t.bakers_list;
            bakers.forEach((b, i) => {
                message += `${i + 1}. ${b.firstName} ${b.lastName} 📞 ${b.phone}\n`;
            });

            return ctx.reply(message);
        } catch (err) {
            console.error("❌ Bakers list error:", err.message);
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];
            return ctx.reply(t.something_wrong);
        }
    });

    bot.command("orders", async (ctx) => {
        try {
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            const user = await User.findOne({ telegramId: String(ctx.from.id) });
            if (!user) {
                return ctx.reply(t.not_registered);
            }

            let orders;
            if (user.role === "admin") {
                orders = await Order.find().populate('assignedBaker', 'firstName lastName');

                // Добавьте этот блок:
                let message = t.all_orders;
                orders.forEach((order, index) => {
                    const bakerName = order.assignedBaker
                        ? `${order.assignedBaker.firstName} ${order.assignedBaker.lastName}`
                        : lang === 'uzbek' ? "Topshirilmagan" : "Не назначено";

                    message += `🆔 ${lang === 'uzbek' ? 'Buyurtma' : 'Заказ'} ${index + 1}\n`;
                    message += `👤 ${lang === 'uzbek' ? 'Mijoz' : 'Клиент'}: ${order.customerName}\n`;
                    message += `📦 ${lang === 'uzbek' ? 'Mahsulot' : 'Продукт'}: ${order.productName}\n`;
                    message += `🔢 ${lang === 'uzbek' ? 'Miqdor' : 'Количество'}: ${order.quantity}\n`;
                    message += `👨‍🍳 ${lang === 'uzbek' ? 'Qandolatchi' : 'Пекарь'}: ${bakerName}\n`;
                    message += `${t.delivery}${order.deliveryDate}\n`;
                    message += `${t.status}${order.status}\n`;

                    // Add image count info
                    if (order.images && order.images.length > 0) {
                        message += `📸 ${lang === 'uzbek' ? 'Rasmlar' : 'Изображения'}: ${order.images.length}\n`;
                    }

                    if (order.specialInstructions) {
                        message += `${t.instructions}${order.specialInstructions}\n`;
                    }
                    message += `────────────────────\n`;
                });

                ctx.reply(message);
                return;
            } else if (user.role === "baker") {
                orders = await Order.find({ assignedBaker: user._id }).populate('assignedBaker', 'firstName lastName');
                if (!orders || orders.length === 0) {
                    return ctx.reply(t.no_orders);
                }

                const bakerOrders = orders.filter(order =>
                    order.assignedBaker && order.assignedBaker._id.equals(user._id)
                );

                for (const order of bakerOrders) {
                    let message = `${t.order}${order.customerName}\n`;
                    message += `${t.product}${order.productName}\n`;
                    message += `🔢 ${lang === 'uzbek' ? 'Miqdori' : 'Количество'}: ${order.quantity}\n`;
                    message += `${t.delivery}${order.deliveryDate}\n`;
                    message += `${t.status}${order.status}\n`;
                    if (order.specialInstructions) {
                        message += `${t.instructions}${order.specialInstructions}\n`;
                    }

                    let buttons = [];

                    if (order.status === 'pending') {
                        buttons = [
                            [
                                Markup.button.callback(t.accept, `accept_${order._id}`),
                                Markup.button.callback(t.reject, `reject_${order._id}`)
                            ]
                        ];
                    } else if (order.status === 'accepted') {
                        buttons = [
                            [
                                Markup.button.callback(t.in_progress, `progress_${order._id}`),
                                Markup.button.callback(t.complete, `complete_${order._id}`)
                            ]
                        ];
                    } else if (order.status === 'in_progress') {
                        buttons = [
                            [Markup.button.callback(t.complete, `complete_${order._id}`)]
                        ];
                    }

                    // Если есть изображения, отправляем их как media group с первым caption = message
                    if (order.images && order.images.length > 0) {
                        // Main photo with caption + buttons
                        await ctx.replyWithPhoto(order.images[0].fileId, {
                            caption: message,
                            ...Markup.inlineKeyboard(buttons),
                        });

                        // Send remaining photos without captions
                        for (let i = 1; i < order.images.length; i++) {
                            await ctx.replyWithPhoto(order.images[i].fileId);
                        }
                    } else {
                        // No images → just text + buttons
                        await ctx.reply(message, Markup.inlineKeyboard(buttons));
                    }
                }
                return;
            }

            // ... rest of admin order viewing code ...
        } catch (err) {
            console.error("❌ Orders command error:", err.message);
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];
            ctx.reply(t.something_wrong);
        }
    });

    // Helper function to send order with images
    async function sendOrderWithImages(ctx, order, message, buttons = null) {
        const lang = getUserLanguage(ctx.from.id);
        const t = translations[lang];

        // Send the order message
        if (buttons) {
            await ctx.editMessageText(message, Markup.inlineKeyboard(buttons));
        } else {
            await ctx.editMessageText(message);
        }

        // Send images if they exist
        if (order.images && order.images.length > 0) {
            for (const image of order.images) {
                try {
                    await ctx.replyWithPhoto(image.fileId, {
                        caption: image.caption || `${lang === 'uzbek' ? 'Buyurtma rasmi' : 'Изображение заказа'}`
                    });
                } catch (error) {
                    try {
                        await ctx.replyWithDocument(image.fileId, {
                            caption: image.caption || `${lang === 'uzbek' ? 'Buyurtma fayli' : 'Файл заказа'}`
                        });
                    } catch (docError) {
                        await ctx.reply(
                            `📄 ${lang === 'uzbek' ? 'Fayl' : 'Файл'}: ${image.filename}\n` +
                            (image.caption ? `📝 ${image.caption}\n` : '')
                        );
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
    }

    // Update all order action handlers to use the helper function
    bot.action(/accept_(.+)/, async (ctx) => {
        try {
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            const orderId = ctx.match[1];
            const user = await User.findOne({ telegramId: String(ctx.from.id) });

            if (!user || user.role !== "baker") {
                await ctx.answerCbQuery(t.only_bakers_accept);
                return;
            }

            const order = await Order.findById(orderId).populate('assignedBaker');
            if (!order) {
                await ctx.answerCbQuery(t.order_not_found);
                return;
            }

            if (!order.assignedBaker || !order.assignedBaker._id.equals(user._id)) {
                await ctx.answerCbQuery(t.not_assigned_to_you);
                return;
            }

            if (order.status !== 'pending') {
                await ctx.answerCbQuery(`${t.order_already_status}${order.status}.`);
                return;
            }

            order.status = 'accepted';
            await order.save();

            await ctx.answerCbQuery(t.order_accepted);

            // Use helper function to show order with images
            const message = ctx.update.callback_query.message.text + `\n✅ ${lang === 'uzbek' ? 'Holati' : 'Статус'}: ${lang === 'uzbek' ? 'QABUL QILINDI' : 'ПРИНЯТ'}`;
            const buttons = [
                [
                    Markup.button.callback(t.in_progress, `progress_${order._id}`),
                    Markup.button.callback(t.complete, `complete_${order._id}`)
                ]
            ];

            await sendOrderWithImages(ctx, order, message, buttons);

        } catch (err) {
            console.error("❌ Accept order error:", err.message);
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];
            await ctx.answerCbQuery(t.something_wrong);
        }
    });

    // Similarly update other action handlers (reject_, progress_, complete_)
    bot.action(/reject_(.+)/, async (ctx) => {
        try {
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            const orderId = ctx.match[1];
            const user = await User.findOne({ telegramId: String(ctx.from.id) });

            if (!user || user.role !== "baker") {
                await ctx.answerCbQuery(t.only_bakers_accept);
                return;
            }

            const order = await Order.findById(orderId).populate('assignedBaker');
            if (!order) {
                await ctx.answerCbQuery(t.order_not_found);
                return;
            }

            if (!order.assignedBaker || !order.assignedBaker._id.equals(user._id)) {
                await ctx.answerCbQuery(t.not_assigned_to_you);
                return;
            }

            if (order.status !== 'pending') {
                await ctx.answerCbQuery(`${t.order_already_status}${order.status}.`);
                return;
            }

            order.status = 'rejected';
            await order.save();

            await ctx.answerCbQuery(t.order_rejected);

            // Use helper function
            const message = ctx.update.callback_query.message.text + `\n❌ ${lang === 'uzbek' ? 'Holati' : 'Статус'}: ${lang === 'uzbek' ? 'RAD ETILDI' : 'ОТКЛОНЕНО'}`;
            await sendOrderWithImages(ctx, order, message);

        } catch (err) {
            console.error("❌ Reject order error:", err.message);
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];
            await ctx.answerCbQuery(t.something_wrong);
        }
    });

    bot.action(/progress_(.+)/, async (ctx) => {
        try {
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            const orderId = ctx.match[1];
            const user = await User.findOne({ telegramId: String(ctx.from.id) });

            if (!user || user.role !== "baker") {
                await ctx.answerCbQuery(t.only_bakers_accept);
                return;
            }

            const order = await Order.findById(orderId).populate('assignedBaker');
            if (!order) {
                await ctx.answerCbQuery(t.order_not_found);
                return;
            }

            if (!order.assignedBaker || !order.assignedBaker._id.equals(user._id)) {
                await ctx.answerCbQuery(t.not_assigned_to_you);
                return;
            }

            if (order.status !== 'accepted') {
                await ctx.answerCbQuery(`${t.must_be_accepted}${order.status}`);
                return;
            }

            order.status = 'in_progress';
            await order.save();

            await ctx.answerCbQuery(t.order_in_progress);
            await ctx.editMessageText(
                ctx.update.callback_query.message.text + `\n🔄 ${lang === 'uzbek' ? 'Holati' : 'Статус'}: ${lang === 'uzbek' ? 'JARAYONDA' : 'В ПРОЦЕССЕ'}`,
                Markup.inlineKeyboard([
                    [Markup.button.callback(t.complete, `complete_${order._id}`)]
                ])
            );
        } catch (err) {
            console.error("❌ Progress order error:", err.message);
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];
            await ctx.answerCbQuery(t.something_wrong);
        }
    });

    bot.action(/complete_(.+)/, async (ctx) => {
        try {
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            const orderId = ctx.match[1];
            const user = await User.findOne({ telegramId: String(ctx.from.id) });

            if (!user || user.role !== "baker") {
                await ctx.answerCbQuery(t.only_bakers_accept);
                return;
            }

            const order = await Order.findById(orderId).populate('assignedBaker');
            if (!order) {
                await ctx.answerCbQuery(t.order_not_found);
                return;
            }

            if (!order.assignedBaker || !order.assignedBaker._id.equals(user._id)) {
                await ctx.answerCbQuery(t.not_assigned_to_you);
                return;
            }

            if (order.status !== 'in_progress') {
                await ctx.answerCbQuery(`${t.must_be_in_progress}${order.status}`);
                return;
            }

            order.status = 'completed';
            await order.save();

            await ctx.answerCbQuery(t.order_completed);
            await ctx.editMessageText(
                ctx.update.callback_query.message.text + `\n🎉 ${lang === 'uzbek' ? 'Holati' : 'Статус'}: ${lang === 'uzbek' ? 'TUGATILDI' : 'ЗАВЕРШЕНО'}`,
                Markup.inlineKeyboard([]) // Remove buttons
            );
        } catch (err) {
            console.error("❌ Complete order error:", err.message);
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];
            await ctx.answerCbQuery(t.something_wrong);
        }
    });

    // Handle phone (contact message) - MUST come before general text handler
    bot.on("contact", async (ctx) => {
        console.log("Contact received");
        try {
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            const session = regSessions[ctx.from.id];
            if (!session || session.step !== "phone") return;

            const phone = ctx.message.contact.phone_number;

            // 🔎 Check if user already exists by phone
            let existingUser = await User.findOne({ phone });

            if (existingUser) {
                // ✅ Already registered → login
                ctx.reply(
                    `${t.welcome_back}${existingUser.firstName} ${existingUser.lastName}!${t.logged_in_as}${existingUser.role}${t.role}`
                );

                // Update telegramId in case changed device
                existingUser.telegramId = String(ctx.from.id);
                await existingUser.save();

                await setCommandsForUser(ctx, existingUser.role);

                // IMMEDIATELY delete the session and remove keyboard
                delete regSessions[ctx.from.id];

                // Remove the contact request keyboard with a new message
                await ctx.reply(t.login_successful, Markup.removeKeyboard());

                // Return early to prevent any further processing
                return;
            } else {
                // 🆕 Not registered → ask first name
                session.phone = phone;
                session.step = "first_name";
                // Remove the keyboard first, then ask for name
                await ctx.reply(t.registration_started, Markup.removeKeyboard());
                ctx.reply(t.first_name_prompt);
            }
        } catch (err) {
            console.error("❌ Registration error:", err.message);
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];
            ctx.reply(t.registration_failed);
        }
    });

    // Handle first/last name and order creation
    bot.on("text", async (ctx) => {
        console.log("Text received:", ctx.message.text);

        // Skip if it's a command
        if (ctx.message.text.startsWith('/')) return;

        // Skip if it's the contact share button text
        if (ctx.message.text.includes("Share Phone") || ctx.message.text.includes("📱")) {
            console.log("Ignoring contact share button text");
            return;
        }

        try {
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            // Check if registration session still exists
            const regSession = regSessions[ctx.from.id];
            if (regSession) {
                switch (regSession.step) {
                    case "first_name":
                        regSession.firstName = ctx.message.text;
                        regSession.step = "last_name";
                        return ctx.reply(t.last_name_prompt);

                    case "last_name":
                        regSession.lastName = ctx.message.text;

                        const newUser = new User({
                            telegramId: String(ctx.from.id),
                            role: regSession.role,
                            firstName: regSession.firstName,
                            lastName: regSession.lastName,
                            phone: regSession.phone,
                        });

                        await newUser.save();
                        ctx.reply(
                            `✅ ${regSession.role}${t.registered}${regSession.firstName} ${regSession.lastName}.`
                        );

                        await setCommandsForUser(ctx, regSession.role);
                        delete regSessions[ctx.from.id];
                        return;
                }
            }

            // Check order sessions
            const orderSession = sessions[ctx.from.id];
            if (orderSession && orderSession.step) {
                console.log("Processing order session step:", orderSession.step);
                const text = ctx.message.text;

                switch (orderSession.step) {
                    case 1: // Customer name
                        orderSession.data.customerName = text;
                        orderSession.step = 2;
                        return ctx.reply(t.product_name);

                    case 2: // Product name
                        orderSession.data.productName = text;
                        orderSession.step = 3;
                        return ctx.reply(t.quantity);

                    case 3: // Quantity
                        if (isNaN(text) || parseInt(text) <= 0) {
                            return ctx.reply(t.valid_quantity);
                        }
                        orderSession.data.quantity = parseInt(text);
                        orderSession.step = 4;

                        // Get all available bakers
                        const bakers = await User.find({ role: "baker" });
                        if (bakers.length === 0) {
                            orderSession.data.assignedBaker = null;
                            orderSession.step = 5;

                            // Show calendar for delivery date
                            orderSession.calendarDate = new Date();
                            await ctx.reply(
                                t.select_date,
                                generateCalendar(orderSession.calendarDate, ctx.from.id)
                            );
                            break;
                        }

                        // Create buttons for bakers
                        const bakerButtons = bakers.map(baker =>
                            [Markup.button.callback(`${baker.firstName} ${baker.lastName}`, `assign_baker_${baker._id}`)]
                        );
                        bakerButtons.push([Markup.button.callback(t.no_assignment, "assign_baker_none")]);

                        await ctx.reply(
                            t.assign_baker,
                            Markup.inlineKeyboard(bakerButtons)
                        );
                        break;

                    case 5: // After date selection - go to IMAGES first
                        orderSession.data.deliveryDate = text;
                        orderSession.step = 6; // Images step

                        // Initialize images array
                        orderSession.data.images = [];

                        await ctx.reply(
                            t.send_images_first,
                            Markup.inlineKeyboard([
                                [Markup.button.callback(t.skip, 'skip_images')],
                                [Markup.button.callback(t.finish_order, 'finish_order')]
                            ])
                        );
                        break;

                    case 7: // Notes step (after images)
                        orderSession.data.specialInstructions = text;
                        orderSession.step = 8; // Final confirmation

                        // Create the order
                        const order = new Order({
                            customerName: orderSession.data.customerName,
                            productName: orderSession.data.productName,
                            quantity: orderSession.data.quantity,
                            assignedBaker: orderSession.data.assignedBaker,
                            deliveryDate: orderSession.data.deliveryDate,
                            specialInstructions: orderSession.data.specialInstructions,
                            images: orderSession.data.images || [],
                            status: 'pending',
                            createdBy: ctx.from.id
                        });

                        await order.save();

                        await ctx.reply(t.order_created);
                        delete sessions[ctx.from.id];
                        break;

                    case 6: // Image caption handling
                        // If we're in step 6 and receiving text, it could be a caption
                        if (orderSession.data.lastImageId) {
                            // Find the image and add caption
                            const imageIndex = orderSession.data.images.findIndex(
                                img => img.fileId === orderSession.data.lastImageId
                            );

                            if (imageIndex !== -1) {
                                orderSession.data.images[imageIndex].caption = text;
                                delete orderSession.data.lastImageId;

                                await ctx.reply(t.caption_added, Markup.inlineKeyboard([
                                    [Markup.button.callback(t.add_more_images, 'add_more_images')],
                                    [Markup.button.callback(t.skip_notes, 'skip_to_notes')],
                                    [Markup.button.callback(t.finish_order, 'finish_order')]
                                ]));
                            }
                        }
                        break;
                }
            } else {
                console.log("No active sessions found, ignoring text");
            }

        } catch (err) {
            console.error("❌ Text handler error:", err.message);
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];
            ctx.reply(t.something_wrong);
        }
    });

    // Add image handler for order images
    bot.on(['photo', 'document'], async (ctx) => {
        try {
            console.log("Media received:", ctx.updateType);

            const orderSession = sessions[ctx.from.id];
            if (!orderSession || orderSession.step !== 6) { // Changed to step 6 for images
                console.log("No active order session or wrong step");
                return;
            }

            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            let fileId, filename;

            if (ctx.message.photo) {
                // Handle photos
                console.log("Photo received");
                const photo = ctx.message.photo[ctx.message.photo.length - 1];
                fileId = photo.file_id;
                filename = `photo_${Date.now()}.jpg`;
            } else if (ctx.message.document && ctx.message.document.mime_type?.startsWith('image/')) {
                // Handle image documents only
                console.log("Image document received");
                fileId = ctx.message.document.file_id;
                filename = ctx.message.document.file_name || `image_${Date.now()}`;
            } else {
                // Not an image, ignore
                console.log("Non-image document received, ignoring");
                return;
            }

            // Initialize images array if it doesn't exist
            if (!orderSession.data.images) {
                orderSession.data.images = [];
            }

            // Store image info in session
            orderSession.data.images.push({
                fileId,
                filename,
                caption: ''
            });

            // Store the last image ID for caption handling
            orderSession.data.lastImageId = fileId;

            await ctx.reply(
                t.image_received,
                Markup.inlineKeyboard([
                    [Markup.button.callback(t.skip_caption, 'skip_caption')],
                    [Markup.button.callback(t.skip_notes, 'skip_to_notes')],
                    [Markup.button.callback(t.finish_order, 'finish_order')]
                ])
            );

        } catch (err) {
            console.error("❌ Image handling error:", err.message);
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];
            await ctx.reply(t.something_wrong);
        }
    });

    // Skip to notes button handler
    bot.action('skip_to_notes', async (ctx) => {
        try {
            const session = sessions[ctx.from.id];
            if (!session || session.step !== 6) {
                await ctx.answerCbQuery("⚠️ Session expired.");
                return;
            }

            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            // Move to notes step
            session.step = 7;

            await ctx.editMessageText(
                t.notes_prompt,
                Markup.inlineKeyboard([
                    [Markup.button.callback(t.skip_notes, 'skip_notes')],
                    [Markup.button.callback(t.finish_order, 'finish_order')]
                ])
            );

            await ctx.answerCbQuery();
        } catch (err) {
            console.error("❌ Skip to notes error:", err.message);
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];
            await ctx.answerCbQuery(t.something_wrong);
        }
    });

    // Skip notes button handler
    bot.action('skip_notes', async (ctx) => {
        try {
            const session = sessions[ctx.from.id];
            if (!session || session.step !== 7) {
                await ctx.answerCbQuery("⚠️ Session expired.");
                return;
            }

            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            // Create the order without notes
            const order = new Order({
                customerName: session.data.customerName,
                productName: session.data.productName,
                quantity: session.data.quantity,
                assignedBaker: session.data.assignedBaker,
                deliveryDate: session.data.deliveryDate,
                specialInstructions: '',
                images: session.data.images || [],
                status: 'pending',
                createdBy: ctx.from.id
            });

            await order.save();

            await ctx.editMessageText(t.order_created);
            await ctx.answerCbQuery();
            delete sessions[ctx.from.id];
        } catch (err) {
            console.error("❌ Skip notes error:", err.message);
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];
            await ctx.answerCbQuery(t.something_wrong);
        }
    });

    // Update the skip_images handler
    bot.action('skip_images', async (ctx) => {
        try {
            const session = sessions[ctx.from.id];
            if (!session || session.step !== 6) {
                await ctx.answerCbQuery("⚠️ Session expired.");
                return;
            }

            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            // Move directly to notes step
            session.step = 7;

            await ctx.editMessageText(
                t.notes_prompt,
                Markup.inlineKeyboard([
                    [Markup.button.callback(t.skip_notes, 'skip_notes')],
                    [Markup.button.callback(t.finish_order, 'finish_order')]
                ])
            );

            await ctx.answerCbQuery();
        } catch (err) {
            console.error("❌ Skip images error:", err.message);
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];
            await ctx.answerCbQuery(t.something_wrong);
        }
    });

    // Update the finish_order handler to handle both steps
    bot.action('finish_order', async (ctx) => {
        try {
            const session = sessions[ctx.from.id];
            if (!session) {
                await ctx.answerCbQuery("⚠️ Session expired.");
                return;
            }

            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            // Create the order (handle both cases - with or without notes)
            const order = new Order({
                customerName: session.data.customerName,
                productName: session.data.productName,
                quantity: session.data.quantity,
                assignedBaker: session.data.assignedBaker,
                deliveryDate: session.data.deliveryDate,
                specialInstructions: session.data.specialInstructions || '',
                images: session.data.images || [],
                status: 'pending',
                createdBy: ctx.from.id
            });

            await order.save();

            await ctx.editMessageText(t.order_created);
            await ctx.answerCbQuery();
            delete sessions[ctx.from.id];
        } catch (err) {
            console.error("❌ Order creation error:", err.message);
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];
            await ctx.answerCbQuery(t.something_wrong);
        }
    });

    // Add baker assignment handler
    bot.action(/assign_baker_(.+)/, async (ctx) => {
        try {
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            const bakerId = ctx.match[1];
            const session = sessions[ctx.from.id];

            if (!session || session.step !== 4) {
                await ctx.answerCbQuery(t.something_wrong);
                return;
            }

            if (bakerId === 'none') {
                session.data.assignedBaker = null;
                await ctx.answerCbQuery(t.no_assignment);
            } else {
                session.data.assignedBaker = bakerId;
                const baker = await User.findById(bakerId);
                await ctx.answerCbQuery(`${lang === 'uzbek' ? 'Topshirildi' : 'Назначено'} ${baker.firstName} ${baker.lastName}`);
            }

            session.step = 5;
            session.calendarDate = new Date(); // Initialize calendar date

            await ctx.deleteMessage();
            await ctx.reply(
                t.select_date,
                generateCalendar(session.calendarDate, ctx.from.id)
            );
        } catch (err) {
            console.error("❌ Baker assignment error:", err.message);
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];
            await ctx.answerCbQuery(t.something_wrong);
        }
    });

    // Add date selection handlers
    bot.action(/select_date_(.+)/, async (ctx) => {
        try {
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            const dateStr = ctx.match[1];
            const session = sessions[ctx.from.id];

            if (!session || session.step !== 5) {
                await ctx.answerCbQuery(t.something_wrong);
                return;
            }

            let selectedDate;
            if (dateStr === 'today') {
                selectedDate = new Date();
            } else {
                selectedDate = new Date(dateStr);
            }

            session.data.deliveryDate = format(selectedDate, 'yyyy-MM-dd');
            session.step = 6; // Changed to step 6 for images

            await ctx.answerCbQuery(`${lang === 'uzbek' ? 'Tanlandi' : 'Выбрано'}: ${format(selectedDate, 'MMM dd, yyyy')}`);
            await ctx.deleteMessage();

            // Go to images step instead of notes
            await ctx.reply(
                t.send_images_first,
                Markup.inlineKeyboard([
                    [Markup.button.callback(t.skip, 'skip_images')],
                    [Markup.button.callback(t.finish_order, 'finish_order')]
                ])
            );
        } catch (err) {
            console.error("❌ Date selection error:", err.message);
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];
            await ctx.answerCbQuery(t.something_wrong);
        }
    });

    // Add calendar navigation handlers
    bot.action('prev_month', async (ctx) => {
        try {
            const session = sessions[ctx.from.id];
            if (!session || session.step !== 5) {
                await ctx.answerCbQuery("⚠️ Session expired.");
                return;
            }

            session.calendarDate = addMonths(session.calendarDate, -1);
            await ctx.answerCbQuery();
            await ctx.editMessageText(
                translations[getUserLanguage(ctx.from.id)].select_date,
                generateCalendar(session.calendarDate, ctx.from.id)
            );
        } catch (err) {
            console.error("❌ Calendar navigation error:", err.message);
            await ctx.answerCbQuery("⚠️ Navigation failed.");
        }
    });

    bot.action('next_month', async (ctx) => {
        try {
            const session = sessions[ctx.from.id];
            if (!session || session.step !== 5) {
                await ctx.answerCbQuery("⚠️ Session expired.");
                return;
            }

            session.calendarDate = addMonths(session.calendarDate, 1);
            await ctx.answerCbQuery();
            await ctx.editMessageText(
                translations[getUserLanguage(ctx.from.id)].select_date,
                generateCalendar(session.calendarDate, ctx.from.id)
            );
        } catch (err) {
            console.error("❌ Calendar navigation error:", err.message);
            await ctx.answerCbQuery("⚠️ Navigation failed.");
        }
    });

    // Add noop handler for empty calendar buttons
    bot.action('noop', async (ctx) => {
        await ctx.answerCbQuery(); // Just acknowledge the click, do nothing
    });

    // Global error handler
    bot.catch((err, ctx) => {
        console.error(`❌ Global error for ${ctx.updateType}:`, err);

        try {
            const lang = getUserLanguage(ctx.from.id);
            const t = translations[lang];

            // Try to send a helpful error message
            ctx.reply(t.something_wrong).catch(e => {
                console.error("Could not send error message:", e);
            });

            // If it's a session error, clear the session
            if (err.message.includes('session') || err.message.includes('step')) {
                delete sessions[ctx.from.id];
                ctx.reply("🔄 Iltimos, yangidan boshlang / Please start again").catch(e => {
                    console.error("Could not send restart message:", e);
                });
            }
        } catch (e) {
            console.error("Error in global error handler:", e);
        }
    });
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));