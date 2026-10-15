// Supabase email links can land on the configured site URL instead of the intended review page.
// Move the fragment without parsing or storing its bearer token on the public catalog page.
const authHash=location.hash.startsWith('#')?new URLSearchParams(location.hash.slice(1)):null;
const authQuery=new URLSearchParams(location.search);
if(authHash?.has('access_token')||authHash?.has('error')||authQuery.has('token_hash')||authQuery.has('code')||authQuery.has('error')){
  location.replace('/admin.html'+location.search+location.hash);
}
