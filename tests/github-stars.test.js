import test from 'node:test';import assert from 'node:assert/strict';
test('GitHub count falls back to GitHub itself when REST is rate limited, then caches briefly',async()=>{
 const original=global.fetch,urls=[];
 try{
  global.fetch=async url=>{urls.push(String(url));return String(url).startsWith('https://api.github.com/')?{ok:false,status:403}:{ok:true,text:async()=>'<script>{"stargazerCount":12}</script>'}};
  const {githubStars}=await import('../github-stars.js?fallback-test');
  const result=await githubStars();assert.equal(result.count,12);assert.equal(urls.length,2);
  assert.equal((await githubStars()).count,12);assert.equal(urls.length,2);
 }finally{global.fetch=original}
});
test('GitHub count is never invented when upstream returns no usable value',async()=>{
 const original=global.fetch;
 try{global.fetch=async url=>String(url).startsWith('https://api.github.com/')?{ok:false,status:403}:{ok:true,text:async()=>'<html>Unavailable</html>'};
  const {githubStars}=await import('../github-stars.js?no-count-test');await assert.rejects(githubStars(),/GitHub count unavailable/);
 }finally{global.fetch=original}
});
