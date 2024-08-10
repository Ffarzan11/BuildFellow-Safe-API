import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from 'body-parser';

const firebaseConfig = {
    apiKey: "AIzaSyApv2IWEms-0mIAocTUQHxYQSE78nvYjMk",
    authDomain: "bg-safeapi-af06c.firebaseapp.com",
    projectId: "bg-safeapi-af06c",
    storageBucket: "bg-safeapi-af06c.appspot.com",
    messagingSenderId: "495083304745",
    appId: "1:495083304745:web:e780837a31dc0f60ff6938",
    measurementId: "G-57TKHEW9F7"
  };
admin.initializeApp(firebaseConfig);

// Create Variable for FirestoreDB
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

const app = express();
const main = express();
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));
main.use('/v1', app);

// Creating a function to use it as API connect with firebase resource
export const safeApi = functions.https.onRequest(main);

const axios = require('axios');

function getAppCheckToken(appId: string) {
  return admin.appCheck()
      .createToken(appId);
}

// Create a custom Axios instance with session headers
const axiosWithSession = axios.create({
    headers: {
        'X-Firebase-AppCheck': ''
    }
});

app.post('/login', async (req, res) => {
    try {
        const appCheckTokenResponse = await getAppCheckToken("1:495083304745:web:e780837a31dc0f60ff6938");
        //const appCheckToken = JSON.(appCheckTokenResponse).token;
        const apiKey = "AIzaSyApv2IWEms-0mIAocTUQHxYQSE78nvYjMk"; // Set this environment variable
        const apiUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${apiKey}`;

        const requestData = {
            email: req.body.email,
            password: req.body.password,
            returnSecureToken: true
        };
        const response = await axiosWithSession.post(apiUrl, requestData, {
            headers: {
                'X-Firebase-AppCheck': appCheckTokenResponse.token
            }
        });

        // Make the POST request using the custom Axios instance

        // Send the response data back to the client
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
