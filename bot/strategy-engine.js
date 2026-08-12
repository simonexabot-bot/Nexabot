'use strict';
const PROFILES={conservative_v1:{target:0.006,stop:0.004},balanced_v1:{target:0.01,stop:0.007},growth_v1:{target:0.03,stop:0.02}};
function ema(values,length){if(values.length<length)return null;const k=2/(length+1);let value=values.slice(0,length).reduce((a,b)=>a+b,0)/length;for(const price of values.slice(length))value=price*k+value*(1-k);return value}
function mean(values){return values.reduce((a,b)=>a+b,0)/values.length}
function deviation(values){const m=mean(values);return Math.sqrt(values.reduce((s,x)=>s+(x-m)**2,0)/values.length)}
function evaluate(candles,profileCode,position=null){
 if(!PROFILES[profileCode])throw new Error('Unknown strategy profile');if(!Array.isArray(candles)||candles.length<60)return{trend:'neutral',signal:'hold',reason:'insufficient_data'};
 const closes=candles.map(x=>Number(x.close)),highs=candles.map(x=>Number(x.high)),lows=candles.map(x=>Number(x.low)),price=closes.at(-1),fast=ema(closes,5),slow=ema(closes,13),regime=ema(closes,50),basis=(ema(closes,8)+ema(closes,16))/2,vol=deviation(closes.slice(-8)),upper=basis+vol*2,lower=basis-vol*2,priorHigh=Math.max(...highs.slice(-41,-1)),priorLow=Math.min(...lows.slice(-41,-1));
 const emaBull=fast>slow&&price>regime,emaBear=fast<slow&&price<regime,flowBull=price>upper,flowBear=price<lower,breakoutBull=price>priorHigh,breakoutBear=price<priorLow;
 let trend='neutral';if(emaBull&&(flowBull||profileCode==='conservative_v1'))trend='bullish';if(emaBear&&(flowBear||profileCode==='conservative_v1'))trend='bearish';if(profileCode==='growth_v1'&&breakoutBull)trend='bullish';if(profileCode==='growth_v1'&&breakoutBear)trend='bearish';
 const profile=PROFILES[profileCode];if(position){const change=(price-position.entryPrice)/position.entryPrice;if(change>=profile.target)return{trend,signal:'exit',reason:'take_profit',price,targetPrice:position.entryPrice*(1+profile.target),stopPrice:position.entryPrice*(1-profile.stop)};if(change<=-profile.stop)return{trend,signal:'exit',reason:'stop_loss',price,targetPrice:position.entryPrice*(1+profile.target),stopPrice:position.entryPrice*(1-profile.stop)};if(trend==='bearish')return{trend,signal:'exit',reason:'bearish_reversal',price};return{trend,signal:'hold',reason:'position_open',price}}
 if(trend==='bullish')return{trend,signal:'enter_long',reason:'filtered_trend_confirmation',price,targetPrice:price*(1+profile.target),stopPrice:price*(1-profile.stop)};
 return{trend,signal:'hold',reason:trend==='bearish'?'spot_shorting_disabled':'no_confirmed_setup',price};
}
module.exports={evaluate,PROFILES};
