import mongoose from"mongoose";
const ApiKeySchema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},name:{type:String,required:true},key:{type:String,required:true,unique:true},prefix:{type:String},permissions:[{type:String,enum:["read","write","conversions","reports"]}],lastUsed:{type:Date},expiresAt:{type:Date},isActive:{type:Boolean,default:true},requestCount:{type:Number,default:0}},{timestamps:true});
export default mongoose.models.ApiKey||mongoose.model("ApiKey",ApiKeySchema);
