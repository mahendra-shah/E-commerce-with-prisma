const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const upload = require('../middleware/multer.middleware')
const cloudinary = require('../middleware/cloudinary')
const prisma = new PrismaClient()
const { genToken, verToken } = require("../modules/jwt")

// register
router.get('/register', (req, res) => {
    res.render('register')
})
router.post('/sign', async (req, res) => {
    const { name, email, mobile, password, role } = req.body
    try {
        const user = await prisma.customers.findUnique({
            where: { email }
        })
        if (user == null) {
            const sent = await prisma.customers.create({
                data: { name, email, mobile, password, role }
            })
            return res.send(sent)
        }
        res.send('User already exists')
    } catch (error) {
        res.status({
            status: 500, msg: error.message
        })
    }
})

// login
router.get('/login', (req, res) => {
    res.render('login')
})
router.post('/log', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await prisma.customers.findMany({
            where: { email, password }
        })
        if (user.length !== 0) {
            const token = genToken(user[0])
            res.cookie('userCookie', token)
            return res.redirect('/shiping')
        }
        res.redirect('/register')
    } catch (error) {
        res.status({
            status: 500, msg: error.message
        })
    }
})

// add shipment details
router.get('/shiping', verToken, (req, res) => {
    res.render('shiping')
})
router.post('/ship', verToken, async (req, res) => {
    const { address, country, state, city, pincode } = req.body
    const { id, email } = req.userData
    try {
        const details = await prisma.customers.findMany({ where: { email }, include: { Extradetails: true } })
        if (details[0].Extradetails.length == 0) {
            const fill = await prisma.extradetails.create({
                data: { customerId: id, address, country, state, city, pincode }
            })
            return res.send(fill)
        }
        res.send('extra details already available')
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// manage warehouse
router.get('/add', verToken, (req, res) => {
    res.render('add')
})
router.post('/warehouse', verToken, upload.single('image'), async (req, res) => {
    const { name, description, qty, price } = req.body
    const { id, role } = req.userData
    try {
        if (role == "ADMIN") {
            const img = await cloudinary.uploader.upload(req.file.path)
            const imgUrl = img.secure_url
            console.log(req.body);
            await prisma.products.create({
                data: { adminId: id, name, description, qty: Number(qty), price, imgUrl }
            })
            return res.redirect('/')
        } res.send('You are not allowed to add products')
    } catch (error) {
        res.send(error.message)
    }
})

// payment section
router.get('/pay', verToken, (req, res) => {
    res.render('payment')
})
router.post('/payhere', verToken, async (req, res) => {
    const { method, detail, name } = req.body
    const { id } = req.userData
    const uname = req.userData.name
    try {
        const pay = await prisma.payment.create({
            data: { userID: id, method, detail, name }
        })
        console.log(uname);
        res.render('thanks', { user: uname })
    } catch (error) {
        res.send(error.message)
    }
})

// thankyou page
router.get('/thanks', verToken, (req, res) => {
    res.render('thanks')
})

// read user all data
router.get('/read', verToken, async (req, res) => {
    const { id, role } = req.userData
    try {
        if (role == "ADMIN") {
            const data = await prisma.customers.findMany({ include: { Extradetails: true, payment: true } })
            res.send(data)
        } else {
            const data = await prisma.customers.findMany({ where: { id }, include: { Extradetails: true, payment: true } })
            res.send(data)
        }
    } catch (error) {

    }
})

// render home page
router.get('/', async (req, res) => {
    const data = await prisma.products.findMany()
    let count = 0
    let arr = []
    let arr1 = []
    for (let i of data) {
        if (count == 5) {
            arr.push(arr1)
            arr1 = []
            count = 0
        }
        arr1.push(i)
        count++
    }

    res.render('home', { product: arr })
})

module.exports = router