const { validationResult } = require('express-validator/check');

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(Req);
    if (!errors) {
        return res.status(422).render('admin/edit-product', {
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description
            },
            pageTitle: 'Add Product',
            path: '/admin/edit-product',
            editing: false,
            hasError: true,
            errorMessage: errors.array()[0].msg
        });
    }
    const product = new Product({ 
        title: title, 
        price: price, 
        description: description, 
        imageUrl: imageUrl,
        userId: req.user
    });
    product
        .save()
        .then(result => {
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
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                res.redirect('/')
            }
            res.render('admin/edit-product', {
                product: product,
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                hasError: false,
                errorMessage: null
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
    
    const errors = validationResult(Req);
    if (!errors) {
        return res.status(422).render('admin/edit-product', {
            product: {
                title: updatedTitle,
                imageUrl: updatedImageUrl,
                price: updatedPrice,
                description: updatedDesc,
                _id: prodId
            },
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            errorMessage: errors.array()[0].msg
        });
    }

    Product.findById(prodId)
    .then(product => {
        if (product.userId.toString() !== req.user._id.toString()) { // only updated by the user who created this product
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.imageUrl = updatedImageUrl;
        product.price = updatedPrice;
        product.description = updatedDesc;
        return product.save()
        .then(res.redirect('/admin/products'));
    }).catch(err => console.log(err));
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteOne({_id: prodId, userId: req.user._id}) // only deleted by the user who created this product
        .then(
            res.redirect('/admin/products')
        ).catch(err => console.log(err));
}

exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id}) // show admin products that is only created by this user
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Product',
                path: '/admin/products',
                hasProducts: products.length > 0,
                activeShop: true,
                productCSS: true
            });
        })
        .catch(err => {
            console.log(err);
        })
}