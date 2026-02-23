function errorHandler(err, req, res, next) {
    try{
        let error = {...err}
        error.message = err.message
        console.log(err)

        //Mongoose bad ObjectId
        if(err.name === 'CastError'){
            const message = 'Resource not found'
            error = new Error(message)
            error.statusCode = 404;    
        }

        //Mongoose duplicate key
        if(err.code === 11000){
            let message = 'Duplicate field value entered'
            // Extract which field is duplicate from err.keyValue
            if(err.keyValue){
                const duplicateFields = Object.keys(err.keyValue)
                if(duplicateFields.length > 0){
                    const fieldName = duplicateFields[0]
                    const fieldValue = err.keyValue[fieldName]
                    // Capitalize first letter and make it user-friendly
                    const friendlyFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
                    message = `${friendlyFieldName} "${fieldValue}" already exists. Please use a different ${fieldName}.`
                }
            }
            error = new Error(message)
            error.statusCode = 400;
        }

        //Mongoose Validation error
        if(err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(val => val.message)
            error = new Error(message.join(', '))
            error.statusCode = 400;
        }

        res.status(error.statusCode || 500).json({success: false, error: error.message || 'Server Error'})
    }catch(error){
        next(error)
    }
}

export default errorHandler