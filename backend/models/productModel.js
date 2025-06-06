import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    category: { type: String, required: true },
    popular: { type: Boolean, default: false }
  }, { timestamps: true });
  
  const productModel = mongoose.models.product || mongoose.model("product",productSchema);              

  export default productModel;
