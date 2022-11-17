export default class BaseException {
  public message: string;

  public stack: string;

  public error: Error | undefined;

  public codeMessageLanguage: string;

  public statusCode: number;

  constructor(message: string, statusCode:number, codeMessageLanguage: string, error: Error | undefined = undefined){
    this.message = message;
    this.error = error;
    this.statusCode = statusCode;
    // TODO: reemplazar 'codeMessageLanguage' el 'xxxx' por el nombre del proyecto
    this.codeMessageLanguage = codeMessageLanguage;
  }

  toString(): string {
    return this.message;
  }

  toJsonResponse() {
    return { status: "error", message: this.message };
  }
}
