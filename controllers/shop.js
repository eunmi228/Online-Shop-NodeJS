const Product = require('../models/product');
const Cart = require('../models/cart');
const e = require('express');

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(result => {
      res.render('shop/index', {
        prods: result,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(result => {
      res.render('shop/product-list', {
        prods: result,
        pageTitle: 'Shop',
        path: '/products',
        hasProducts: result.length > 0,
        activeShop: true,
        productCSS: true
      });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
}

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(cart => {
      return cart.getProducts()
        .then(products => {
          res.render('shop/cart', {
            pageTitle: 'Your Cart',
            path: '/cart',
            products: products
          });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let newQuantity = 1;
  let fetchedCart;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        const oldQuantity = product.cartitem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId)
    })
    .then(product => {
      return fetchedCart
        .addProduct(product, {
          through: { quantity: newQuantity }
        });
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
}

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } })
    })
    .then(products => {
      const product = products[0];
      const oldQuantity = product.cartitem.quantity;
      if (oldQuantity === 1) {
        return product.cartitem.destroy();
      }
      else {
        return fetchedCart.addProduct(product, { through: { quantity: oldQuantity - 1 } });
      }
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
}

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      return req.user.createOrder()
        .then(order => {
          order.addProducts(products.map(product => {
            product.orderitem = { quantity: product.cartitem.quantity }; // cartitem은 왜 원래도 있었고 얘는 없었나?
            return product;
          }));
        })
        .catch(err => console.log(err));
    })
    .then(() => {
      return fetchedCart.setProducts(null);
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));

}

exports.getOrders = (req, res, next) => {
  req.user.getOrders({include: ['products']}) // when fetch orders -> 
                                              // fetch also products that are related to the order
  .then(orders => {
    res.render('shop/orders', {
      pageTitle: 'Your Orders',
      path: '/orders',
      orders: orders
    });
  })
  .catch(err => console.log(err));
  
  
};
