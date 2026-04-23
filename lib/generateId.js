const CHARS="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateShortId(prefix,length=6){let id="";for(let i=0;i<length;i++){id+=CHARS[Math.floor(Math.random()*CHARS.length)];}return`${prefix}${id}`;}
export function generateAdvertiserId(){return generateShortId("ADV",6);}
export function generatePublisherId(){return generateShortId("PUB",6);}
export function generateCampaignId(){return generateShortId("CAMP",5);}
