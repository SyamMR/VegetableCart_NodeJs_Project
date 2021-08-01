var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var adminHelpers = require('../helpers/admin-helpers')
const verifyLogin = (req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}

/* GET users listing. */
router.get('/', verifyLogin, function (req, res, next) {
  let admin = req.session.admin
  console.log(admin);
  productHelpers.getAllProducts().then((products) => {
    console.log(products);
    res.render('admin/view-products', { admin: true, products, admin,title:'Admin-Products' })
  })
});
router.get('/login', (req, res) => {
  if (req.session.admin) {
    res.redirect('/admin')
  } else {
    res.render('admin/login', { "loginErr": req.session.adminLoginErr, admin: true,title:'Admin-Login' })
    req.session.adminLoginErr = false
  }
})
router.get('/signup', (req, res) => {
  res.render('admin/signup', { admin: true,title:'Admin-Signup' })
})
router.post('/signup', (req, res) => {
  adminHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.admin = response
    req.session.admin.loggedIn = true
    res.redirect('/admin')
  })
})
router.post('/login', (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin
      req.session.admin.loggedIn = true
      res.redirect('/admin')
    } else {
      req.session.adminLoginErr = "Invalid adminname or password"
      res.redirect('/admin/login')
    }
  })
})
router.get('/logout', (req, res) => {
  req.session.admin = null
  res.redirect('/admin')
})
router.get('/add-product', verifyLogin, function (req, res) {
  let admin = req.session.admin
  res.render('admin/add-product', { admin: true, admin,title:'Add-Products' })
})
router.post('/add-product', (req, res) => {
  productHelpers.addProduct(req.body, (id) => {
    let admin = req.session.admin
    let image = req.files.Image
    console.log(id);
    image.mv('./public/product-images/' + id + '.jpg', (err) => {
      if (!err) {
        res.render("admin/add-product", { admin: true, admin })
      } else {
        console.log(err);
      }
    })
  })
})
router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin')
  })
})
router.get('/edit-product/:id', async (req, res) => {
  let admin = req.session.admin
  let product = await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product', { product, admin: true, admin ,title:'Edit-Product'})
})
router.post('/edit-product/:id', verifyLogin, (req, res) => {
  console.log(req.params.id);
  let id = req.params.id
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/product-images/' + id + '.jpg')
    }
  })
})
module.exports = router;
