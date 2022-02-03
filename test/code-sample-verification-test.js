const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const assert = chai.assert;
const uuid = require('uuid/v4');
const localDynamoDbUtils = require('./dynamodb-local/dynamodb-local-util');

const { expect } = chai;
chai.use(chaiAsPromised);

// software under test
const readData = require('./../src/read-data');
const writeData = require('./../src/write-data');

describe('the code sample', function () {
  this.timeout(10000);

  // This is the test that you want to pass
  it('saves data to DynamoDB and then it can be read', async function () {
    const schoolId = uuid();
    const studentId = uuid();

    const schoolStudent = {
      schoolId: schoolId,
      schoolName: 'Code Sample Academy',
      studentId: studentId,
      studentFirstName: 'Jane',
      studentLastName: 'Doe',
      studentGrade: '8',
    };

    await writeData.handler(schoolStudent);

    const query = {
      schoolId: schoolId,
      studentId: studentId,
    };
    const queryResult = await readData.handler(query);

    assert.isTrue(Array.isArray(queryResult), 'Expected queryResult to be of type Array');
    assert.equal(queryResult.length, 1, 'Expected to find one result');
    assert.deepEqual(queryResult[0], schoolStudent, 'Expected the query result to match what we saved');
  });

  // TODO (extra credit) enable this test if you implement the GSI query in src/read-data.js
  it('(extra credit) can query for SchoolStudent records by studentLastName', async function () {
    const schoolId = uuid();
    const studentId = uuid();

    const schoolStudent = {
      schoolId: schoolId,
      schoolName: 'NWEA Test School',
      studentId: studentId,
      studentFirstName: 'John',
      studentLastName: 'Robertson',
      studentGrade: '5',
    };

    await writeData.handler(schoolStudent);

    const query = {
      studentLastName: schoolStudent.studentLastName,
    };
    const queryResult = await readData.handler(query);

    assert.isTrue(Array.isArray(queryResult), 'Expected queryResult to be of type Array');
    assert.equal(queryResult.length, 1, 'Expected to find one result');
    assert.deepEqual(queryResult[0], schoolStudent, 'Expected the query result to match what we saved');
  });

  // TODO uncomment this test if you implement retrieval of multiple pages of data
  it('returns all pages of data', async function () {
    let createdRecords = 0;
    const schoolId = uuid();
    while (createdRecords++ < 10) {
      await writeData.handler({
        schoolId: schoolId,
        schoolName: 'NWEA Test School ' + createdRecords,
        studentId: uuid(),
        studentFirstName: 'Dan',
        studentLastName: 'Danny the ' + createdRecords,
        studentGrade: '3',
      });
    }

    const query = {
      schoolId: schoolId,
    };
    const queryResult = await readData.handler(query);
    assert.isTrue(Array.isArray(queryResult), 'Expected queryResult to be of type Array');
    assert.equal(queryResult.length, 10, 'Expected to find ten results');
  });

  //-------------------------
  // Additional test cases.
  //-------------------------

  it('saves data to DynamoDB and then attempts to find a different student than what was saved', async function () {
    const schoolId = uuid();
    const studentId = uuid();

    const schoolStudent = {
      schoolId: schoolId,
      schoolName: 'Code Sample Academy',
      studentId: studentId,
      studentFirstName: 'Jane',
      studentLastName: 'Doe',
      studentGrade: '8',
    };

    await writeData.handler(schoolStudent);

    const query = {
      schoolId: schoolId,
      studentId: 'notarealstudent',
    };
    const queryResult = await readData.handler(query);

    assert.isTrue(Array.isArray(queryResult), 'Expected queryResult to be of type Array');
    assert.equal(queryResult.length, 0, 'Expected to find no results');
  });

  it('writeData fails if school id parameter is missing.', async function () {
    // const schoolId = uuid();
    const studentId = uuid();

    let schoolStudent = {
      //schoolId: schoolId,
      schoolName: 'Code Sample Academy',
      studentId: studentId,
      studentFirstName: 'Jane',
      studentLastName: 'Doe',
      studentGrade: '8',
    };

    return expect(writeData.handler(schoolStudent))
      .to.eventually.be.rejectedWith('No school id given.');
  });

  it('writeData fails if school name parameter is missing.', async function () {
    const schoolId = uuid();
    const studentId = uuid();

    let schoolStudent = {
      schoolId: schoolId,
      // schoolName: 'Code Sample Academy',
      studentId: studentId,
      studentFirstName: 'Jane',
      studentLastName: 'Doe',
      studentGrade: '8',
    };

    return expect(writeData.handler(schoolStudent))
      .to.eventually.be.rejectedWith('No school name given.');
  });

  it('writeData fails if student id parameter is missing.', async function () {
    const schoolId = uuid();
    // const studentId = uuid();

    let schoolStudent = {
      schoolId: schoolId,
      schoolName: 'Code Sample Academy',
      // studentId: studentId,
      studentFirstName: 'Jane',
      studentLastName: 'Doe',
      studentGrade: '8',
    };

    return expect(writeData.handler(schoolStudent))
      .to.eventually.be.rejectedWith('No student id given.');
  });

  it('writeData fails if student first name parameter is missing.', async function () {
    const schoolId = uuid();
    const studentId = uuid();

    let schoolStudent = {
      schoolId: schoolId,
      schoolName: 'Code Sample Academy',
      studentId: studentId,
      // studentFirstName: 'Jane',
      studentLastName: 'Doe',
      studentGrade: '8',
    };

    return expect(writeData.handler(schoolStudent))
      .to.eventually.be.rejectedWith('No student first name given.');
  });

  it('writeData fails if student last name parameter is missing.', async function () {
    const schoolId = uuid();
    const studentId = uuid();

    let schoolStudent = {
      schoolId: schoolId,
      schoolName: 'Code Sample Academy',
      studentId: studentId,
      studentFirstName: 'Jane',
      // studentLastName: 'Doe',
      studentGrade: '8',
    };

    return expect(writeData.handler(schoolStudent))
      .to.eventually.be.rejectedWith('No student last name given.');
  });

  it('writeData fails if student grade parameter is missing.', async function () {
    const schoolId = uuid();
    const studentId = uuid();

    let schoolStudent = {
      schoolId: schoolId,
      schoolName: 'Code Sample Academy',
      studentId: studentId,
      studentFirstName: 'Jane',
      studentLastName: 'Doe',
      // studentGrade: '8',
    };

    return expect(writeData.handler(schoolStudent))
      .to.eventually.be.rejectedWith('No student grade given.');
  });

  it('readData fails if no school id or student last name parameter is given.', async function () {
    // searching for school students by school name is not supported.
    let schoolStudent = {
      schoolName: 'Code Sample Academy',
    };

    return expect(readData.handler(schoolStudent))
      .to.eventually.be.rejectedWith('A school id or student last name must be given.');
  });

  //-------------------------
  // End additional test cases.
  //-------------------------

  // This section starts the local DynamoDB database
  before(async function () {
    await localDynamoDbUtils.startLocalDynamoDB();

    // create the 'SchoolStudents' DynamoDB table in the locally running database
    const partitionKey = 'schoolId', rangeKey = 'studentId',
      gsiPartitionKey = 'studentLastName', gsiRangeKey = 'studentFirstName';

    const keySchema = [
      { AttributeName: partitionKey, KeyType: "HASH" },
      { AttributeName: rangeKey, KeyType: "RANGE" },
    ];
    const attributeDefinitions = [
      { AttributeName: partitionKey, AttributeType: "S"},
      { AttributeName: rangeKey, AttributeType: "S" },
      { AttributeName: gsiPartitionKey, AttributeType: "S" },
      { AttributeName: gsiRangeKey, AttributeType: "S" },
    ];
    const gsis = [
      localDynamoDbUtils.buildGlobalSecondaryIndex('studentLastNameGsi', [
        {AttributeName: gsiPartitionKey, KeyType: "HASH"},
        {AttributeName: gsiRangeKey, KeyType: "RANGE"}]),
    ];

    await localDynamoDbUtils.createTable('SchoolStudents', keySchema, attributeDefinitions, gsis);
  });

  after(function () {
    localDynamoDbUtils.stopLocalDynamoDB();
  });

});