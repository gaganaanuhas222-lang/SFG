export class CustomError extends Error {
    private safe_message : string = ""
    public setSafeMessage (message : string){
        this.safe_message;
    }
    public getSafeMesassage() : string{return this.safe_message};
}
