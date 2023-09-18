const fs = require('fs');
const path = require('path');
const Product = require('./product');
const { json } = require('body-parser');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
);


module.exports = class Cart {
    static addProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            let cart = { products: [], totlaPrice: 0 };
            if (!err) {
                cart = JSON.parse(fileContent);
            }
            const existingProductIndex = cart.products.findIndex(p => p.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;
            if (existingProduct) {
                updatedProduct = { ...existingProduct };
                updatedProduct.qty = updatedProduct.qty + 1;
                // cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            }
            else {
                updatedProduct = { id: id, qty: 1 };
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totlaPrice = cart.totlaPrice + +productPrice;
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            })
        });
    }

    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                return;
            }
            const cart = JSON.parse(fileContent);
            const updatedProduct = { ...cart };
            const product = updatedProduct.products.find(p => p.id === id);
            if (!product) {
                return;
            }
            const productQty = product.qty;
            updatedProduct.products = updatedProduct.products.filter(p => p.id !== id);
            updatedProduct.totlaPrice = updatedProduct.totlaPrice - productPrice * productQty;
            fs.writeFile(p, JSON.stringify(updatedProduct), err => {
                console.log(err);
            })
        });
    }

    static getCart(cb) {
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                cb([]);
            }
            else {
                cb(JSON.parse(fileContent));
            }
        });
    }
}