
const NullChecker = (...args:any[]) => {
  let result = false;

  for(let i = 0; i < args.length; i++){
    //console.log(arguments[i]);
    if(args[i] === undefined) result = true;
  }
  return result;
};

module.exports = NullChecker;