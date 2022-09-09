//const { OrderModel,
//     ProductModel , UserModel, ServiceModel} = require("@database");
const fs = require("fs");
const products = [];
let product = {};
const services = [];
let service = {};
const orders = [];
let order = {};
const jsonString = fs.readFileSync("./products.json");
const customer = JSON.parse(jsonString);   
 const migrateProduct = async () => {
    try {
        customer.forEach(customer => {
            product = {};
            product.name = customer.name;
            product.currency = '$';
            product.price = parseInt(customer.price);
            product.category = customer.category;
            product.subCategory = customer.category;
            product.quantitySold = 10;
            product.quantityAvailable = 120;
            product.active = false;
            product.customFields = {};
            product.description = customer.description;
            products.push(product);
          });
          await ProductModel.insertMany(products);
          customer.forEach(customer => {
            service = {};
            service.name = customer.name+' - Service';
            service.currency = '$';
            service.price = parseInt(customer.price);
            service.category = customer.category;
            service.subCategory = customer.category;
            service.quantitySold = 10;
            service.quantityAvailable = 120;
            service.active = false;
            service.customFields = {};
            service.description = customer.description;
            services.push(service);
          });
          await ServiceModel.insertMany(services);

          
      } catch (err) {
        console.log(err);
        return;
      }
 }

 async function uploadOrders(dataArray) {
    let user = ((await UserModel.findOne({email: 'admin@gmail.com'})) || {})._id || '';
    try {
        const chunks = chunkArray(dataArray, 10);
        for(const chunk of chunks) {
            order = {};
            order.products = chunk;
            order.status = 'Pending';
            order.orderedBy = "John";
            order.orderedTime = 179678654;
            order.orderedTo = john;
            order.orderedPrice = "500";
            order.transaction = user;
            order.createdAt = "2022-02-14T12:53:14.065Z";
            order.updatedAt = "2022-02-14T12:53:14.065Z";
            orders.push(order);
        }
        uploadOrderChunk(orders); 
    } catch(error) {
        console.log(" error : ",e);
         return true;
    }
  }

  function uploadOrderChunk(orders) {
    await OrderModel.insertMany(orders)
  }

// migrateProduct();
//uploadOrders(products);
//uploadOrders(services);