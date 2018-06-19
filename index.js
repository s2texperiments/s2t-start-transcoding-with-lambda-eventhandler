let snsApi = require('./snsApi.js');


exports.handler = async (event) => {


    console.log(`REQUEST: ${JSON.stringify(event)}`);

    const CODEC = process.env['CODEC'];
    const EXTENSION = process.env['EXTENSION'] || ".ogg";
    const TOPIC_ARN = process.env['TOPIC_ARN'];

    let {
        Records: [{
            Sns: {
                MessageAttributes: {
                    bucket: {
                        Value: bucket
                    },
                    key: {
                        Value: key
                    },
                    "transcribe-provider":{
                        Value: provider
                    },
                    "api-key-id":{
                        Value: apiKeyId
                    },
                    "pid":{
                        Value: pid
                    }
                }
            }
        }]
    } = event;




    return snsApi.publish({
        Message: JSON.stringify({
            in:{
                bucket:bucket,
                key:key
            },
            out:{
                bucket:bucket,
                key:`${provider}/transcoded/${apiKeyId}/${pid}${EXTENSION}`,
                codec:CODEC
            }
        }),
        TopicArn: process.env['TOPIC_ARN']
    });
};