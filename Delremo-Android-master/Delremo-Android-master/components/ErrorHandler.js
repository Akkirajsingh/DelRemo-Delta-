class APIStatusInfo {
    handleResponse = (response) => {
        
        if (!response.ok) {
            const error = Object.assign({
                status: response.status,
                APISuccess: 1
            });
            return Promise.reject(error);

        }
        return response;
    }

    GetStatusMessage = (statusCode) => {
        let errMsg = "";
        if (statusCode == "400") {
            errMsg = "Bad request error";
        }
        else if (statusCode == "401") {
            errMsg = "Not authorized to view this content/Token Expired";
        }
        else if (statusCode == "404") {
            errMsg = "The server could not find the content requested";
        }
        else if (statusCode == "403") {
            errMsg = 'Looks like User does not exist or You have entered Incorrect Email/Password';
        }
        else if (statusCode == "500") {
            errMsg = "Records not fetched";
        }
        else {
            errMsg = "Service is down, Please try again after some time ";
        }
        return errMsg;
    }
    logError = (err) => {

        if (err.hasOwnProperty("APISuccess")) {


            return this.GetStatusMessage(err.status.toString());

        }
        else return "";
    }

}
const aPIStatusInfo = new APIStatusInfo();
export default aPIStatusInfo