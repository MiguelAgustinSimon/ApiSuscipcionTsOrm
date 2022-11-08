const UUIDChecker = (UUID:any) => {
  let count = 0;

  const uuid = UUID.toString();
  for(let i = 0; i < uuid.length; i++){
    //console.log(uuid[i]);
    if(uuid[i] != '-') count++;
  }
  return (count == 32);
};

module.exports = UUIDChecker;