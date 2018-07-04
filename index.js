let snsApi = require('./snsApi.js');


exports.handler = async (event) => {


    console.log(`REQUEST: ${JSON.stringify(event)}`);

    const CODEC = process.env['CODEC'];
    const EXTENSION = process.env['EXTENSION'] || ".ogg";
    const TOPIC_ARN = process.env['TOPIC_ARN'];
    const DEST = process.env['DEST'] || "transcoded-audio";
    console.log(`ENV SETTINGS: Codec: ${CODEC} EXTENSION: ${EXTENSION} TOPIC_ARN: ${TOPIC_ARN}`);

    if (!CODEC || !TOPIC_ARN) {
        throw "Missing mandatory env var";
    }

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
                    "transcribe-provider": {
                        Value: provider
                    },
                    "api-key-id": {
                        Value: apiKeyId
                    },
                    "pid": {
                        Value: pid
                    }
                }
            }
        }]
    } = event;

    if (!bucket || !key || !provider || !apiKeyId || !pid) {
        throw "Missing sns message attributes (field)";
    }


    return snsApi.publish({
        Message: JSON.stringify({
            in: {
                bucket: bucket,
                key: key
            },
            out: {
                bucket: bucket,
                key: `${provider}/${DEST}/${apiKeyId}/${pid}${EXTENSION}`,
                codec: CODEC
            }
        }),
        TopicArn: TOPIC_ARN
    });
};