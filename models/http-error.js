class HttpError extends Error {
    constructor(message, errorCode) {
        super(message); //add message prop
        this.code = errorCode; //adds code prop
    }
}

module.exports HttpError;