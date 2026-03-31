const bcrypt = require('bcrypt');

async function test() {
  const hash = await bcrypt.hash('17Feb1981', 10);
  console.log("Newly generated hash:", hash);
  
  const h = '$2b$10$TirdIQj/fbtW1qK3LAX9.uX/rEbHZApL4EE6jwfZosSNFnJov6S.q';
  console.log("Checking against old hash:", await bcrypt.compare('17Feb1981', h));
  console.log("Checking against new hash:", await bcrypt.compare('17Feb1981', hash));
}
test();
