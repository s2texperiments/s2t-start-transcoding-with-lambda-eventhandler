const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const proxyquire = require('proxyquire').noCallThru();
const fake = require('sinon').fake;
const fs = require('fs');
const dotEnv = require('dotenv');
describe('eventhandler', () => {

    let validSNSEvent, missingMessageAttributesSNSEvent;
    let expectedValidSNSResponse, expectedValidSNSResponseOtherEnv;
    let snsPublishFake;
    let underTest;

    beforeEach(() => {

        validSNSEvent = JSON.parse(fs.readFileSync('test/validSNSEvent.json', 'utf8'));
        missingMessageAttributesSNSEvent = JSON.parse(fs.readFileSync('test/missingMessageAttributesSNSEvent.json', 'utf8'));

        expectedValidSNSResponse = JSON.parse(fs.readFileSync('test/expectedValidSNSMessageBodyReponse.json', 'utf8'));
        expectedValidSNSResponseOtherEnv = JSON.parse(fs.readFileSync('test/expectedValidSNSMessageBodyReponseOtherEnv.json', 'utf8'));

        snsPublishFake = fake.resolves("success");

        underTest = proxyquire('../index.js', {
            './snsApi': {
                publish: snsPublishFake
            }
        });
    });

    afterEach(() => {
        process.env = {};
    });

    it('valid sns event should redirect to start-transcoding-with-lambda topic', async () => {
        dotEnv.config({path: "test/.env"});

        await underTest.handler(validSNSEvent);

        let [snsPublishParam] = snsPublishFake.firstCall.args;
        expect(snsPublishParam).to.have.all.keys('Message', 'TopicArn');

        expect(JSON.parse(snsPublishParam.Message)).to.deep.equal(expectedValidSNSResponse);
        expect(snsPublishParam.TopicArn).to.equal('given:arn:from:env')
    });


    it('should use environment settings', async () => {

        dotEnv.config({path: "test/.otherEnv"});

        await underTest.handler(validSNSEvent);

        let [snsPublishParam] = snsPublishFake.firstCall.args;
        expect(snsPublishParam).to.have.all.keys('Message', 'TopicArn');

        expect(JSON.parse(snsPublishParam.Message)).to.deep.equal(expectedValidSNSResponseOtherEnv);
        expect(snsPublishParam.TopicArn).to.equal('given:arn:from:env')
    });


    it('sns event without mandatory message attributes should throw an exception', () => {
        dotEnv.config({path: "test/.env"});
        return expect(underTest.handler(missingMessageAttributesSNSEvent)).be.rejected;
    });


    it('missing mandatory env var should throw an exception', async () => {
        return expect(underTest.handler(validSNSEvent)).be.rejected;
    });
});