class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong !",
        errors= [],
        statch = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null // Assignment what is this
        this.message = message
        this.success = false
        this.errors = errors

        if(statch){
            this.stack = statch
        }
        else{
            Error.captureStackTrace(this , this.constructor)
        }
    }
}
export {ApiError}