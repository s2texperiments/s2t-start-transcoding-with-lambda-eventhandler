let snsApi = require('./snsApi.js');


exports.handler = async (event) => {


    console.log(`REQUEST: ${JSON.stringify(event)}`);

    const CODEC = process.env['CODEC'];
    const EXTENSION = process.env['EXTENSION'] || ".ogg";
    const TOPIC_ARN = process.env['TOPIC_ARN'];
    const DEST = process.env['DEST'] || "transcoded-audio";

    const TRIM_ENABLED = process.env['TRIM_ENABLED'] || false;
    const TRIM_FROM = process.env['TRIM_FROM'] || 0;
    const TRIM_TO = process.env['TRIM_TO'] || 180;

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
                key: `${DEST}/${apiKeyId}/${pid}${EXTENSION}`,
                codec: CODEC,
                trimEnabled: JSON.parse(TRIM_ENABLED),
                trimFrom: parseInt(TRIM_FROM,10),
                trimTo: parseInt(TRIM_TO,10)
            }
        }),
        TopicArn: TOPIC_ARN
    });
};