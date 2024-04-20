class ApiResponse{
    constructor(statusCode, data, message = "Success"){
        this.statusCode = ststusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400 // search api statuscode
    }
}