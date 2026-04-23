require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("❌ MONGODB_URI not set"); process.exit(1); }

const UserSchema = new mongoose.Schema({ name:String, email:String, password:String, role:String, company:String, phone:String, status:{type:String,default:"Active"} }, {timestamps:true});
const CampaignSchema = new mongoose.Schema({ name:String, description:String, status:String, type:String, visibility:{type:String,default:"Public"}, payout:Number, budget:Number, spent:{type:Number,default:0}, geo:String, landingUrl:String, category:String, clicks:{type:Number,default:0}, conversions:{type:Number,default:0}, approvedAffiliates:[mongoose.Schema.Types.ObjectId], createdBy:mongoose.Schema.Types.ObjectId }, {timestamps:true});
const AffiliateSchema = new mongoose.Schema({ name:String, email:String, phone:String, status:String, paymentMethod:String, referralCode:String, clicks:{type:Number,default:0}, conversions:{type:Number,default:0}, totalEarnings:{type:Number,default:0}, pendingPayout:{type:Number,default:0}, createdBy:mongoose.Schema.Types.ObjectId }, {timestamps:true});
const PayoutSchema = new mongoose.Schema({ affiliateId:mongoose.Schema.Types.ObjectId, amount:Number, status:String, method:String, period:String }, {timestamps:true});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Campaign = mongoose.models.Campaign || mongoose.model("Campaign", CampaignSchema);
const Affiliate = mongoose.models.Affiliate || mongoose.model("Affiliate", AffiliateSchema);
const Payout = mongoose.models.Payout || mongoose.model("Payout", PayoutSchema);

function rcode() { return Math.random().toString(36).substring(2,10).toUpperCase(); }

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");
  await Promise.all([User.deleteMany(), Campaign.deleteMany(), Affiliate.deleteMany(), Payout.deleteMany()]);
  console.log("🗑  Cleared data");

  const hash = pw => bcrypt.hash(pw, 12);
  const [admin, advertiser1, advertiser2, aff1, aff2, aff3] = await User.insertMany([
    { name:"Admin User",       email:"admin@truuk.io",        password:await hash("admin123"),        role:"admin",      company:"Truuk",           status:"Active" },
    { name:"FlipMart India",   email:"advertiser@truuk.io",   password:await hash("advertiser123"),   role:"advertiser", company:"FlipMart Pvt Ltd", status:"Active" },
    { name:"StyleHub Brands",  email:"advertiser2@truuk.io",  password:await hash("advertiser123"),   role:"advertiser", company:"StyleHub",         status:"Active" },
    { name:"Rahul Sharma",     email:"affiliate@truuk.io",    password:await hash("affiliate123"),    role:"affiliate",  company:"RahulMedia",       status:"Active" },
    { name:"Priya Mehta",      email:"affiliate2@truuk.io",   password:await hash("affiliate123"),    role:"affiliate",  company:"DigitalPriya",     status:"Active" },
    { name:"New Affiliate",    email:"new@truuk.io",          password:await hash("new123"),          role:"affiliate",  company:"NewMedia",         status:"Pending" },
  ]);
  console.log("👥 6 users created");

  await Campaign.insertMany([
    { name:"Flipkart Summer Sale",   description:"Drive app installs & purchases",   status:"Active", visibility:"Public",            type:"CPA", payout:120, budget:50000, spent:38200, geo:"IN",     category:"eCommerce", clicks:18420, conversions:842,  landingUrl:"https://flipkart.com",     createdBy:advertiser1._id, approvedAffiliates:[aff1._id,aff2._id] },
    { name:"Meesho Fashion Drive",   description:"Fashion category conversions",     status:"Active", visibility:"Approval Required", type:"CPS", payout:80,  budget:30000, spent:21500, geo:"IN",     category:"Fashion",   clicks:9310,  conversions:391,  landingUrl:"https://meesho.com",       createdBy:advertiser1._id, approvedAffiliates:[aff1._id] },
    { name:"PolicyBazaar Insurance", description:"Lead generation for insurance",   status:"Active", visibility:"Approval Required", type:"CPL", payout:200, budget:20000, spent:12000, geo:"IN",     category:"Finance",   clicks:5620,  conversions:188,  landingUrl:"https://policybazaar.com", createdBy:advertiser2._id, approvedAffiliates:[] },
    { name:"Nykaa Beauty Blast",     description:"Beauty product sales",            status:"Active", visibility:"Public",            type:"CPC", payout:15,  budget:25000, spent:19800, geo:"IN,UAE", category:"Beauty",    clicks:32100, conversions:1240, landingUrl:"https://nykaa.com",        createdBy:advertiser2._id, approvedAffiliates:[aff1._id,aff2._id] },
    { name:"Zomato Gold Signup",     description:"Gold membership signups (invite only)", status:"Active", visibility:"Private",   type:"CPA", payout:95,  budget:15000, spent:5000,  geo:"IN",     category:"Food",      clicks:1200,  conversions:52,   landingUrl:"https://zomato.com",       createdBy:advertiser1._id, approvedAffiliates:[aff1._id] },
  ]);
  console.log("📣 5 campaigns created (Public/Approval/Private)");

  await Affiliate.insertMany([
    { name:"Rahul Sharma", email:"rahul@example.com", phone:"+91 9876543210", status:"Active",   paymentMethod:"Bank Transfer", referralCode:rcode(), clicks:12400, conversions:540, totalEarnings:64800, pendingPayout:25000, createdBy:admin._id },
    { name:"Priya Mehta",  email:"priya@example.com", phone:"+91 9823456781", status:"Active",   paymentMethod:"UPI",           referralCode:rcode(), clicks:8200,  conversions:310, totalEarnings:37200, pendingPayout:12000, createdBy:admin._id },
    { name:"Amit Verma",   email:"amit@example.com",  phone:"+91 9912345670", status:"Inactive", paymentMethod:"PayPal",        referralCode:rcode(), clicks:3100,  conversions:98,  totalEarnings:11760, pendingPayout:0,     createdBy:admin._id },
  ]);
  console.log("👥 3 affiliates seeded");

  await Payout.insertMany([
    { affiliateId:aff1._id, amount:25000, status:"Pending",    method:"Bank Transfer", period:"April 2024" },
    { affiliateId:aff2._id, amount:12000, status:"Pending",    method:"UPI",           period:"April 2024" },
    { affiliateId:aff3._id, amount:11760, status:"Paid",       method:"PayPal",        period:"March 2024" },
  ]);
  console.log("💸 Payouts seeded");

  console.log("\n✅ SEED COMPLETE!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔑 LOGIN CREDENTIALS:");
  console.log("  👑 Admin       → admin@truuk.io         | admin123");
  console.log("  📢 Advertiser1 → advertiser@truuk.io    | advertiser123");
  console.log("  📢 Advertiser2 → advertiser2@truuk.io   | advertiser123");
  console.log("  👤 Affiliate1  → affiliate@truuk.io     | affiliate123");
  console.log("  👤 Affiliate2  → affiliate2@truuk.io    | affiliate123");
  console.log("  ⏳ Pending     → new@truuk.io           | new123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🌐 Run: npm run dev → http://localhost:3000");
  process.exit(0);
}

seed().catch(err => { console.error("❌", err.message); process.exit(1); });
