const { validationResult } = require('express-validator');

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
    const errors = validationResult(req);
    if (!errors) {
        return res.status(422).render('admin/edit-product', {
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description
            },
            pageTitle: 'Add Product',
            path: '/admin/add-product',
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
        .catch(err => {
            // return res.status(500).render('admin/edit-product', { // 500: server-side issue occurs
            //     product: {
            //         title: title,
            //         imageUrl: imageUrl,
            //         price: price,
            //         description: description
            //     },
            //     pageTitle: 'Add Product',
            //     path: '/admin/add-product',
            //     editing: false,
            //     hasError: true,
            //     errorMessage: 'Database operation failed, please try again.'
            // });

            // res.redirect('/500'); // render this page for bigger issue.

            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error); //  return next with error, skip all other middlewares and move error handling middleware
        });

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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDesc = req.body.description;

    const errors = validationResult(req);
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
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.deleteOne({ _id: prodId, userId: req.user._id }) // only deleted by the user who created this product
        .then(() => {
            res.status(200).json({message: 'Success!'});
        })
        .catch(err => {
            res.status(500).json({message: 'Deleteing product failed!'});
        });
}

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id }) // show admin products that is only created by this user
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
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}