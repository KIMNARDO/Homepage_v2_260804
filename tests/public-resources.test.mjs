import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(resolve(root, 'server.cjs'));
const context = {require: name => name==='node:http' ? {createServer:()=>({listen:()=>{}})} : req(name),__dirname:root,process:{env:{}},console,Buffer,URL,URLSearchParams,setTimeout,clearTimeout};
vm.createContext(context);
vm.runInContext(readFileSync(resolve(root,'server.cjs'),'utf8'),context);
const catalog = JSON.parse(readFileSync(resolve(root,'public-resources.json'),'utf8'));
test('Only reviewed product summaries are in the deployment brochure directory',()=>{
 assert.deepEqual(readdirSync(resolve(root,'dist/brochures')).sort(),catalog.map(x=>x.file).sort());
});
test('All reviewed PDFs resolve; retired, internal, malformed and traversal paths do not',()=>{
 for(const item of catalog) assert.ok(context.resolveLeadResource('/brochures/'+encodeURIComponent(item.file)));
 for(const path of ['/brochures/AI_CADWin_브로슈어.pdf','/brochures/Clip3D_Viewer_소개자료.pdf','/brochures/팹스넷_회사소개서.pdf','/brochures/../server.cjs','/brochures/%2e%2e/server.cjs','/brochures/%ZZ','print:solution-brochure']) assert.equal(context.resolveLeadResource(path),null,path);
});
test('Download signatures are scoped to the selected resource and expiry',()=>{
 const file='/brochures/'+catalog[0].file;const expiry=Date.now()+60000;const token=context.createDownloadToken(file,expiry);
 assert.equal(context.isValidDownloadToken(file,expiry,token),true);
 assert.equal(context.isValidDownloadToken('/brochures/'+catalog[1].file,expiry,token),false);
 assert.equal(context.isValidDownloadToken(file,expiry+1,token),false);
 assert.equal(context.isValidDownloadToken(file,Date.now()-1,token),false);
 assert.equal(context.isValidDownloadToken(file,expiry,'bad'),false);
});
test('Each new product has a matching contact form choice and server validation entry',()=>{
 const html=readFileSync(resolve(root,'contact.html'),'utf8');const server=readFileSync(resolve(root,'server.cjs'),'utf8');
 for(const item of catalog){assert.ok(html.includes('value="'+item.product+'"'));assert.ok(server.includes("'"+item.product+"'"));}
});
