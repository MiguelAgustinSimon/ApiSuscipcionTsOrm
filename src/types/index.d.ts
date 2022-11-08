export {};
//https://bobbyhadz.com/blog/typescript-property-does-not-exist-on-type-request#:~:text=The%20%22Property%20does%20not%20exist,access%20on%20the%20request%20object.
declare global {
  namespace Express {
    interface Request {
      token: string; //sirve para poner el req.token en el middleware
    }
  }
}