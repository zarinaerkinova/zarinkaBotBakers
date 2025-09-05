require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const mongoose = require("mongoose");
const User = require("./models/User");
const Order = require("./models/Order");
const fs = require('fs');
const path = require('path');

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
        send_images_first: "📷 Avval buyurtma uchun rasmlarni yuboring:",
        skip_images: "📷 Rasmlarni o'tkazib yuborish",
        image_received: "✅ Rasm qabul qilindi.",
        image_error: "❌ Rasmni qayta ishlashda xatolik",
        finish_order: "✅ Buyurtmani tugatish",
        notes_prompt: "💬 Maxsus ko'rsatmalarni kiriting:",
        skip_notes: "⏭️ Ko'rsatmalarni o'tkazib yuborish",
        no_notes: "📝 Ko'rsatmalarsiz davom etish",
        caption_added: "✅ Rasmga izoh qo'shildi",
        caption_skipped: "⏭️ Rasmga izoh qo'shilmadi",
        add_more_images: "➕ Boshqa rasm qo'shish",
        send_images_or_skip: "📷 Rasmlarni yuboring yoki o'tkazib yuboring:",
        delivery_option: "🚚 Yetkazib berish yoki olib ketishni tanlang:",
        pickup: "🏠 Olib ketish",
        delivery: "🚚 Yetkazib berish",
        address_prompt: "📍 Yetkazib berish manzilini kiriting:",
        price_prompt: "💰 Mahsulot narxini kiriting:",
        cake_size_prompt: "🎂 Tort o'lchamini tanlang:",
        size_12: "12 bo'lak",
        size_8: "8 bo'lak",
        choose_date_from_calendar: "📅 Iltimos, sanani kalendardan tanlang 👆"
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
        must_be_in_progress: "❌ Заказ должен быть в процессе. Текульный статус: ",
        something_wrong: "⚠️ Что-то пошло не так. Пожалуйста, попробуйте еще раз.",
        registration_failed: "⚠️ Регистрация не удалась, пожалуйста, попробуйте еще раз.",
        logout_success: "🚪 Вы вышли из системы. Ваша учетная запись все еще зарегистрирована.",
        not_registered_yet: "⚡ Вы еще не зарегистрированы.",
        logout_error: "Что-то пошло не так, попробуйте позже.",
        months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        prev_month: '⬅️ Предыдущий',
        today: 'Сегодня',
        next_month: 'Следующий ➡️',
        send_images_first: "📷 Сначала отправьте фото для заказа:",
        skip_images: "📷 Пропустить добавление фото",
        image_received: "✅ Фото получено.",
        image_error: "❌ Ошибка при обработке фото",
        finish_order: "✅ Завершить заказ",
        notes_prompt: "💬 Введите специальные инструкции:",
        skip_notes: "⏭️ Пропустить инструкции",
        no_notes: "📝 Продолжить без инструкций",
        caption_added: "✅ Подпись добавлена к фото",
        caption_skipped: "⏭️ Подпись не добавлена",
        add_more_images: "➕ Добавить еще фото",
        send_images_or_skip: "📷 Отправьте фото или пропустите:",
        delivery_option: "🚚 Выберите доставку или самовывоз:",
        pickup: "🏠 Самовывоз",
        delivery: "🚚 Доставка",
        address_prompt: "📍 Введите адрес доставки:",
        price_prompt: "💰 Введите цену продукта:",
        cake_size_prompt: "🎂 Выберите размер торта:",
        size_12: "12 кусочков",
        size_8: "8 кусочков",
        choose_date_from_calendar: "📅 Пожалуйста, выберите дату через календарь 👆"
    }
};

// In-memory sessions
const sessions = {};
const regSessions = {};
const userLanguages = {};
const loggedOutUsers = {};
const rejectedMediaGroups = new Set();

// Helper functions
async function isUserRegistered(userId) {
    if (loggedOutUsers[userId]) return false;
    try {
        const user = await User.findOne({ telegramId: String(userId) });
        return !!user;
    } catch (err) {
        console.error("❌ Error checking user registration:", err.message);
        return false;
    }
}

async function getUserLanguage(userId) {
    return userLanguages[userId] || 'uzbek';
}

async function setCommandsForUser(ctx, role) {
    try {
        const lang = await getUserLanguage(ctx.from.id);

        if (role === "admin") {
            await ctx.telegram.setMyCommands([
                { command: "neworder", description: lang === 'uzbek' ? "Yangi buyurtma qo'shish" : "Добавить новый заказ" },
                { command: "orders", description: lang === 'uzbek' ? "Barcha buyurtmalarni ko'rish" : "Просмотреть все заказы" },
                { command: "bakers", description: lang === 'uzbek' ? "Barcha Qandolatchilarni ro'yxati" : "Список всех пекарей" },
                { command: "language", description: lang === 'uzbek' ? "Tilni o'zgartirish" : "Изменить язык" },
                { command: "logout", description: lang === 'uzbek' ? "Chiqish" : "Выйти" },
            ], { scope: { type: "chat", chat_id: ctx.chat.id } });
        } else if (role === "baker") {
            await ctx.telegram.setMyCommands([
                { command: "orders", description: lang === 'uzbek' ? "Menga topshirilgan buyurtmalar" : "Просмотреть мои заказы" },
                { command: "language", description: lang === 'uzbek' ? "Tilni o'zgartirish" : "Изменить язык" },
                { command: "logout", description: lang === 'uzbek' ? "Chiqish" : "Выйти" },
            ], { scope: { type: "chat", chat_id: ctx.chat.id } });
        } else {
            await ctx.telegram.setMyCommands([
                { command: "register", description: lang === 'uzbek' ? "Admin yoki Qandolatchi sifatida ro'yxatdan o'tish" : "Зарегистрироваться как Админ или Пекарь" },
                { command: "language", description: lang === 'uzbek' ? "Tilni o'zgartirish" : "Изменить язык" }
            ], { scope: { type: "chat", chat_id: ctx.chat.id } });
        }
    } catch (err) {
        console.error("❌ Error setting commands:", err.message);
    }
}

// Calendar Helper Functions
function generateCalendar(date, userId) {
    const lang = userLanguages[userId] || 'uzbek';
    const t = translations[lang];

    const startDay = startOfWeek(startOfMonth(date));
    const endDay = endOfWeek(endOfMonth(date));

    let calendar = [];
    let row = [];
    let day = startDay;

    // Add month and year header
    const monthName = t.months[date.getMonth()];
    const year = date.getFullYear();

    calendar.push([Markup.button.callback(`${monthName} ${year}`, 'noop')]);

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

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected");
        setupBotHandlers();
        bot.launch();
        console.log("🤖 Zarinka Bot running...");
    })
    .catch((err) => console.log("❌ MongoDB connection error:", err));

function setupBotHandlers() {
    // Start command
    bot.start(async (ctx) => {
        try {
            const isRegistered = await isUserRegistered(ctx.from.id);
            const lang = await getUserLanguage(ctx.from.id);

            if (isRegistered) {
                const user = await User.findOne({ telegramId: String(ctx.from.id) });
                const t = translations[lang];
                await ctx.reply(`${t.welcome_back}${user.firstName} ${user.lastName}!${t.logged_in_as}${user.role}${t.role}`);
                await setCommandsForUser(ctx, user.role);
            } else {
                await ctx.reply(
                    "👋 Welcome! / Xush kelibsiz! / Добро пожаловать!\n\n🇺🇿 Iltimos, tilni tanlang:\n🇷🇺 Пожалуйста, выберите язык:",
                    Markup.inlineKeyboard([
                        [Markup.button.callback("🇺🇿 O'zbek tili", "set_lang_uzbek")],
                        [Markup.button.callback("🇷🇺 Русский язык", "set_lang_russian")]
                    ])
                );
            }
        } catch (err) {
            console.error("❌ Start command error:", err.message);
            await ctx.reply("⚠️ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
        }
    });

    // Language command
    bot.command("language", async (ctx) => {
        try {
            const lang = await getUserLanguage(ctx.from.id);
            await ctx.reply(
                lang === 'uzbek' ? "🌐 Tilni o'zgartirish:" : "🌐 Изменить язык:",
                Markup.inlineKeyboard([
                    [Markup.button.callback("🇺🇿 O'zbek tili", "change_lang_uzbek")],
                    [Markup.button.callback("🇷🇺 Русский язык", "change_lang_russian")]
                ])
            );
        } catch (err) {
            console.error("❌ Language command error:", err.message);
            const lang = await getUserLanguage(ctx.from.id);
            await ctx.reply(translations[lang].something_wrong);
        }
    });

    // Register command
    bot.command("register", async (ctx) => {
        try {
            const lang = await getUserLanguage(ctx.from.id);
            const t = translations[lang];

            regSessions[ctx.from.id] = { step: "choose_role" };
            await ctx.reply(
                t.who_are_you,
                Markup.inlineKeyboard([
                    [Markup.button.callback(t.admin, "role_admin")],
                    [Markup.button.callback(t.baker, "role_baker")]
                ])
            );
        } catch (err) {
            console.error("❌ Register command error:", err.message);
            const lang = await getUserLanguage(ctx.from.id);
            await ctx.reply(translations[lang].registration_failed);
        }
    });

    // Neworder command
    bot.command("neworder", async (ctx) => {
        try {
            const lang = await getUserLanguage(ctx.from.id);
            const t = translations[lang];
            const user = await User.findOne({ telegramId: String(ctx.from.id) });

            if (!user || user.role !== "admin") return ctx.reply(t.only_admins);

            sessions[ctx.from.id] = { step: 1, data: {} };
            await ctx.reply(t.customer_name);
        } catch (err) {
            console.error("❌ Neworder command error:", err.message);
            const lang = await getUserLanguage(ctx.from.id);
            await ctx.reply(translations[lang].something_wrong);
        }
    });

    // Orders command
    bot.command("orders", async (ctx) => {
        try {
            const lang = await getUserLanguage(ctx.from.id);
            const t = translations[lang];
            const user = await User.findOne({ telegramId: String(ctx.from.id) });

            if (!user) return ctx.reply(t.not_registered);

            if (user.role === "admin") {
                const orders = await Order.find().populate('assignedBaker', 'firstName lastName');
                if (!orders.length) return ctx.reply(t.no_orders);

                let message = t.all_orders;
                orders.forEach((order, index) => {
                    const bakerName = order.assignedBaker ?
                        `${order.assignedBaker.firstName} ${order.assignedBaker.lastName}` :
                        t.no_assignment;

                    message += `🆔 ${lang === 'uzbek' ? 'Buyurtma' : 'Заказ'} ${index + 1}\n`;
                    message += `👤 ${lang === 'uzbek' ? 'Mijoz' : 'Клиент'}: ${order.customerName}\n`;
                    message += `📦 ${lang === 'uzbek' ? 'Mahsulot' : 'Продукт'}: ${order.productName}\n`;
                    message += `🔢 ${lang === 'uzbek' ? 'Miqdor' : 'Количество'}: ${order.quantity}\n`;
                    message += `👨‍🍳 ${lang === 'uzbek' ? 'Qandolatchi' : 'Пекарь'}: ${bakerName}\n`;
                    message += `${t.delivery}${order.deliveryDate}\n`;
                    message += `${t.status}${order.status}\n`;
                    message += `────────────────────\n`;
                });

                return ctx.reply(message);
            } else if (user.role === "baker") {
                const orders = await Order.find({ assignedBaker: user._id }).populate('assignedBaker', 'firstName lastName');
                if (!orders.length) return ctx.reply(t.no_orders);

                for (const order of orders) {
                    let message = `${t.order}${order.customerName}\n`;
                    message += `${t.product}${order.productName}\n`;
                    message += `🔢 ${lang === 'uzbek' ? 'Miqdori' : 'Количество'}: ${order.quantity}\n`;
                    message += `${t.delivery}${order.deliveryDate}\n`;
                    message += `${t.status}${order.status}\n`;

                    let buttons = [];
                    if (order.status === 'pending') {
                        buttons = [
                            [Markup.button.callback(t.accept, `accept_${order._id}`),
                            Markup.button.callback(t.reject, `reject_${order._id}`)]
                        ];
                    } else if (order.status === 'accepted') {
                        buttons = [
                            [Markup.button.callback(t.in_progress, `progress_${order._id}`),
                            Markup.button.callback(t.complete, `complete_${order._id}`)]
                        ];
                    } else if (order.status === 'in_progress') {
                        buttons = [
                            [Markup.button.callback(t.complete, `complete_${order._id}`)]
                        ];
                    }

                    await ctx.reply(message, Markup.inlineKeyboard(buttons));
                }
            }
        } catch (err) {
            console.error("❌ Orders command error:", err.message);
            const lang = await getUserLanguage(ctx.from.id);
            await ctx.reply(translations[lang].something_wrong);
        }
    });

    // Bakers command
    bot.command("bakers", async (ctx) => {
        try {
            const lang = await getUserLanguage(ctx.from.id);
            const t = translations[lang];
            const user = await User.findOne({ telegramId: String(ctx.from.id) });

            if (!user || user.role !== "admin") return ctx.reply(t.only_admins);

            const bakers = await User.find({ role: "baker" });
            if (!bakers.length) return ctx.reply(t.no_bakers);

            let message = t.bakers_list;
            bakers.forEach((b, i) => {
                message += `${i + 1}. ${b.firstName} ${b.lastName} 📞 ${b.phone}\n`;
            });

            return ctx.reply(message);
        } catch (err) {
            console.error("❌ Bakers command error:", err.message);
            const lang = await getUserLanguage(ctx.from.id);
            await ctx.reply(translations[lang].something_wrong);
        }
    });

    // Logout command
    bot.command("logout", async (ctx) => {
        try {
            const lang = await getUserLanguage(ctx.from.id);
            const t = translations[lang];
            const user = await User.findOne({ telegramId: String(ctx.from.id) });

            if (!user) return ctx.reply(t.not_registered_yet);

            loggedOutUsers[ctx.from.id] = true;
            delete regSessions[ctx.from.id];
            delete sessions[ctx.from.id];
            await setCommandsForUser(ctx, null);

            await ctx.reply(t.logout_success);
        } catch (err) {
            console.error("❌ Logout error:", err.message);
            const lang = await getUserLanguage(ctx.from.id);
            await ctx.reply(translations[lang].logout_error);
        }
    });

    // Language change handlers
    bot.action(/change_lang_(.+)/, async (ctx) => {
        try {
            const lang = ctx.match[1];
            userLanguages[ctx.from.id] = lang;
            const t = translations[lang];

            await ctx.answerCbQuery();
            await ctx.editMessageText(
                lang === 'uzbek' ? "✅ Til muvaffaqiyatli o'zgartirildi" : "✅ Язык успешно изменен"
            );
        } catch (err) {
            console.error("❌ Language change error:", err.message);
            await ctx.answerCbQuery("⚠️ Xatolik yuz berdi / Произошла ошибка");
        }
    });

    bot.action(/set_lang_(.+)/, async (ctx) => {
        try {
            const lang = ctx.match[1];
            userLanguages[ctx.from.id] = lang;
            const t = translations[lang];

            await ctx.answerCbQuery();
            await ctx.editMessageText(t.welcome);
        } catch (err) {
            console.error("❌ Language selection error:", err.message);
            await ctx.answerCbQuery("⚠️ Something went wrong");
        }
    });

    bot.action(/role_(.+)/, async (ctx) => {
        try {
            const role = ctx.match[1];
            const lang = await getUserLanguage(ctx.from.id);
            const t = translations[lang];

            regSessions[ctx.from.id] = { step: "phone", role };
            await ctx.reply(
                t.phone_prompt,
                Markup.keyboard([[Markup.button.contactRequest(t.share_phone)]])
                    .oneTime()
                    .resize()
            );
            await ctx.answerCbQuery();
        } catch (err) {
            console.error("❌ Role selection error:", err.message);
            await ctx.answerCbQuery("⚠️ Something went wrong");
        }
    });

    bot.on("contact", async (ctx) => {
        try {
            const lang = await getUserLanguage(ctx.from.id);
            const t = translations[lang];
            const session = regSessions[ctx.from.id];

            if (!session || session.step !== "phone") return;

            const phone = ctx.message.contact.phone_number;
            const existingUser = await User.findOne({ phone });

            if (existingUser) {
                const userT = translations[await getUserLanguage(ctx.from.id)];
                await ctx.reply(`${userT.welcome_back}${existingUser.firstName} ${existingUser.lastName}!${userT.logged_in_as}${existingUser.role}${userT.role}`);
                existingUser.telegramId = String(ctx.from.id);
                await existingUser.save();
                await setCommandsForUser(ctx, existingUser.role);
                delete regSessions[ctx.from.id];
                await ctx.reply(userT.login_successful, Markup.removeKeyboard());
                return;
            }

            session.phone = phone;
            session.step = "first_name";
            await ctx.reply(t.registration_started, Markup.removeKeyboard());
            await ctx.reply(t.first_name_prompt);
        } catch (err) {
            console.error("❌ Registration error:", err.message);
            const lang = await getUserLanguage(ctx.from.id);
            await ctx.reply(translations[lang].registration_failed);
        }
    });

    bot.on("text", async (ctx) => {
        const text = ctx.message.text;
        if (text.startsWith('/')) return;

        try {
            const lang = await getUserLanguage(ctx.from.id);
            const t = translations[lang];

            // Check if it's the contact share button text
            if (text.includes("Share Phone") || text.includes("📱")) {
                console.log("Ignoring contact share button text");
                return;
            }

            // Check registration session first
            const regSession = regSessions[ctx.from.id];
            if (regSession) {
                await handleRegistrationText(ctx, text, regSession, t);
                return;
            }

            // Check order session
            const orderSession = sessions[ctx.from.id];
            if (orderSession && orderSession.step) {
                // Handle notes input (step 10)
                if (orderSession.step === 10) {
                    orderSession.data.specialInstructions = text;
                    await createOrder(ctx, orderSession);
                    return;
                }

                // Handle other order steps
                await handleOrderText(ctx, text, orderSession, t, lang);
                return;
            }

            console.log("No active sessions found, ignoring text");

        } catch (err) {
            console.error("❌ Text handler error:", err.message);
            const lang = await getUserLanguage(ctx.from.id);
            await ctx.reply(translations[lang].something_wrong);
        }
    });

    async function handleRegistrationText(ctx, text, regSession, t) {
        switch (regSession.step) {
            case "phone":
                // Reject text input for phone number and show button again
                await ctx.reply(
                    "❌ Iltimos, telefon raqamingizni tugma orqali ulashing / Пожалуйста, поделитесь номером телефона с помощью кнопки",
                    Markup.keyboard([[Markup.button.contactRequest(t.share_phone)]])
                        .oneTime()
                        .resize()
                );
                break;

            case "first_name":
                regSession.firstName = text;
                regSession.step = "last_name";
                await ctx.reply(t.last_name_prompt);
                break;

            case "last_name":
                regSession.lastName = text;
                const newUser = new User({
                    telegramId: String(ctx.from.id),
                    role: regSession.role,
                    firstName: regSession.firstName,
                    lastName: regSession.lastName,
                    phone: regSession.phone
                });

                await newUser.save();
                await ctx.reply(`✅ ${regSession.role}${t.registered}${regSession.firstName} ${regSession.lastName}.`);
                await setCommandsForUser(ctx, regSession.role);
                delete regSessions[ctx.from.id];
                break;
        }
    }

    async function handleOrderText(ctx, text, orderSession, t, lang) {
        switch (orderSession.step) {
            case 1: // Customer name
                orderSession.data.customerName = text;
                orderSession.step = 2;
                await ctx.reply(t.product_name);
                break;

            case 2: // Product name
                orderSession.data.productName = text;
                orderSession.step = 3;
                await ctx.reply(t.quantity);
                break;

            case 3: // Quantity
                if (isNaN(text) || parseInt(text) <= 0) {
                    await ctx.reply(t.valid_quantity);
                    return;
                }
                orderSession.data.quantity = parseInt(text);
                orderSession.step = 4;
                await ctx.reply(
                    t.cake_size_prompt,
                    Markup.inlineKeyboard([
                        [Markup.button.callback(t.size_12, "cake_size_12")],
                        [Markup.button.callback(t.size_8, "cake_size_8")]
                    ])
                );
                break;

            case 5: // Price (after cake size selection)
                if (isNaN(text) || parseInt(text) <= 0) {
                    await ctx.reply(lang === 'uzbek'
                        ? "❌ Iltimos, narx uchun haqiqiy raqam kiriting:"
                        : "❌ Пожалуйста, введите действительное число для цены:");
                    return;
                }
                orderSession.data.price = parseInt(text);
                orderSession.step = 6;
                await ctx.reply(
                    t.delivery_option,
                    Markup.inlineKeyboard([
                        [Markup.button.callback(t.delivery, "delivery_type_delivery")],
                        [Markup.button.callback(t.pickup, "delivery_type_pickup")]
                    ])
                );
                break;

            case 7: // Address for delivery
                orderSession.data.address = text;
                orderSession.step = 8;
                orderSession.calendarDate = new Date();
                await ctx.reply(t.select_date, generateCalendar(orderSession.calendarDate, ctx.from.id));
                break;

            case 10: // Special instructions (notes)
                orderSession.data.specialInstructions = text;
                await createOrder(ctx, orderSession);
                break;

            default:
                // Handle cases where user sends text during calendar or other non-text steps
                if (orderSession.step === 8 || orderSession.step === 9) {
                    await ctx.reply(
                        t.choose_date_from_calendar
                    );
                }
                break;
        }
    }

    bot.on(['photo', 'document'], async (ctx) => {
        try {
            const orderSession = sessions[ctx.from.id];
            if (!orderSession || orderSession.step !== 9) {
                return;
            }

            const lang = await getUserLanguage(ctx.from.id);
            const t = translations[lang];

            // Reject albums (multiple images)
            if (ctx.message.media_group_id) {
                if (rejectedMediaGroups.has(ctx.message.media_group_id)) {
                    return;
                }
                rejectedMediaGroups.add(ctx.message.media_group_id);
                return ctx.reply(lang === "uzbek"
                    ? "Faqat bitta rasm yuborishingiz mumkin ❗️ Albom yubormang."
                    : "Only one image is allowed ❗️ Do not send albums.");
            }

            let fileId, filename;

            if (ctx.message.photo) {
                const photo = ctx.message.photo[ctx.message.photo.length - 1];
                fileId = photo.file_id;
                filename = `photo_${Date.now()}.jpg`;
            } else if (ctx.message.document && ctx.message.document.mime_type?.startsWith('image/')) {
                fileId = ctx.message.document.file_id;
                filename = ctx.message.document.file_name || `image_${Date.now()}`;
            } else {
                return;
            }

            // Reject if an image already exists in session
            if (orderSession.data.images && orderSession.data.images.length > 0) {
                return ctx.reply(lang === "uzbek"
                    ? "Siz faqat bitta rasm yuborishingiz mumkin ❗️"
                    : "You can only upload one image ❗️");
            }

            // Save the single image
            orderSession.data.images = [{ fileId, filename }];

            // Move to notes step WITH SKIP BUTTON
            orderSession.step = 10;
            await ctx.reply(
                t.notes_prompt,
                Markup.inlineKeyboard([
                    [Markup.button.callback(t.skip_notes, 'skip_notes')]
                ])
            );

        } catch (err) {
            console.error("❌ Image handling error:", err.message);
            const lang = await getUserLanguage(ctx.from.id);
            await ctx.reply(translations[lang].something_wrong);
        }
    });

    bot.action('skip_images', async (ctx) => {
        try {
            const session = sessions[ctx.from.id];
            if (!session || session.step !== 9) {
                await ctx.answerCbQuery("⚠️ Session expired.");
                return;
            }

            const lang = await getUserLanguage(ctx.from.id);
            const t = translations[lang];

            // Skip images and move to notes WITH SKIP BUTTON
            session.step = 10;
            await ctx.deleteMessage();
            await ctx.reply(
                t.notes_prompt,
                Markup.inlineKeyboard([
                    [Markup.button.callback(t.skip_notes, 'skip_notes')]
                ])
            );
            await ctx.answerCbQuery();

        } catch (err) {
            console.error("❌ Skip images error:", err.message);
            const lang = await getUserLanguage(ctx.from.id);
            await ctx.answerCbQuery(translations[lang].something_wrong);
        }
    });

    bot.action('skip_notes', async (ctx) => {
        try {
            const session = sessions[ctx.from.id];
            if (!session || session.step !== 10) {
                await ctx.answerCbQuery("⚠️ Session expired.");
                return;
            }

            const lang = await getUserLanguage(ctx.from.id);
            const t = translations[lang];

            // Skip notes and automatically create order
            await ctx.answerCbQuery();
            await ctx.deleteMessage();
            await createOrder(ctx, session);

        } catch (err) {
            console.error("❌ Skip notes error:", err.message);
            const lang = await getUserLanguage(ctx.from.id);
            await ctx.answerCbQuery(translations[lang].something_wrong);
        }
    });

    bot.action(/cake_size_(.+)/, async (ctx) => {
        try {
            const size = ctx.match[1];
            const lang = await getUserLanguage(ctx.from.id);
            const t = translations[lang];
            const session = sessions[ctx.from.id];

            if (!session || session.step !== 4) return;

            session.data.cakeSize = size === "12" ? t.size_12 : t.size_8;
            session.step = 5; // Now step 5 is for price (after cake size)
            await ctx.deleteMessage();
            await ctx.reply(t.price_prompt); // Ask for price after size selection

        } catch (err) {
            console.error("❌ Cake size error:", err.message);
            await ctx.answerCbQuery("⚠️ Error");
        }
    });

    bot.action(/delivery_type_(.+)/, async (ctx) => {
        try {
            const type = ctx.match[1];
            const lang = await getUserLanguage(ctx.from.id);
            const t = translations[lang];
            const session = sessions[ctx.from.id];

            if (!session || session.step !== 6) return;

            session.data.deliveryType = type;
            if (type === "delivery") {
                session.step = 7;
                await ctx.deleteMessage();
                await ctx.reply(t.address_prompt);
            } else {
                session.data.address = "";
                session.step = 8;
                session.calendarDate = new Date();
                await ctx.deleteMessage();
                await ctx.reply(t.select_date, generateCalendar(session.calendarDate, ctx.from.id));
            }
        } catch (err) {
            console.error("❌ Delivery type error:", err.message);
            await ctx.answerCbQuery("⚠️ Error");
        }
    });

    bot.action(/select_date_(.+)/, async (ctx) => {
        try {
            const dateStr = ctx.match[1];
            const lang = await getUserLanguage(ctx.from.id);
            const t = translations[lang];
            const session = sessions[ctx.from.id];

            if (!session || session.step !== 8) {
                await ctx.answerCbQuery(t.something_wrong);
                return;
            }

            let selectedDate = dateStr === 'today' ? new Date() : new Date(dateStr);
            session.data.deliveryDate = format(selectedDate, 'yyyy-MM-dd');
            session.step = 9; // Step 9 for images

            await ctx.answerCbQuery(`${lang === 'uzbek' ? 'Tanlandi' : 'Выбрано'}: ${format(selectedDate, 'MMM dd, yyyy')}`);
            await ctx.deleteMessage();

            // Ask for images with skip button
            await ctx.reply(
                t.send_images_first,
                Markup.inlineKeyboard([
                    [Markup.button.callback(t.skip_images, 'skip_images')]
                ])
            );
        } catch (err) {
            console.error("❌ Date selection error:", err.message);
            await ctx.answerCbQuery("⚠️ Error");
        }
    });

    bot.action(['prev_month', 'next_month'], async (ctx) => {
        try {
            const session = sessions[ctx.from.id];
            if (!session || session.step !== 8) {
                await ctx.answerCbQuery("⚠️ Session expired");
                return;
            }

            session.calendarDate = addMonths(session.calendarDate, ctx.match[0] === 'prev_month' ? -1 : 1);
            await ctx.answerCbQuery();
            await ctx.editMessageText(
                translations[await getUserLanguage(ctx.from.id)].select_date,
                generateCalendar(session.calendarDate, ctx.from.id)
            );
        } catch (err) {
            console.error("❌ Calendar navigation error:", err.message);
            await ctx.answerCbQuery("⚠️ Error");
        }
    });

    // Helper function to create order
    async function createOrder(ctx, session) {
        try {
            const lang = await getUserLanguage(ctx.from.id);
            const t = translations[lang];

            const order = new Order({
                customerName: session.data.customerName,
                productName: session.data.productName,
                quantity: session.data.quantity,
                cakeSize: session.data.cakeSize,
                price: session.data.price,
                deliveryType: session.data.deliveryType,
                address: session.data.address || '',
                deliveryDate: session.data.deliveryDate,
                assignedBaker: session.data.assignedBaker || null,
                specialInstructions: session.data.specialInstructions || '',
                images: session.data.images || [],
                status: 'pending',
                createdBy: ctx.from.id
            });

            await order.save();
            await ctx.reply(t.order_created);
            delete sessions[ctx.from.id];
        } catch (err) {
            console.error("❌ Order creation error:", err.message);
            const lang = await getUserLanguage(ctx.from.id);
            await ctx.reply(translations[lang].something_wrong);
        }
    }

    // Noop handler
    bot.action('noop', async (ctx) => {
        await ctx.answerCbQuery();
    });

    // Global error handler
    bot.catch((err, ctx) => {
        console.error(`❌ Global error:`, err);
        const lang = getUserLanguage(ctx.from.id);
        ctx.reply(translations[lang].something_wrong).catch(console.error);
    });
}

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));