const Product = require('../models/product');
const Cart = require('../models/cart');
const e = require('express');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    req.user.createProduct({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description
    }).then(result => {
        console.log(result);
        res.redirect('/admin/products');
    })
        .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        res.redirect('/')
    }
    const prodId = req.params.productId;
    req.user.getProducts({ where: { id: prodId }})
    // Product.findByPk(prodId)
        .then(products => {
            const product = products[0]
            if (!product) {
                res.redirect('/')
            }
            res.render('admin/edit-product', {
                product: product,
                pageTitle: 'Add Product',
                path: '/admin/edit-product',
                editing: editMode
            });
        })
        .catch(err => console.log(err));
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDesc = req.body.description;
    Product.update(
        {
            title: updatedTitle,
            imageUrl: updatedImageUrl,
            description: updatedDesc,
            price: updatedPrice
        },
        {
            where: {
                id: prodId
            }
        }).then(
            res.redirect('/admin/products')
        ).catch(err => console.log(err));
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.destroy({
        where: {
            id: prodId
        }
    }).then(
        res.redirect('/admin/products')
    ).catch(err => console.log(err));
}

exports.getProducts = (req, res, next) => {
    req.user.getProducts()
        .then(result => {
            res.render('admin/products', {
                prods: result,
                pageTitle: 'Admin Product',
                path: '/admin/products',
                hasProducts: result.length > 0,
                activeShop: true,
                productCSS: true
            });
        })
        .catch(err => {
            console.log(err);
        })
}