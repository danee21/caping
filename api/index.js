export default async function handler(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,error:'Method not allowed'});}
 const url=process.env.APPS_SCRIPT_URL,secret=process.env.APPS_SCRIPT_TOKEN;
 if(!url||!secret)return res.status(500).json({ok:false,error:'Environment APPS_SCRIPT_URL / APPS_SCRIPT_TOKEN belum diatur.'});
 try{
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  const payload={...body,serverToken:secret,session:body.action==='login'?undefined:(req.headers.authorization||'').replace(/^Bearer\s+/i,'')};
  const upstream=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),redirect:'follow'});
  const data=await upstream.json();return res.status(200).json(data);
 }catch(e){return res.status(502).json({ok:false,error:'Gagal menghubungi Apps Script: '+e.message});}
}