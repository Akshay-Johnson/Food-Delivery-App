import Customer from "../models/customerModel.js";
import DeliveryAgent from "../models/deliveryAgentModel.js";
import Restaurant from "../models/restaurantModel.js";
import Admin from "../models/adminModel.js";

export const emailExistsAnywhere = async (email) => {
  const [customer, agent, restaurant, admin] = await Promise.all([
    Customer.findOne({ email }),
    DeliveryAgent.findOne({ email }),
    Restaurant.findOne({ email }),
    Admin.findOne({ email }),
  ]);

  return !!(customer || agent || restaurant || admin);
};
