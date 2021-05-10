const telegramApi = require('node-telegram-bot-api')
const { gameOptions, againOptions } = require('./options')
const sequelize = require('./db')
const UserModel = require('./models')
const token = '1864964603:AAE_7xRttf4PqAFTKp74-WJqZWIcqQgKhu4'
const bot = new telegramApi(token, { polling: true })

const chats = {}



const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен её угадать!`)
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendSticker(chatId, `https://tlgrm.eu/_/stickers/385/a4b/385a4bf5-3feb-3008-be6e-1074767a1f3d/192/1.webp`)
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()

    } catch (e) {
        console.log('Подключение к дб', e)
    }
    bot.setMyCommands([
        { command: '/start', description: 'Начало работы' },
        { command: '/info', description: 'Получить информацию о пользователе' },
        { command: '/game', description: 'Сыграть в игру "Угадай цифру"' }
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (text === '/start') {
                await UserModel.create({ chatId })
                await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/385/a4b/385a4bf5-3feb-3008-be6e-1074767a1f3d/11.webp')
                return bot.sendMessage(chatId, `Добро пожаловать в мой первый телеграм бот`)
            }
            if (text === '/info') {
                const user = await UserModel.findOne({ chatId })
                return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}, в игре у тебя правильных ответов: ${user.right} и неправильных ответов: ${user.wrong}  `)
            }
            if (text === '/game') {
                return startGame(chatId)
            }
            await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/385/a4b/385a4bf5-3feb-3008-be6e-1074767a1f3d/12.webp')
            return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй ещё раз!')

        } catch (e) {
            return bot.sendMessage(chatId, 'Произошла какая то ошибка')

        }

    })
    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again') {
            return startGame(chatId);
        }
        const user = await UserModel.findOne({ chatId })
        if (data == chats[chatId]) {
            user.right += 1;
            await bot.sendSticker(chatId, `https://tlgrm.eu/_/stickers/385/a4b/385a4bf5-3feb-3008-be6e-1074767a1f3d/192/9.webp`, againOptions)
            await bot.sendMessage(chatId, `Поздравляю! Ты угадал! Это была цифра ${chats[chatId]}`)
        } else {
            user.wrong += 1;
            await bot.sendSticker(chatId, `https://tlgrm.eu/_/stickers/385/a4b/385a4bf5-3feb-3008-be6e-1074767a1f3d/192/7.webp`, againOptions)
            await bot.sendMessage(chatId, `Ты не угадал, я загадал цифру ${chats[chatId]}`)
        }
        await user.save();
    })
}

start()